// React and MUI imports
import React from 'react';
import { Typography, Box, Container, Stack } from '@mui/material';
import CTAButtons from 'components/Public/CTAButtons/CTAButtons';
import { DIMENSIONS } from 'constants/landing';

/**
 * CTASection component
 * This component displays the final call-to-action section on the landing page
 * It encourages users to launch their SaaS using the template
 * 
 * This section has a light grey background to visually separate it from other sections
 * It includes a heading, description, and the same CTA buttons as the hero section
 */
export default function CTASection() {
  return (
    <Box component="section" py={DIMENSIONS.spacing.section} bgcolor="grey.50" aria-labelledby="cta-title">
      <Container maxWidth="md">
        <Stack spacing={DIMENSIONS.spacing.container} textAlign="center">
          {/* Section header with title and description */}
          <Box component="header">
            <Typography variant="h4" component="h3" id="cta-title" fontWeight="bold">
              Ready to launch your SaaS?
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Our template provides everything you need to get your SaaS up and running quickly. Don&apos;t waste time on boilerplate - focus on what makes your product unique.
            </Typography>
          </Box>
          
          {/* Call to action buttons */}
          <Box component="nav" aria-label="Get started actions">
            <CTAButtons />
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}