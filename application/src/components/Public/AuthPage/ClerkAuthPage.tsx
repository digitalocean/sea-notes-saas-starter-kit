'use client';

// React and MUI imports
import React, { useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Container,
  Stack,
  Divider,
  Button,
} from '@mui/material';

// Custom hooks and components
import { useThemeMode } from 'components/Theme/Theme';
import { 
  SignInButton, 
  SignUpButton, 
  SignedIn, 
  SignedOut, 
  UserButton,
  useAuth
} from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Google, GitHub, Microsoft } from '@mui/icons-material';

/**
 * Main authentication page using Clerk
 * This handles both sign in and sign up with social providers
 */
export default function ClerkAuthPage() {
  // Theme handling - we want to force light mode on this page
  const { mode, toggleMode } = useThemeMode();
  const { isSignedIn } = useAuth();
  const router = useRouter();

  // Make sure we're always in light mode on the auth page
  // Clerk's UI looks better in light mode and we want consistency
  useEffect(() => {
    if (mode === 'dark') {
      toggleMode();
    }
  }, [mode, toggleMode]);

  // If user is already signed in, redirect them to their notes
  useEffect(() => {
    if (isSignedIn) {
      router.push('/dashboard/my-notes');
    }
  }, [isSignedIn, router]);

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
        {/* Main auth card with some nice styling */}
        <Card 
          sx={{ 
            width: '100%', 
            maxWidth: 450, 
            mx: 'auto', 
            borderRadius: 3, 
            boxShadow: 4 
          }}
        >
          <CardContent>
            <Stack spacing={3}>
              {/* Header section with app name and description */}
              <Stack spacing={1.5} textAlign="center">
                <Typography variant="h4" component="h1" fontWeight={700}>
                  Sea Notes
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Your personal note-taking companion
                </Typography>
              </Stack>

              {/* Show different content based on auth state */}
              <SignedOut>
                <Stack spacing={2}>
                  {/* Sign in/up buttons */}
                  <Stack direction="row" spacing={2}>
                    <SignInButton mode="modal">
                      <Button 
                        variant="outlined"
                        fullWidth
                        sx={{ 
                          py: 1.5,
                          borderRadius: 2,
                          fontWeight: 600,
                          textTransform: 'none'
                        }}
                      >
                        Sign In
                      </Button>
                    </SignInButton>
                    
                    <SignUpButton mode="modal">
                      <Button 
                        variant="contained"
                        fullWidth
                        sx={{ 
                          py: 1.5,
                          borderRadius: 2,
                          fontWeight: 600,
                          textTransform: 'none'
                        }}
                      >
                        Sign Up
                      </Button>
                    </SignUpButton>
                  </Stack>
                  
                  {/* Divider with social login text */}
                  <Divider sx={{ my: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Or continue with social providers
                    </Typography>
                  </Divider>
                  
                  {/* Social login buttons - Google and GitHub in a row */}
                  <Stack direction="row" spacing={2}>
                    <SignInButton mode="modal" signUpForceRedirectUrl="/auth">
                      <Button
                        startIcon={<Google sx={{ color: '#DB4437' }} />}
                        variant="outlined"
                        fullWidth
                        sx={{ 
                          py: 1.5,
                          borderRadius: 2,
                          textTransform: 'none',
                          borderColor: 'divider',
                          boxShadow: 1,
                          '&:hover': {
                            boxShadow: 3,
                            borderColor: 'primary.main',
                          },
                        }}
                      >
                        Google
                      </Button>
                    </SignInButton>
                    
                    <SignInButton mode="modal" signUpForceRedirectUrl="/auth">
                      <Button
                        startIcon={<GitHub />}
                        variant="outlined"
                        fullWidth
                        sx={{ 
                          py: 1.5,
                          borderRadius: 2,
                          textTransform: 'none',
                          borderColor: 'divider',
                          boxShadow: 1,
                          '&:hover': {
                            boxShadow: 3,
                            borderColor: 'primary.main',
                          },
                        }}
                      >
                        GitHub
                      </Button>
                    </SignInButton>
                  </Stack>
                  
                  {/* Microsoft button on its own line */}
                  <SignInButton mode="modal" signUpForceRedirectUrl="/auth">
                    <Button
                      startIcon={<Microsoft sx={{ color: '#0078D4' }} />}
                      variant="outlined"
                      fullWidth
                      sx={{ 
                        py: 1.5,
                        borderRadius: 2,
                        textTransform: 'none',
                        borderColor: 'divider',
                        boxShadow: 1,
                        '&:hover': {
                          boxShadow: 3,
                          borderColor: 'primary.main',
                        },
                      }}
                    >
                      Microsoft
                    </Button>
                  </SignInButton>
                </Stack>
              </SignedOut>
              
              {/* If user is already signed in */}
              <SignedIn>
                <Stack spacing={3} alignItems="center">
                  <Typography variant="h6" textAlign="center">
                    You are already signed in
                  </Typography>
                  <UserButton 
                    userProfileMode="modal"
                    userProfileProps={{
                      additionalOAuthScopes: {
                        google: ['profile', 'email'],
                        github: ['read:user'],
                        microsoft: ['User.Read']
                      }
                    }}
                  />
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => router.push('/dashboard/my-notes')}
                    sx={{ 
                      py: 1.5,
                      borderRadius: 2,
                      fontWeight: 600,
                      textTransform: 'none'
                    }}
                  >
                    Go to Dashboard
                  </Button>
                </Stack>
              </SignedIn>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}