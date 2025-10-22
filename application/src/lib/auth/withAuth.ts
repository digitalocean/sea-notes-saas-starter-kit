// Auth and Next.js imports
import { auth } from 'lib/auth/auth';
import { NextRequest, NextResponse } from 'next/server';
import { ErrorResponse, HTTP_STATUS } from '../api/http';
import { UserRole } from 'types';

/**
 * Options for the withAuth middleware
 */
export type WithAuthOptions = {
  allowedRoles?: UserRole[];
};

/**
 * Type for API route handlers
 */
type Handler = (
  req: NextRequest,
  user: { id: string; role: UserRole; email: string },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: Promise<any>
) => Promise<Response>;

/**
 * Higher-order function to wrap API route handlers with authentication and optional role-based authorization
 * This ensures that only authenticated users (and those with the right roles) can access protected endpoints
 * 
 * @param handler - The API route handler function to wrap
 * @param options - Optional configuration for allowed user roles
 */
export const withAuth =
  (handler: Handler, options: WithAuthOptions = {}) =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async (req: NextRequest, { params }: { params: Promise<any> }): Promise<Response> => {
    try {
      // Get the user's session
      const session = await auth();

      // Check if user is authenticated
      if (!session || !session.user?.id || !session.user?.role) {
        const res: ErrorResponse = { error: 'Unauthorized' };
        return NextResponse.json(res, { status: HTTP_STATUS.UNAUTHORIZED });
      }

      // Extract user information
      const { id, role, email } = session.user;

      // Check if user has the required role (if specified)
      if (options.allowedRoles && !options.allowedRoles.includes(role)) {
        const res: ErrorResponse = { error: 'Forbidden' };
        return NextResponse.json(res, { status: HTTP_STATUS.FORBIDDEN });
      }

      // Call the original handler with user info
      return await handler(req, { id, role, email }, params);
    } catch (error: unknown) {
      // Log any errors that occur during auth
      if (error instanceof Error) {
        console.error('Auth error:', error.message);
      } else {
        console.error('Unknown auth error:', error);
      }

      // Return a generic error response
      const res: ErrorResponse = { error: 'Internal server error' };
      return NextResponse.json(res, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
    }
  };