import React from 'react';
import { Typography, Box, Container } from '@mui/material';
import TerminalMockup from 'components/Public/TerminalMockup/TerminalMockup';
import CTAButtons from 'components/Public/CTAButtons/CTAButtons';
import { DIMENSIONS } from 'constants/landing';

/**
 * HeroSection component that displays the main hero section of the landing page
 * with title, subtitle, description, and call-to-action buttons.
 * @returns {JSX.Element} The hero section component
 */
const HeroSection = () => {
  return (
    <Box component="section" bgcolor="background.default" py={DIMENSIONS.spacing.section} aria-labelledby="hero-title">
      <Container maxWidth="lg">
        <Box sx={{ 
          position: 'relative',
          display: 'flex',
          flexDirection: { xs: 'column', lg: 'row' },
          alignItems: { xs: 'center', lg: 'flex-start' },
          gap: DIMENSIONS.spacing.container
        }}>
          {/* Code example */}
          <Box component="aside" aria-label="Code example" sx={{ order: { xs: 1, lg: 2 } }}>
            <TerminalMockup />
          </Box>
          
          {/* Main hero content */}
          <Box component="header" sx={{ 
            order: { xs: 2, lg: 1 },
            flex: 1,
            minWidth: 0,
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: DIMENSIONS.spacing.container
          }}>
            <Typography 
              variant="h1" 
              component="h1" 
              id="hero-title"
              fontWeight="bold"
              sx={{ 
                textAlign: 'center',
                width: '100%'
              }}
            >
              SeaNotes
            </Typography>
            <Typography 
              variant="h3" 
              component="h2" 
              fontWeight="bold" 
              color="primary.main"
              sx={{ 
                textAlign: 'center',
                width: '100%'
              }}
            >
              Build Your SaaS Faster Than Ever
            </Typography>
            <Typography 
              variant="h6" 
              component="p" 
              color="text.secondary" 
              sx={{ 
                maxWidth: DIMENSIONS.layout.maxContentWidth, 
                mx: 'auto',
                textAlign: 'center',
                width: '100%'
              }}
            >
              Launch your SaaS product in record time with our powerful, ready-to-use template. Packed with modern technologies and essential integrations.
            </Typography>
            <Box component="nav" aria-label="Primary actions">
              <CTAButtons />
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default HeroSection;