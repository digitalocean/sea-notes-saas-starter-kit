'use client';

import React, { useState, useEffect } from 'react';
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
  Tabs,
  Tab,
  Alert,
  CircularProgress,
} from '@mui/material';
import Link from 'next/link';
import FormButton from 'components/Public/FormButton/FormButton';
import { useNavigating, usePrefetchRouter } from 'hooks/navigation';
import { USER_ROLES } from 'lib/auth/roles';
import { signIn } from 'next-auth/react';
import { Google, GitHub, Microsoft } from '@mui/icons-material';
import { useThemeMode } from 'components/Theme/Theme';

// Define the type for signIn response
interface SignInResponse {
  error?: string;
  ok?: boolean;
  status?: number;
  url?: string;
}

/**
 * Unified authentication page with tabbed interface for sign-in and sign-up
 */
const AuthPage: React.FC = () => {
  const navigatingContext = useNavigating();
  const { navigate } = usePrefetchRouter();
  const { mode, toggleMode } = useThemeMode();
  
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  
  // Sign-in form state
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  
  // Sign-up form state
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  
  // Shared state
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Ensure light mode is used for auth page
  useEffect(() => {
    if (mode === 'dark') {
      toggleMode();
    }
  }, [mode, toggleMode]);

  const handleTabChange = (tab: 'signin' | 'signup') => {
    setActiveTab(tab);
    setError(null);
    setSuccess(null);
  };

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    navigatingContext.setNavigating(true);

    try {
      const res = await signIn('credentials', {
        redirect: false,
        email: signInEmail,
        password: signInPassword,
      });

      if (!res) {
        setError('Authentication service is unavailable');
        setLoading(false);
        navigatingContext.setNavigating(false);
        return;
      }

      if (res.error) {
        setError(res.error);
        setLoading(false);
        navigatingContext.setNavigating(false);
        return;
      }

      if (res.ok) {
        navigate('/dashboard/my-notes');
      }
    } catch (err) {
      console.error('Sign in error:', err);
      setError('Something went wrong during sign in');
      setLoading(false);
      navigatingContext.setNavigating(false);
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    navigatingContext.setNavigating(true);

    if (!acceptTerms) {
      setError('You must accept the terms and conditions.');
      setLoading(false);
      navigatingContext.setNavigating(false);
      return;
    }

    if (signUpPassword !== signUpConfirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      navigatingContext.setNavigating(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: signUpEmail, 
          password: signUpPassword, 
          name: USER_ROLES.USER 
        }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || 'Something went wrong during sign up');
        setLoading(false);
        navigatingContext.setNavigating(false);
        return;
      }

      setSuccess(data.message || 'Account created successfully!');
      // Automatically switch to sign-in tab after successful signup
      setTimeout(() => {
        setActiveTab('signin');
        setSignInEmail(signUpEmail); // Pre-fill email
        setSuccess(null);
        setLoading(false);
        navigatingContext.setNavigating(false);
      }, 2000);
    } catch (err) {
      console.error('Signup error:', err);
      setError('Something went wrong during signup. Please try again later.');
      setLoading(false);
      navigatingContext.setNavigating(false);
    }
  };

  const handleSocialLogin = async (provider: string) => {
    setError(null);
    setLoading(true);
    navigatingContext.setNavigating(true);
    
    try {
      const res = await signIn(provider, {
        callbackUrl: '/dashboard/my-notes',
        redirect: true
      }) as SignInResponse | undefined;
      
      if (res?.error) {
        setError(res.error);
        setLoading(false);
        navigatingContext.setNavigating(false);
      }
    } catch (err) {
      console.error('Social login error:', err);
      setError(`Failed to sign in with ${provider}. Please try again.`);
      setLoading(false);
      navigatingContext.setNavigating(false);
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
        <Card sx={{ width: '100%', maxWidth: 450, mx: 'auto', borderRadius: 3, boxShadow: 4 }}>
          <CardContent>
            <Stack spacing={3}>
              {/* Header */}
              <Stack spacing={1.5} textAlign="center">
                <Typography variant="h4" component="h1" fontWeight={700}>
                  Sea Notes
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Your personal note-taking companion
                </Typography>
              </Stack>

              {/* Tabs */}
              <Tabs
                value={activeTab}
                onChange={(_, newValue) => handleTabChange(newValue as 'signin' | 'signup')}
                centered
                sx={{ mb: 1 }}
              >
                <Tab 
                  label="Sign In" 
                  value="signin" 
                  sx={{ 
                    fontWeight: activeTab === 'signin' ? 600 : 400,
                    fontSize: '1rem'
                  }} 
                />
                <Tab 
                  label="Sign Up" 
                  value="signup" 
                  sx={{ 
                    fontWeight: activeTab === 'signup' ? 600 : 400,
                    fontSize: '1rem'
                  }} 
                />
              </Tabs>

              {/* Social Login Buttons */}
              <Stack spacing={2}>
                <Stack direction="row" spacing={2}>
                  <IconButton
                    onClick={() => handleSocialLogin('google')}
                    disabled={loading}
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
                      position: 'relative'
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={24} />
                    ) : (
                      <Google sx={{ color: '#DB4437' }} />
                    )}
                  </IconButton>
                  
                  <IconButton
                    onClick={() => handleSocialLogin('github')}
                    disabled={loading}
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
                      position: 'relative'
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={24} />
                    ) : (
                      <GitHub />
                    )}
                  </IconButton>
                  
                  <IconButton
                    onClick={() => handleSocialLogin('microsoft-entra-id')}
                    disabled={loading}
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
                      position: 'relative'
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={24} />
                    ) : (
                      <Microsoft sx={{ color: '#0078D4' }} />
                    )}
                  </IconButton>
                </Stack>
                
                <Divider sx={{ my: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Or continue with email
                  </Typography>
                </Divider>
              </Stack>

              {/* Error/Success Messages */}
              {error && (
                <Alert severity="error" onClose={() => setError(null)}>
                  {error}
                </Alert>
              )}
              
              {success && (
                <Alert severity="success" onClose={() => setSuccess(null)}>
                  {success}
                </Alert>
              )}

              {/* Sign In Form */}
              {activeTab === 'signin' && (
                <Box
                  component="form"
                  onSubmit={handleSignInSubmit}
                  data-testid="signin-form"
                  autoComplete="on"
                >
                  <Stack spacing={3}>
                    <Stack spacing={1}>
                      <Typography variant="body2" fontWeight={500} color="text.primary">
                        Email
                      </Typography>
                      <TextField
                        id="signin-email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        required
                        value={signInEmail}
                        onChange={(e) => setSignInEmail(e.target.value)}
                        fullWidth
                        autoComplete="email"
                        variant="outlined"
                        disabled={loading}
                      />
                    </Stack>

                    <Stack spacing={1}>
                      <Typography variant="body2" fontWeight={500} color="text.primary">
                        Password
                      </Typography>
                      <TextField
                        id="signin-password"
                        name="password"
                        type="password"
                        placeholder="Enter your password"
                        required
                        value={signInPassword}
                        onChange={(e) => setSignInPassword(e.target.value)}
                        fullWidth
                        autoComplete="current-password"
                        variant="outlined"
                        disabled={loading}
                      />
                    </Stack>

                    <Box mt={1}>
                      <FormButton>
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
                      </FormButton>
                    </Box>
                    
                    {/* Links */}
                    <Stack spacing={2} alignItems="center">
                      <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="center">
                        <Typography variant="body2" color="text.secondary">
                          Don&apos;t have an account?
                        </Typography>
                        <MuiLink 
                          component="button"
                          onClick={() => handleTabChange('signup')}
                          variant="body2" 
                          sx={{ fontWeight: 600, cursor: 'pointer' }}
                          disabled={loading}
                        >
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
                </Box>
              )}

              {/* Sign Up Form */}
              {activeTab === 'signup' && !success && (
                <Box
                  component="form"
                  onSubmit={handleSignUpSubmit}
                  data-testid="signup-form"
                  autoComplete="on"
                >
                  <Stack spacing={3}>
                    <Stack spacing={1}>
                      <Typography variant="body2" fontWeight={500} color="text.primary">
                        Email
                      </Typography>
                      <TextField
                        id="signup-email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        required
                        value={signUpEmail}
                        onChange={(e) => setSignUpEmail(e.target.value)}
                        fullWidth
                        autoComplete="email"
                        variant="outlined"
                        inputProps={{ 'data-testid': 'signup-email-input' }}
                        disabled={loading}
                      />
                    </Stack>

                    <Stack spacing={1}>
                      <Typography variant="body2" fontWeight={500} color="text.primary">
                        Password
                      </Typography>
                      <TextField
                        id="signup-password"
                        name="password"
                        type="password"
                        placeholder="Enter your password"
                        required
                        value={signUpPassword}
                        onChange={(e) => setSignUpPassword(e.target.value)}
                        fullWidth
                        autoComplete="new-password"
                        variant="outlined"
                        inputProps={{ 'data-testid': 'signup-password-input' }}
                        disabled={loading}
                      />
                    </Stack>

                    <Stack spacing={1}>
                      <Typography variant="body2" fontWeight={500} color="text.primary">
                        Confirm Password
                      </Typography>
                      <TextField
                        id="signup-confirm-password"
                        name="confirmPassword"
                        type="password"
                        placeholder="Confirm your password"
                        required
                        value={signUpConfirmPassword}
                        onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                        fullWidth
                        autoComplete="new-password"
                        variant="outlined"
                        inputProps={{ 'data-testid': 'signup-confirm-password-input' }}
                        disabled={loading}
                      />
                    </Stack>

                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={acceptTerms}
                          onChange={(e) => setAcceptTerms(e.target.checked)}
                          color="primary"
                          disabled={loading}
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

                    <Box mt={1}>
                      <FormButton>
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
                      </FormButton>
                    </Box>
                    
                    {/* Links */}
                    <Stack spacing={2} alignItems="center">
                      <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="center">
                        <Typography variant="body2" color="text.secondary">
                          Already have an account?
                        </Typography>
                        <MuiLink 
                          component="button"
                          onClick={() => handleTabChange('signin')}
                          variant="body2" 
                          sx={{ fontWeight: 600, cursor: 'pointer' }}
                          disabled={loading}
                        >
                          Sign in
                        </MuiLink>
                      </Stack>
                    </Stack>
                  </Stack>
                </Box>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default AuthPage;