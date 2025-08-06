import React from 'react';
import { Typography, Box, Container, Stack } from '@mui/material';
import CTAButtons from 'components/Public/CTAButtons/CTAButtons';
import { DIMENSIONS } from 'constants/landing';

/**
 * CTASection component that displays a call-to-action section with title,
 * description, and action buttons for getting started with the SaaS template.
 * @returns {JSX.Element} The CTA section component
 */
const CTASection = () => {
  return (
    <Box component="section" py={DIMENSIONS.spacing.section} bgcolor="grey.50" aria-labelledby="cta-title">
      <Container maxWidth="md">
        <Stack spacing={DIMENSIONS.spacing.container} textAlign="center">
          <Box component="header">
            <Typography variant="h4" component="h3" id="cta-title" fontWeight="bold">
              Ready to launch your SaaS?
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Our template provides everything you need to get your SaaS up and running quickly. Don&apos;t waste time on boilerplate - focus on what makes your product unique.
            </Typography>
          </Box>
          <Box component="nav" aria-label="Get started actions">
            <CTAButtons />
          </Box>
        </Stack>
      </Container>
    </Box>
  );
};

export default CTASection;