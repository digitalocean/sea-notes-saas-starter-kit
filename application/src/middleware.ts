import { NextResponse, NextRequest } from 'next/server';
import { auth } from 'lib/auth/auth';
import { UserRole } from 'types';
import { USER_ROLES } from 'lib/auth/roles';

const ROLE_HOME_URL: Record<UserRole, string> = {
  [USER_ROLES.USER]: '/dashboard/my-notes',
  [USER_ROLES.ADMIN]: '/dashboard/my-notes',
};

/**
 * Middleware to handle authentication and role-based redirects.
 * @returns A NextResponse object for redirection or continuation.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await auth();
  const isLoggedIn = !!session?.user;
  const role = session?.user?.role as UserRole;

  if (pathname === '/' && isLoggedIn && role) {
    return NextResponse.redirect(new URL(ROLE_HOME_URL[role], request.url));
  }

  if (pathname.startsWith('/dashboard') && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isLoggedIn && role && (pathname === '/login' || pathname === '/signup')) {
    return NextResponse.redirect(new URL(ROLE_HOME_URL[role] ?? '/', request.url));
  }

  if (pathname.startsWith('/admin') && role !== USER_ROLES.ADMIN) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/login', request.url));
    } else {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/signup',
    '/dashboard',
    '/dashboard/:path*',
    '/admin',
    '/admin/:path*',
    '/system-status',
    '/api/system-status',
    '/api/health',
    '/api/billing/:path*',
  ],
};
