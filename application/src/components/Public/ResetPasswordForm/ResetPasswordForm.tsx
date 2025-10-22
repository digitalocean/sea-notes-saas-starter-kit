'use client';

// React and MUI imports
import React, { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Box, Card, CardContent, Typography, TextField, Stack, Button } from '@mui/material';

/**
 * ResetPasswordForm renders a form for users to reset their password using a token from the URL
 * Handles validation, API request, and displays success or error messages
 * 
 * This component is used when users click on a password reset link from their email
 */
export default function ResetPasswordForm() {
  // Get the token from URL parameters
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') || '';
  
  // Form state
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  /**
   * Handle form submission
   * Validates passwords and sends reset request to API
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Basic validation
    if (!password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    
    try {
      // Send password reset request to API
      const res = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      
      const data = await res.json();
      
      // Handle API response
      if (!res.ok || data.error) {
        setError(data.error || 'Something went wrong.');
      } else {
        setSuccess(true);
      }
    } catch (err) {
      // Handle network errors
      setError(
        'Something went wrong. Please try again later. ' +
          (err instanceof Error ? `: ${err.message}` : '')
      );
    }
  };

  // Show success message after password reset
  if (success) {
    return (
      <Box
        display="flex"
        minHeight="100vh"
        alignItems="center"
        justifyContent="center"
        bgcolor="#f3f4f6"
      >
        <Card sx={{ width: '100%', maxWidth: 400 }}>
          <CardContent>
            <Stack spacing={3} alignItems="center">
              <Typography variant="h5" fontWeight="bold">
                Password Reset Successful
              </Typography>
              <Typography>
                Your password has been updated. You can now log in with your new password.
              </Typography>
              <Button variant="contained" color="primary" onClick={() => router.push('/login')}>
                Go to Login
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    );
  }

  // Show the password reset form
  return (
    <Box display="flex" minHeight="100vh" alignItems="center" justifyContent="center">
      <Card sx={{ width: '100%', maxWidth: 400 }}>
        <CardContent>
          <Stack spacing={3}>
            <Typography variant="h5" fontWeight="bold">
              Reset Password
            </Typography>
            <form onSubmit={handleSubmit}>
              <Stack spacing={2}>
                <TextField
                  label="New Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  fullWidth
                />
                <TextField
                  label="Confirm Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  fullWidth
                />
                {error && <Typography color="error">{error}</Typography>}
                <Button type="submit" variant="contained" color="primary" fullWidth>
                  Update Password
                </Button>
              </Stack>
            </form>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}