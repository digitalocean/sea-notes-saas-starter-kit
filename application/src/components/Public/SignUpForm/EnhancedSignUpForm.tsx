'use client';

// React and MUI imports
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
  IconButton,
  Alert,
} from '@mui/material';

// Next.js components and hooks
import Link from 'next/link';
import FormButton from 'components/Public/FormButton/FormButton';
import { useNavigating } from 'hooks/navigation';
import { Google, GitHub, Microsoft } from '@mui/icons-material';
import { useRouter } from 'next/navigation';

/**
 * Enhanced user registration form that redirects to Clerk auth
 * We're using Clerk for auth now, so this just redirects to the main auth page
 * Keeping this for backward compatibility
 */
export default function EnhancedSignUpForm() {
  const router = useRouter();
  const { setNavigating } = useNavigating();

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Handle form submission - just redirect to Clerk auth
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNavigating(true);

    try {
      // Redirect to the main Clerk auth page
      // We're not using this form anymore, but keeping it for backward compatibility
      router.push('/auth');
    } catch (error) {
      setNavigating(false);
      setError('Authentication service unavailable');
      console.error('Navigation error:', error);
    }
  };

  // Handle social login buttons - also redirect to Clerk auth
  const handleSocialLogin = async () => {
    router.push('/auth');
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
        <Card sx={{ width: '100%', maxWidth: 450, mx: 'auto', borderRadius: 3 }}>
          <CardContent>
            <Stack spacing={4}>
              {/* Header with sign up message */}
              <Stack spacing={1.5} textAlign="center">
                <Typography variant="h4" component="h1" fontWeight={700}>
                  Create Account
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Sign up to get started with your account
                </Typography>
              </Stack>

              {/* Info message about the new auth system */}
              <Alert severity="info">
                We&apos;ve upgraded our authentication system. Please use the new authentication page.
              </Alert>

              {/* Social login buttons that redirect to Clerk */}
              <Stack spacing={2}>
                <Stack direction="row" spacing={2}>
                  <IconButton
                    onClick={handleSocialLogin}
                    sx={{
                      flex: 1,
                      py: 1.5,
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      boxShadow: 1,
                      '&:hover': {
                        boxShadow: 3,
                        borderColor: 'primary.main',
                      },
                    }}
                  >
                    <Google sx={{ color: '#DB4437' }} />
                  </IconButton>
                  
                  <IconButton
                    onClick={handleSocialLogin}
                    sx={{
                      flex: 1,
                      py: 1.5,
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      boxShadow: 1,
                      '&:hover': {
                        boxShadow: 3,
                        borderColor: 'primary.main',
                      },
                    }}
                  >
                    <GitHub />
                  </IconButton>
                  
                  <IconButton
                    onClick={handleSocialLogin}
                    sx={{
                      flex: 1,
                      py: 1.5,
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      boxShadow: 1,
                      '&:hover': {
                        boxShadow: 3,
                        borderColor: 'primary.main',
                      },
                    }}
                  >
                    <Microsoft sx={{ color: '#0078D4' }} />
                  </IconButton>
                </Stack>
                
                <Divider sx={{ my: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Or sign up with email
                  </Typography>
                </Divider>
              </Stack>

              {/* Email/password form that also redirects */}
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

              {/* Link to sign in page, redirects to auth page */}
              <Stack spacing={2} alignItems="center">
                <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="center">
                  <Typography variant="body2" color="text.secondary">
                    Already have an account?
                  </Typography>
                  <MuiLink 
                    component={Link} 
                    href="/auth" 
                    variant="body2" 
                    sx={{ fontWeight: 600 }}
                  >
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
}