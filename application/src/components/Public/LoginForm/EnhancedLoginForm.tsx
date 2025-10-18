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
} from '@mui/material';
import Link from 'next/link';
import FormButton from 'components/Public/FormButton/FormButton';
import { signIn } from 'next-auth/react';
import { useNavigating, usePrefetchRouter } from 'hooks/navigation';
import { Google, GitHub, Microsoft } from '@mui/icons-material';

/**
 * Enhanced login form with social authentication options
 */
const EnhancedLoginForm: React.FC = () => {
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
                  Welcome Back
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Sign in to your account to continue
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
                    Or continue with email
                  </Typography>
                </Divider>
              </Stack>

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
                    <FormButton fullWidth>Sign In</FormButton>
                  </Box>
                </Stack>
              </Box>
              
              {/* Links */}
              <Stack spacing={2} alignItems="center">
                <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="center">
                  <Typography variant="body2" color="text.secondary">
                    Don&apos;t have an account?
                  </Typography>
                  <MuiLink 
                    component={Link} 
                    href="/signup" 
                    variant="body2" 
                    sx={{ fontWeight: 600 }}
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
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default EnhancedLoginForm;'use client';

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
} from '@mui/material';
import Link from 'next/link';
import FormButton from 'components/Public/FormButton/FormButton';
import { signIn } from 'next-auth/react';
import { useNavigating, usePrefetchRouter } from 'hooks/navigation';
import { Google, GitHub, Microsoft } from '@mui/icons-material';

/**
 * Enhanced login form with social authentication options
 */
const EnhancedLoginForm: React.FC = () => {
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
                  Welcome Back
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Sign in to your account to continue
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
                    Or continue with email
                  </Typography>
                </Divider>
              </Stack>

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
                    <FormButton fullWidth>Sign In</FormButton>
                  </Box>
                </Stack>
              </Box>
              
              {/* Links */}
              <Stack spacing={2} alignItems="center">
                <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="center">
                  <Typography variant="body2" color="text.secondary">
                    Don&apos;t have an account?
                  </Typography>
                  <MuiLink 
                    component={Link} 
                    href="/signup" 
                    variant="body2" 
                    sx={{ fontWeight: 600 }}
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
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default EnhancedLoginForm;