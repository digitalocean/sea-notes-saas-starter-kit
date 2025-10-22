// React and MUI imports
import React from 'react';
import { Button, Stack } from '@mui/material';
import Link from 'next/link';
import GitHubIcon from '@mui/icons-material/GitHub';
import LaunchIcon from '@mui/icons-material/Launch';
import { COLORS, URLS, DIMENSIONS } from 'constants/landing';

/**
 * CTAButtons component
 * This component displays the main call-to-action buttons on the landing page
 * It includes buttons to view the code on GitHub and deploy to DigitalOcean
 * 
 * The buttons are arranged vertically on mobile and horizontally on larger screens
 * Each button has a custom color scheme and icon
 */
export default function CTAButtons() {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={DIMENSIONS.spacing.small} justifyContent="center">
      {/* GitHub button - links to the repository */}
      <Button
        component={Link}
        href={URLS.githubRepo}
        target="_blank"
        rel="noopener noreferrer"
        variant="contained"
        size="large"
        startIcon={<GitHubIcon />}
        sx={{
          backgroundColor: COLORS.github,
          color: '#ffffff',
          '&:hover': {
            backgroundColor: COLORS.githubHover,
          },
        }}
      >
        View the code
      </Button>
      
      {/* Deploy button - links to DigitalOcean deployment */}
      <Button
        component={Link}
        href={URLS.deployment}
        target="_blank"
        rel="noopener noreferrer"
        variant="contained"
        size="large"
        startIcon={<LaunchIcon />}
        sx={{
          backgroundColor: COLORS.deploy,
          color: '#ffffff',
          '&:hover': {
            backgroundColor: COLORS.deployHover,
          },
        }}
      >
        Deploy to DigitalOcean
      </Button>
    </Stack>
  );
}