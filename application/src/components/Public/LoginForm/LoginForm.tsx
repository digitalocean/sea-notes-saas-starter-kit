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
  Divider,
  Button,
} from '@mui/material';
import Link from 'next/link';
import FormButton from 'components/Public/FormButton/FormButton';
import { signIn } from 'next-auth/react';
import { useNavigating, usePrefetchRouter } from 'hooks/navigation';
import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';

/**
 * Login form.
 * Handles authentication by credentials and integrates with intelligent navigation.
 */
const LoginForm: React.FC = () => {
  const { navigate } = usePrefetchRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { setNavigating } = useNavigating();

  const handleSubmit = async (e: React.FormEvent) => {
    setNavigating(true);
    e.preventDefault();
    setError(null);

    const res = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    if (!res || res.error) {
      setNavigating(false);
      setError(res?.code || 'Something went wrong');
    } else if (res.ok) {
      navigate('/dashboard/my-notes');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signIn('google', {
        callbackUrl: '/dashboard/my-notes',
      });
    } catch (err) {
      if (err instanceof Error) {
        console.error('Google sign-in failed:', err.message, err.stack);
      } else {
        console.error('Google sign-in failed:', JSON.stringify(err));
      }
        console.error('Google sign-in failed:', err.message, err.stack);
      } else {
        console.error('Google sign-in failed:', JSON.stringify(err));
      }
    }
  };

  const handleGithubSignIn = async () => {
    try {
      await signIn('github', {
        callbackUrl: '/dashboard/my-notes',
      });
    } catch (err) {
      console.error('GitHub sign-in failed:', {
        error: err,
        message: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
      });
    }
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
                  Welcome Back
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Sign in to your account to continue
                </Typography>
              </Stack>{' '}
              {/* Form */}
              <Box
                component="form"
                onSubmit={handleSubmit}
                data-testid="login-form"
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
                      autoComplete="current-password"
                      variant="outlined"
                    />
                  </Stack>

                  {error && (
                    <Typography color="error" variant="body2" textAlign="center">
                      {error}
                    </Typography>
                  )}

                  <Box mt={1}>
                    <FormButton>Sign In</FormButton>
                  </Box>
                </Stack>
              </Box>
              <Stack spacing={3} alignItems="center">
                <Divider flexItem>or</Divider>
                <Button
                  onClick={handleGoogleSignIn}
                  variant="outlined"
                  fullWidth
                  startIcon={<FcGoogle />}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 500,
                    py: 1.2,
                  }}
                >
                  Sign in with Google
                </Button>
                <Button
                  onClick={handleGithubSignIn}
                  variant="outlined"
                  fullWidth
                  startIcon={<FaGithub />}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 500,
                    py: 1.2,
                    svg: { color: '#24292f' },
                  }}
                >
                  Sign in with GitHub
                </Button>
              </Stack>
              {/* Links */}
              <Stack spacing={2} alignItems="center">
                <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="center">
                  {' '}
                  <Typography variant="body2" color="text.secondary">
                    Don&apos;t have an account?
                  </Typography>
                  <MuiLink component={Link} href="/signup" variant="body2" sx={{ fontWeight: 600 }}>
                    Sign up
                  </MuiLink>
                </Stack>

                <MuiLink
                  component={Link}
                  href="/forgot-password"
                  variant="body2"
                  color="text.secondary"
                  sx={{ textDecoration: 'underline' }}
                >
                  Forgot your password?
                </MuiLink>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default LoginForm;
