'use client';

// React and Next.js imports
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';

/**
 * MagicLinkVerifier
 *
 * This component verifies a magic link for passwordless authentication
 * It reads the token and email from the URL query parameters,
 * calls the signIn function with the credentials provider,
 * and redirects the user to the home page on success
 * Displays loading, success, and error states to the user
 * 
 * This component is rendered when a user clicks on a magic link from their email
 */
export default function MagicLinkVerifier() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [error, setError] = useState<string | null>(null);

  // Effect to verify the magic link when component mounts
  useEffect(() => {
    // Get token and email from URL parameters
    const token = searchParams.get('token');
    const email = searchParams.get('email');
    
    // Validate that we have both token and email
    if (!token || !email) {
      setStatus('error');
      setError('Missing token or email in the URL.');
      return;
    }

    /**
     * Verify the magic link by signing in with credentials provider
     * This uses the magicLinkToken to authenticate the user
     */
    const verifyMagicLink = async () => {
      try {
        // Sign in using the credentials provider with magic link token
        await signIn('credentials', { email, magicLinkToken: token, redirect: false });
        
        // Update status and redirect to home page
        setStatus('success');
        router.replace('/');
      } catch (err) {
        // Handle verification errors
        setStatus('error');
        setError(
          'Failed to verify magic link. ' + (err instanceof Error ? err.message : 'Unknown error')
        );
      }
    };

    // Start the verification process
    verifyMagicLink();
  }, [router, searchParams]);

  // Render appropriate UI based on verification status
  return (
    <div style={{ maxWidth: 400, margin: '0 auto', padding: 32 }}>
      {status === 'verifying' && <div>Verifying magic link...</div>}
      {status === 'success' && <div>Login successful! Redirecting...</div>}
      {status === 'error' && <div style={{ color: 'red' }}>Error: {error}</div>}
    </div>
  );
}