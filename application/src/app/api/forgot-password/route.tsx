// Next.js and utility imports
import { NextRequest, NextResponse } from 'next/server';
import { createEmailService } from 'services/email/emailFactory';
import { createDatabaseService } from 'services/database/databaseFactory';
import { v4 as uuidv4 } from 'uuid';
import { ActionButtonEmailTemplate } from 'services/email/templates/ActionButtonEmail';
import { HTTP_STATUS } from 'lib/api/http';
import { serverConfig } from 'settings';

/**
 * API route handler for requesting a password reset email
 * If the user exists, generates a reset token, stores it, and sends a reset email
 * Always returns success for security, even if the user does not exist
 * This endpoint is called when a user submits the forgot password form
 */
export async function POST(req: NextRequest) {
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
      console.error('Forgot password email not configured');
      return NextResponse.json(
        { error: 'Email not configured or connected. Check System Status page' },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }

    // Parse email from request body
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Get database client
    const db = await createDatabaseService();
    
    // Check if user exists
    const user = await db.user.findByEmail(email);
    if (!user) {
      // For security, do not reveal if user exists
      // Always return success even if user doesn't exist
      return NextResponse.json({ success: true });
    }

    // Generate a unique token that expires in 1 hour
    const token = uuidv4();
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store the token in the database
    await db.verificationToken.create({
      identifier: email,
      token,
      expires,
    });

    // Generate the reset URL
    const resetUrl = `${serverConfig.baseURL}/reset-password?token=${token}`;
    
    // Send the reset email to the user
    await emailService.sendReactEmail(
      email,
      'Reset your password',
      <ActionButtonEmailTemplate
        title="Reset your password"
        buttonUrl={resetUrl}
        buttonText="Reset Password"
        greetingText="Hello! We received a request to reset the password for your account."
        infoText="If you did not request this, you can safely ignore this email."
        fallbackText="If the button above does not work, copy and paste the following link into your browser:"
        fallbackUrlLabel={resetUrl}
      />
    );

    // Always return success for security reasons
    return NextResponse.json({ success: true });
  } catch (error) {
    // Log error and return generic error response
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Internal server error' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}