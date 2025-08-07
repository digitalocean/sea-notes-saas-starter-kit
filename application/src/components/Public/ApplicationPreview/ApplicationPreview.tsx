import React from 'react';
import { Typography, Box, Container, Stack, Card } from '@mui/material';
import { Button } from '@mui/material';
import { DIMENSIONS } from 'constants/landing';

/**
 * ApplicationPreview component that displays a mockup of the SeaNotes application interface.
 * Shows the main dashboard layout with sidebar navigation and notes grid.
 * @returns {JSX.Element} The application preview component
 */
const ApplicationPreview = () => {
  return (
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
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                maxWidth: '100%',
                width: '100%',
                margin: 0
              }}>
              {/* Mock application screenshot */}
              <Box sx={{
                bgcolor: '#1a1a1a',
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
                <Typography variant="body2" sx={{ color: 'grey.400', ml: 2, fontFamily: 'monospace' }}>
                  SeaNotes - localhost:3000
                </Typography>
              </Box>
              
              <Box sx={{
                display: 'flex',
                minHeight: DIMENSIONS.layout.minHeight,
                bgcolor: '#f8f9fa'
              }}>
                {/* Sidebar */}
                <Box sx={{
                  width: DIMENSIONS.layout.sidebarWidth,
                  bgcolor: 'white',
                  borderRight: '1px solid',
                  borderColor: 'divider',
                  p: DIMENSIONS.spacing.small
                }}>
                  <Stack spacing={DIMENSIONS.spacing.small}>
                    <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                      🐳 SeaNotes
                    </Typography>
                    <Box sx={{ height: 1, bgcolor: 'divider', my: 1 }} />
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                      Dashboard
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      My Notes
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Subscription
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Account
                    </Typography>
                  </Stack>
                </Box>
                
                {/* Main content */}
                <Box sx={{ flex: 1, p: DIMENSIONS.spacing.stack }}>
                  <Stack spacing={DIMENSIONS.spacing.stack}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="h5" fontWeight="bold">
                        My Notes
                      </Typography>
                      <Button variant="contained" size="small" sx={{ bgcolor: 'primary.main' }}>
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
                        <Card key={index} sx={{ p: DIMENSIONS.spacing.small, cursor: 'pointer', '&:hover': { bgcolor: 'grey.50' } }}>
                          <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                            {note.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {note.content}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
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