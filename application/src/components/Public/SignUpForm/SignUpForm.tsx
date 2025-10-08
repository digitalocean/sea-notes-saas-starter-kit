'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  TextField,
  Typography,
  Box,
  Container,
  Stack,
  Link as MuiLink,
} from '@mui/material';
import Link from 'next/link';
import FormButton from 'components/Public/FormButton/FormButton';
import { useNavigating } from 'hooks/navigation';
import { USER_ROLES } from 'lib/auth/roles';
import SocialLogin from '../SocialLogin/SocialLogin';

/**
 * User registration form.
 * Includes password validation, Auth.js integration and error handling.
 */
const SignUpForm: React.FC = () => {
  const { setNavigating } = useNavigating();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setNavigating(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name: USER_ROLES.USER }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || 'Something went wrong');
      } else {
        setSuccess(data.message || 'Account created.');
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError('Something went wrong during signup. Please try again later.');
    }
    setNavigating(false);
  };
  return (
    <Container maxWidth="sm">
      <Box
        display="flex"
        minHeight="100vh"
        alignItems="center"
        justifyContent="center"
        px={2}
        py={4}
      >
        <Card sx={{ width: '100%', maxWidth: 400, mx: 'auto' }}>
          <CardContent>
            <Stack spacing={4}>
              {/* Header */}
              <Stack spacing={1.5} textAlign="center">
                <Typography variant="h4" component="h1">
                  Create Account
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Sign up to get started with your account
                </Typography>
              </Stack>

              {/* Show success message OR form, not both */}
              {success ? (
                <Stack spacing={3} textAlign="center">
                  <Typography color="success.main" variant="body1" textAlign="center">
                    {success}
                  </Typography>
                </Stack>
              ) : (
                <>
                <Box
                  component="form"
                  onSubmit={handleSubmit}
                  data-testid="signup-form"
                  autoComplete="on"
                >
                  <Stack spacing={3}>
                    <Stack spacing={1}>
                      <Typography variant="body2" fontWeight={500} color="text.primary">
                        Email
                      </Typography>
                      <TextField
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        fullWidth
                        autoComplete="email"
                        variant="outlined"
                        inputProps={{ 'data-testid': 'signup-email-input' }}
                      />
                    </Stack>

                    <Stack spacing={1}>
                      <Typography variant="body2" fontWeight={500} color="text.primary">
                        Password
                      </Typography>
                      <TextField
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Enter your password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        fullWidth
                        autoComplete="new-password"
                        variant="outlined"
                        inputProps={{ 'data-testid': 'signup-password-input' }}
                      />
                    </Stack>

                    <Stack spacing={1}>
                      <Typography variant="body2" fontWeight={500} color="text.primary">
                        Confirm Password
                      </Typography>
                      <TextField
                        id="confirm-password"
                        name="confirmPassword"
                        type="password"
                        placeholder="Confirm your password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        fullWidth
                        autoComplete="new-password"
                        variant="outlined"
                        inputProps={{ 'data-testid': 'signup-confirm-password-input' }}
                      />
                    </Stack>

                    {error && (
                      <Typography
                        color="error"
                        variant="body2"
                        textAlign="center"
                        data-testid="signup-error-message"
                      >
                        {error}
                      </Typography>
                    )}

                    <Box mt={1}>
                      <FormButton>Create Account</FormButton>
                    </Box>
                  </Stack>
                </Box>

                               <SocialLogin
                                setError={setError}
                                setNavigating={setNavigating}
                              />
                </>
              )}

              {/* Links */}
              <Stack spacing={2} alignItems="center">
                <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="center">
                  <Typography variant="body2" color="text.secondary">
                    Already have an account?
                  </Typography>
                  <MuiLink component={Link} href="/login" variant="body2" sx={{ fontWeight: 600 }}>
                    Sign in
                  </MuiLink>
                </Stack>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default SignUpForm;
