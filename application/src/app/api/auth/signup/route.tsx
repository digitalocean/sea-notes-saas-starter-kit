import { NextRequest, NextResponse } from 'next/server';
import { hashPassword } from 'helpers/hash';
import { USER_ROLES } from 'lib/auth/roles';
import { v4 as uuidv4 } from 'uuid';
import { HTTP_STATUS } from 'lib/api/http';
import { createDatabaseService } from 'services/database/databaseFactory';
import { createEmailService } from 'services/email/emailFactory';
import { ActionButtonEmailTemplate } from 'services/email/templates/ActionButtonEmail';
import { serverConfig } from 'settings';
import { DatabaseClient } from 'services/database/database';
import { SubscriptionPlanEnum, SubscriptionStatusEnum, User } from 'types';
import { createBillingService } from 'services/billing/billingFactory';

/**
 * Creates a subscription for the user if they don't already have one.
 * 
 * This function ensures that a user has an active subscription in the system.
 * If the user does not already have a subscription, it will create a new subscription
 * and associate it with the user.
 *
 * @param {DatabaseClient} db - The database client used to interact with the database.
 * @param {User} user - The user for whom the subscription is being created.
 * 
 * @returns {Promise<void>} - A promise that resolves when the subscription has been created.
 */
export const createSubscription = async (db: DatabaseClient, user: User) => {
  const billingService = await createBillingService();

  const configurationCheck = await billingService.checkConfiguration();

  if (!configurationCheck.configured || !configurationCheck.connected) {
    console.error(
      'Billing service is not properly configured. Please check the system-status page'
    );
    return;
  }

  let customerId;

  const subscription = await db.subscription.findByUserId(user.id);

  if (subscription.length) {
    customerId = subscription[0].customerId;
  }

  if (!customerId) {
    const customer = await billingService.createCustomer(user.email, {
      userId: user.email,
    });
    customerId = customer.id;
    await db.subscription.create({
      customerId: customer.id,
      plan: null,
      status: null,
      userId: user.id,
    });
  }

  await billingService.createSubscription(customerId, SubscriptionPlanEnum.FREE);

  await db.subscription.update(user.id, {
    status: SubscriptionStatusEnum.PENDING,
    plan: SubscriptionPlanEnum.FREE,
  });
};

/**
 * API endpoint for user registration. Creates a new user, sends a verification email with a secure token,
 * and returns a success or error response. Handles duplicate users and missing fields. The verification email
 * uses a branded HTML template and includes a styled button for verification.
 *
 * Request body:
 *   - name: string (required)
 *   - email: string (required)
 *   - password: string (required)
 *
 * Response:
 *   - 200: { ok: true, message: string }
 *   - 400: { error: string }
 *   - 409: { error: string }
 *   - 500: { error: string }
 */
export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    const dbClient = await createDatabaseService();
    const userCount = await dbClient.user.count();
    const isFirstUser = userCount === 0;

    const userExists = await dbClient.user.findByEmail(email);
    if (userExists) {
      return NextResponse.json({ error: 'User already exists' }, { status: HTTP_STATUS.CONFLICT });
    }

    const emailService = await createEmailService();
    const isEmailEnabled = emailService.isEmailEnabled();
    const hashedPassword = await hashPassword(password);
    const verificationToken = !isEmailEnabled ? null : uuidv4();

    const user = await dbClient.user.create({
      name,
      email,
      image: null,
      passwordHash: hashedPassword,
      role: isFirstUser ? USER_ROLES.ADMIN : USER_ROLES.USER,
      verificationToken,
      emailVerified: !isEmailEnabled,
    });

    // Skip email sending if email verification is disabled
    if (isEmailEnabled) {
      const verifyUrl = `${serverConfig.baseURL}/verify-email?token=${verificationToken}`;
      await emailService.sendReactEmail(
        user.email,
        'Verify your email address',
        <ActionButtonEmailTemplate
          title="Verify your email address"
          buttonUrl={verifyUrl}
          buttonText="Verify Email"
          greetingText="Hello! Thank you for signing up."
          infoText="Please verify your email address by clicking the button below:"
          fallbackText="If the button above does not work, copy and paste the following link into your browser:"
          fallbackUrlLabel={verifyUrl}
        />
      );
    }

    // As email verification is disabled, we need to create the subscription for the user here
    if (!isEmailEnabled) {
      await createSubscription(dbClient, user);
    }

    const message = isEmailEnabled
      ? 'Verification email sent.'
      : 'Account created. You can now log in.';

    return NextResponse.json({ ok: true, message });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || 'Internal server error' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}
