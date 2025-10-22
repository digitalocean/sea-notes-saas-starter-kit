// Next.js imports
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createDatabaseService } from 'services/database/databaseFactory';

/**
 * API route handler for resetting a user's password using a token
 *
 * Expects a POST request with a JSON body containing:
 *   - token: The password reset token
 *   - password: The new password
 *
 * Validates the token, updates the user's password, deletes the token, and returns a JSON response
 * This endpoint is called when a user clicks on a password reset link from their email
 */
export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const { token, password } = await req.json();
    
    // Validate required fields
    if (!token || !password) {
      return NextResponse.json({ error: 'Token and password are required' }, { status: 400 });
    }

    // Get database client
    const db = await createDatabaseService();

    // Find the verification token in the database
    const verificationToken = await db.verificationToken.findByToken(token);
    
    // Check if token exists and hasn't expired
    if (!verificationToken || verificationToken.expires < new Date()) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Update the user's password in the database
    await db.user.updateByEmail(verificationToken.identifier, { passwordHash: hashedPassword });

    // Delete the used token so it can't be used again
    await db.verificationToken.delete(verificationToken.identifier, token);

    // Return success response
    return NextResponse.json({ success: true });
  } catch (error) {
    // Log error and return generic error response
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}