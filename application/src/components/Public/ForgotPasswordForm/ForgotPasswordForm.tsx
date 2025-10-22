'use client';

// React and MUI imports
import React, { useState } from 'react';
import { Card, CardContent, TextField, Typography, Box, Button } from '@mui/material';
import FormButton from 'components/Public/FormButton/FormButton';
import { useNavigating } from 'hooks/navigation';

/**
 * Forgot Password form
 * Handles sending email for password reset and passwordless authentication (magic link)
 * 
 * This form allows users to either reset their password via email link
 * or sign in using a magic link sent to their email
 */
export default function ForgotPasswordForm() {
  // Form state
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [magicLinkSuccess, setMagicLinkSuccess] = useState<string | null>(null);
  const { setNavigating } = useNavigating();

  /**
   * Handle password reset form submission
   * Sends a password reset email to the user
   */
  const handleSubmit = async (e: React.FormEvent) => {
    setNavigating(true);
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      // Send password reset request to API
      const res = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      const data = await res.json();
      
      // Handle API response
      if (!res.ok || data.error) {
        setError(data.error || 'Something went wrong, please try again later.');
      } else {
        setSuccess('If your email exists in our system, a reset link has been sent.');
      }
    } catch (err) {
      // Handle network errors
      setError(
        'Something went wrong, please try again later.' +
          (err instanceof Error ? `: ${err.message}` : '')
      );
    } finally {
      setNavigating(false);
    }
  };

  /**
   * Handle magic link form submission
   * Sends a passwordless authentication link to the user
   */
  const handleMagicLink = async (e: React.FormEvent) => {
    setNavigating(true);
    e.preventDefault();
    setMagicLinkSuccess(null);
    
    try {
      // Send magic link request to API
      const res = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      const data = await res.json();
      
      // Handle API response
      if (!res.ok || data.error) {
        setError(data.error || 'Something went wrong, please try again later.');
      } else {
        setMagicLinkSuccess('Magic link sent! Please check your email inbox.');
      }
    } catch (err) {
      // Handle network errors
      setError(
        'Something went wrong, please try again later.' +
          (err instanceof Error ? `: ${err.message}` : '')
      );
    } finally {
      setNavigating(false);
    }
  };

  // Render the form
  return (
    <Box display="flex" flexGrow={1} minHeight="100vh" justifyContent="center" alignItems="center">
      <Card sx={{ width: '100%', maxWidth: 400 }}>
        <Box display="flex" flexDirection="column" gap={1.5} p={3}>
          <Typography fontWeight="bold" variant="h5">
            Forgot your password?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Enter your email and we will send you a link to reset your password.
          </Typography>
        </Box>
        <CardContent sx={{ p: 3, pt: 0, pb: 1 }}>
          <form onSubmit={handleSubmit} data-testid="forgot-password-form">
            <Box display="grid" gap={2}>
              <Box display="flex" flexDirection="column" gap={1}>
                <label htmlFor="email" style={{ fontSize: 14, lineHeight: 1.5 }}>
                  Email
                </label>
                <TextField
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  fullWidth
                  size="small"
                />
              </Box>
            </Box>

            {/* Error and success messages */}
            {error && (
              <Typography color="error" fontSize={14} mt={2}>
                {error}
              </Typography>
            )}
            {success && (
              <Typography color="success" fontSize={14} mt={2}>
                {success}
              </Typography>
            )}
            {magicLinkSuccess && (
              <Typography color="success" fontSize={14} mt={2}>
                {magicLinkSuccess}
              </Typography>
            )}

            {/* Action buttons */}
            <Box mt={3} display="flex" flexDirection="column" gap={2}>
              <FormButton>Reset Password</FormButton>
              <Button
                type="button"
                onClick={handleMagicLink}
                variant="outlined"
                fullWidth
                size="large"
                sx={{ textTransform: 'none' }}
              >
                Send Magic Link
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}