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
  IconButton,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import Link from 'next/link';
import FormButton from 'components/Public/FormButton/FormButton';
import { useNavigating } from 'hooks/navigation';
import { USER_ROLES } from 'lib/auth/roles';
import { signIn } from 'next-auth/react';
import { Google, GitHub, Microsoft } from '@mui/icons-material';

/**
 * Enhanced user registration form with social authentication options
 */
const EnhancedSignUpForm: React.FC = () => {
  const { setNavigating } = useNavigating();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!acceptTerms) {
      setError('You must accept the terms and conditions.');
      return;
    }

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
        setSuccess(data.message || 'Account created successfully!');
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError('Something went wrong during signup. Please try again later.');
    }
    setNavigating(false);
  };

  const handleSocialLogin = async (provider: string) => {
    setNavigating(true);
    setError(null);
    
    const res = await signIn(provider, {
      callbackUrl: '/dashboard/my-notes',
    });
    
    if (res?.error) {
      setNavigating(false);
      setError(res.error);
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
        <Card sx={{ width: '100%', maxWidth: 450, mx: 'auto', borderRadius: 3 }}>
          <CardContent>
            <Stack spacing={4}>
              {/* Header */}
              <Stack spacing={1.5} textAlign="center">
                <Typography variant="h4" component="h1" fontWeight={700}>
                  Create Account
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Sign up to get started with your account
                </Typography>
              </Stack>

              {/* Social Login Buttons */}
              <Stack spacing={2}>
                <Stack direction="row" spacing={2}>
                  <IconButton
                    onClick={() => handleSocialLogin('google')}
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
                    onClick={() => handleSocialLogin('github')}
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
                    onClick={() => handleSocialLogin('microsoft-entra-id')}
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

              {/* Show success message OR form, not both */}
              {success ? (
                <Stack spacing={3} textAlign="center">
                  <Typography color="success.main" variant="body1" textAlign="center">
                    {success}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    You can now{' '}
                    <MuiLink component={Link} href="/login" variant="body2" sx={{ fontWeight: 600 }}>
                      sign in
                    </MuiLink>{' '}
                    to your account.
                  </Typography>
                </Stack>
              ) : (
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

                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={acceptTerms}
                          onChange={(e) => setAcceptTerms(e.target.checked)}
                          color="primary"
                        />
                      }
                      label={
                        <Typography variant="body2" color="text.secondary">
                          I accept the{' '}
                          <MuiLink href="#" variant="body2" sx={{ fontWeight: 600 }}>
                            Terms and Conditions
                          </MuiLink>
                        </Typography>
                      }
                    />

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
                      <FormButton fullWidth>Create Account</FormButton>
                    </Box>
                  </Stack>
                </Box>
              )}

              {/* Links */}
              <Stack spacing={2} alignItems="center">
                <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="center">
                  <Typography variant="body2" color="text.secondary">
                    Already have an account?
                  </Typography>
                  <MuiLink 
                    component={Link} 
                    href="/login" 
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
};

export default EnhancedSignUpForm;