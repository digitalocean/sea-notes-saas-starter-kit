// Next.js and utility imports
import { NextRequest, NextResponse } from 'next/server';
import { createDatabaseService } from 'services/database/databaseFactory';
import { HTTP_STATUS } from 'lib/api/http';
import { createEmailService } from 'services/email/emailFactory';
import { v4 as uuidv4 } from 'uuid';
import { ActionButtonEmailTemplate } from 'services/email/templates/ActionButtonEmail';
import { serverConfig } from 'settings';

/**
 * API endpoint to send a magic link for user login
 * Accepts an email address, generates a verification token, and sends an email with the login link
 *
 * Request body:
 *   - email: string (required)
 *
 * Response:
 *   - 200: { ok: true, token: string }
 *   - 400: { error: string }
 *   - 404: { error: 'User not found' }
 *   - 500: { error: string }
 * 
 * This endpoint is called when a user requests a magic link for passwordless authentication
 */
export async function POST(request: NextRequest) {
  try {
    // Get email service
    const emailService = await createEmailService();

    // Check if email service is enabled
    if (!emailService.isEmailEnabled()) {
      return NextResponse.json(
        { error: 'Email feature is disabled' },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }

    // Check email service configuration
    const emailStatus = await emailService.checkConfiguration();

    // Make sure email is properly configured and connected
    if (!emailStatus.configured || !emailStatus.connected) {
      console.error('Magic link email not configured');
      return NextResponse.json(
        { error: 'Email not configured or connected. Check System Status page' },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }

    // Parse email from request body
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: HTTP_STATUS.BAD_REQUEST });
    }

    // Get database client
    const db = await createDatabaseService();
    
    // Check if user exists
    const user = await db.user.findByEmail(email);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: HTTP_STATUS.NOT_FOUND });
    }

    // Generate a random token that expires in 1 hour
    const token = uuidv4();
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    
    // Store the token in the verificationToken table
    await db.verificationToken.create({ identifier: email, token, expires });

    // Generate the magic link URL
    const verifyUrl = `${serverConfig.baseURL}/magic-link?token=${token}&email=${encodeURIComponent(email)}`;
    
    // Send the magic link email to the user
    await emailService.sendReactEmail(
      user.email,
      'Login to your account',
      <ActionButtonEmailTemplate
        title="Login to your account"
        buttonUrl={verifyUrl}
        buttonText="Login"
        greetingText="Hi, You can login to your SeaNotes account by clicking the button below:"
        fallbackText="If the button above does not work, copy and paste the following link into your browser:"
        fallbackUrlLabel={verifyUrl}
      />
    );

    // Return success response with token
    return NextResponse.json({ ok: true, token });
  } catch (error) {
    // Return error response
    return NextResponse.json(
      { error: (error as Error).message || 'Internal server error' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}