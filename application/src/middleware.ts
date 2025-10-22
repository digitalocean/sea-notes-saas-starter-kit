import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Define which routes need authentication
// Dashboard and admin areas should be protected
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/admin(.*)',
]);

// Main middleware function - Clerk handles the authentication
export default clerkMiddleware(async (auth, req) => {
  // If user is trying to access a protected route, make sure they're authenticated
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

// This tells Next.js which routes the middleware should run on
// We want it to run on most routes except static files
export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};