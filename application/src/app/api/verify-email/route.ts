import { NextRequest, NextResponse } from 'next/server';
import { DatabaseClient } from 'services/database/database';
import { HTTP_STATUS } from 'lib/api/http';
import { SubscriptionPlanEnum, SubscriptionStatusEnum, User } from 'types';
import { createDatabaseService } from 'services/database/databaseFactory';
import { createBillingService } from 'services/billing/billingFactory';

const createSubscription = async (db: DatabaseClient, user: User) => {
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
 * API endpoint to verify a user's email address using a verification token.
 * Finds the user by the provided token, marks the email as verified, and clears the token.
 * Returns a success or error response depending on the outcome.
 *
 * Query parameters:
 *   - token: string (required)
 *
 * Response:
 *   - 200: { success: true }
 *   - 400: { error: string }
 */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: HTTP_STATUS.BAD_REQUEST });
  }
  const db = await createDatabaseService();
  // Find user by verification token
  const user = await db.user.findByVerificationToken(token);
  if (!user) {
    return NextResponse.json(
      { error: 'Invalid or expired token' },
      { status: HTTP_STATUS.BAD_REQUEST }
    );
  }
  // Mark email as verified and clear the token
  await db.user.update(user.id, { emailVerified: new Date(), verificationToken: null });

  try {
    await createSubscription(db, user);
  } catch (error) {
    console.error('Error creating subscription', (error as { message: string }).message ?? error);
    return NextResponse.json(
      { error: 'Error creating subscription' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }

  return NextResponse.json({ success: true });
}
