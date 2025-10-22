// This component shows a preview of what the actual app looks like
// It's meant to give visitors a feel for the UI before they sign up
'use client';

import React from 'react';
import { Typography, Box, Container, Stack, Card, useTheme } from '@mui/material';
// Button is imported separately because we use it less frequently than other components
import { Button } from '@mui/material';
import { DIMENSIONS } from 'constants/landing';

// Simple preview of the main application interface
// Not a functional component, just a visual mockup
const ApplicationPreview = () => {
  // We need the theme to handle light/dark mode properly
  const theme = useTheme();
  
  // These helper functions might seem a bit verbose, but they make it much easier
  // to manage theme-specific colors throughout the component
  
  // Text color for the terminal header - slightly different in light vs dark mode
  const getTerminalHeaderTextColor = () => {
    // In dark mode, we use a lighter grey, in light mode we stick with the default
    return theme.palette.mode === 'dark' 
      ? theme.palette.grey[400] 
      : 'grey.400';
  };
  
  
  // Background color for the top bar of our mock terminal
  const getTerminalBackground = () => {
    // Darker in dark mode, obviously
    return theme.palette.mode === 'dark' 
      ? theme.palette.grey[900] 
      : '#1a1a1a';
  };
  
  // Main content area background - a bit lighter than the terminal
  const getContentBackground = () => {
    return theme.palette.mode === 'dark' 
      ? theme.palette.grey[800] 
      : '#f8f9fa';
  };
  
  // Sidebar background - white in light mode, dark grey in dark mode
  const getSidebarBackground = () => {
    return theme.palette.mode === 'dark' 
      ? theme.palette.grey[900] 
      : 'white';
  };
  
  // Card hover effect - subtle but noticeable
  const getCardHoverBackground = () => {
    // Slightly lighter on hover in dark mode, barely visible change in light mode
    return theme.palette.mode === 'dark' 
      ? theme.palette.grey[700] 
      : 'grey.50';
  };
  // End of helper functions
  
  // Now for the actual component render
    <Box component="section" py={DIMENSIONS.spacing.section} bgcolor="background.default" aria-labelledby="preview-title">
      <Container maxWidth="lg">
        <Stack spacing={DIMENSIONS.spacing.card} textAlign="center">
          <Box component="header" className="sr-only">
            <Typography variant="h3" component="h3" id="preview-title">
              Application Preview
            </Typography>
          </Box>
          <Box sx={{ 
            position: 'relative',
            display: 'flex',
            justifyContent: 'center'
          }}>
            <Box 
              component="figure" 
              aria-label="SeaNotes application interface mockup"
              sx={{ 
                bgcolor: 'background.paper', 
                borderRadius: 3, 
                border: '1px solid',
                borderColor: 'divider',
                overflow: 'hidden',
                boxShadow: theme.palette.mode === 'dark' 
                  ? '0 20px 40px rgba(0, 0, 0, 0.3)' 
                  : '0 20px 40px rgba(0, 0, 0, 0.1)',
                maxWidth: '100%',
                width: '100%',
                margin: 0
              }}>
              {/* Mock application screenshot */}
              <Box sx={{
                bgcolor: getTerminalBackground(),
                p: DIMENSIONS.spacing.stack,
                borderBottom: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                gap: DIMENSIONS.spacing.small
              }}>
                <Box sx={{ width: DIMENSIONS.terminalDot.width, height: DIMENSIONS.terminalDot.height, borderRadius: '50%', bgcolor: '#ff5f56' }} />
                <Box sx={{ width: DIMENSIONS.terminalDot.width, height: DIMENSIONS.terminalDot.height, borderRadius: '50%', bgcolor: '#ffbd2e' }} />
                <Box sx={{ width: DIMENSIONS.terminalDot.width, height: DIMENSIONS.terminalDot.height, borderRadius: '50%', bgcolor: '#27ca3f' }} />
                <Typography variant="body2" sx={{ color: getTerminalHeaderTextColor(), ml: 2, fontFamily: 'monospace' }}>
                  SeaNotes - localhost:3000
                </Typography>
              </Box>
              
              <Box sx={{
                display: 'flex',
                minHeight: DIMENSIONS.layout.minHeight,
                bgcolor: getContentBackground()
              }}>
                {/* Sidebar */}
                <Box sx={{
                  width: DIMENSIONS.layout.sidebarWidth,
                  bgcolor: getSidebarBackground(),
                  borderRight: '1px solid',
                  borderColor: 'divider',
                  p: DIMENSIONS.spacing.small
                }}>
                  <Stack spacing={DIMENSIONS.spacing.small}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        color: theme.palette.primary.main, 
                        fontWeight: 'bold'
                      }}
                    >
                      🐳 SeaNotes
                    </Typography>
                    <Box sx={{ height: 1, bgcolor: 'divider', my: 1 }} />
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: theme.palette.mode === 'dark' 
                          ? theme.palette.grey[300] 
                          : 'text.secondary', 
                        fontWeight: 500 
                      }}
                    >
                      Dashboard
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: theme.palette.mode === 'dark' 
                          ? theme.palette.grey[300] 
                          : 'text.secondary'
                      }}
                    >
                      My Notes
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: theme.palette.mode === 'dark' 
                          ? theme.palette.grey[300] 
                          : 'text.secondary'
                      }}
                    >
                      Subscription
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: theme.palette.mode === 'dark' 
                          ? theme.palette.grey[300] 
                          : 'text.secondary'
                      }}
                    >
                      Account
                    </Typography>
                  </Stack>
                </Box>
                
                {/* Main content */}
                <Box sx={{ flex: 1, p: DIMENSIONS.spacing.stack }}>
                  <Stack spacing={DIMENSIONS.spacing.stack}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography 
                        variant="h5" 
                        fontWeight="bold"
                        sx={{ 
                          color: theme.palette.mode === 'dark' 
                            ? theme.palette.grey[100] 
                            : 'inherit'
                        }}
                      >
                        My Notes
                      </Typography>
                      <Button 
                        variant="contained" 
                        size="small" 
                        sx={{ 
                          bgcolor: 'primary.main',
                          color: theme.palette.mode === 'dark' 
                            ? theme.palette.common.white 
                            : 'white'
                        }}
                      >
                        Add Note
                      </Button>
                    </Box>
                    
                    <Box sx={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                      gap: DIMENSIONS.spacing.small
                    }}>
                      {/* Note cards */}
                      {[
                        { title: 'Project Ideas', content: 'Build a SaaS starter kit...', date: '2 hours ago' },
                        { title: 'Meeting Notes', content: 'Discuss new features...', date: '1 day ago' },
                        { title: 'Todo List', content: 'Implement authentication...', date: '3 days ago' }
                      ].map((note, index) => (
                        <Card 
                          key={index} 
                          sx={{ 
                            p: DIMENSIONS.spacing.small, 
                            cursor: 'pointer',
                            bgcolor: getSidebarBackground(),
                            color: theme.palette.mode === 'dark' 
                              ? theme.palette.grey[300] 
                              : 'inherit',
                            '&:hover': { 
                              bgcolor: getCardHoverBackground() 
                            }
                          }}
                        >
                          <Typography 
                            variant="h6" 
                            fontWeight="bold" 
                            sx={{ 
                              mb: 1,
                              color: theme.palette.mode === 'dark' 
                                ? theme.palette.grey[100] 
                                : 'inherit'
                            }}
                          >
                            {note.title}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              mb: 2,
                              color: theme.palette.mode === 'dark' 
                                ? theme.palette.grey[400] 
                                : 'text.secondary'
                            }}
                          >
                            {note.content}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: theme.palette.mode === 'dark' 
                                ? theme.palette.grey[500] 
                                : 'text.secondary'
                            }}
                          >
                            {note.date}
                          </Typography>
                        </Card>
                      ))}
                    </Box>
                  </Stack>
                </Box>
              </Box>
            </Box>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
};

export default ApplicationPreview;