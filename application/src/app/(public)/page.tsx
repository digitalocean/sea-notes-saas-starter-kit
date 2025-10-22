// Next.js navigation import
import { redirect } from 'next/navigation';

/**
 * Home page component - redirects to auth page
 * We don't have a landing page, so we redirect users directly to authentication
 * This keeps the user flow simple and focused
 */
export default function Home() {
  // Redirect to auth page as the main entry point
  // All users need to authenticate, so we send them straight to the auth flow
  redirect('/auth');
}