'use client';

import React, { useState } from 'react';
import { Card, CardContent, TextField, Typography, Box, Button } from '@mui/material';
import FormButton from 'components/Public/FormButton/FormButton';
import { useNavigating } from 'hooks/navigation';
import { handleApiResponse } from 'lib/rateLimit';

/**
 * Forgot Password form.
 * Handles sending email for password reset and passwordless authentication.
 */
const ForgotPasswordForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [magicLinkSuccess, setMagicLinkSuccess] = useState<string | null>(null);
  const { setNavigating } = useNavigating();

  const handleSubmit = async (e: React.FormEvent) => {
    setNavigating(true);
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      const result = await handleApiResponse(res);
      
      if (result.success) {
        setSuccess('If your email exists in our system, a reset link has been sent.');
      } else {
        setError(result.error || 'Something went wrong, please try again later.');
      }
    } catch (err) {
      setError(
        'Something went wrong, please try again later.' +
          (err instanceof Error ? `: ${err.message}` : '')
      );
    } finally {
      setNavigating(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    setNavigating(true);
    e.preventDefault();
    setMagicLinkSuccess(null);
    setError(null);
    
    try {
      const res = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      const result = await handleApiResponse(res);
      
      if (result.success) {
        setMagicLinkSuccess('Magic link sent! Please check your email inbox.');
      } else {
        setError(result.error || 'Something went wrong, please try again later.');
      }
    } catch (err) {
      setError(
        'Something went wrong, please try again later.' +
          (err instanceof Error ? `: ${err.message}` : '')
      );
    } finally {
      setNavigating(false);
    }
  };

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
};

export default ForgotPasswordForm;
