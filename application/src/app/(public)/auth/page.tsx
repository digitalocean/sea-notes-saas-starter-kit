// Import our main Clerk auth component
import ClerkAuthPage from 'components/Public/AuthPage/ClerkAuthPage';
import React from 'react';

/**
 * Unified authentication page with Clerk integration
 * This is the main entry point for all authentication flows
 * It provides sign-in and sign-up functionality with social providers
 * 
 * We're using a separate component (ClerkAuthPage) to keep this file simple
 * and allow for easier testing/mocking if needed
 */
export default function AuthRoutePage() {
  return <ClerkAuthPage />;
}