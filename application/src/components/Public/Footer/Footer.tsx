// React and MUI imports
import React from 'react';
import Link from 'next/link';
import { Box, Container, Typography, Stack, useTheme } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import LaunchIcon from '@mui/icons-material/Launch';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import CloudIcon from '@mui/icons-material/Cloud';
import StorageIcon from '@mui/icons-material/Storage';
import DatabaseIcon from '@mui/icons-material/Storage';
import PsychologyIcon from '@mui/icons-material/Psychology';
import SupportIcon from '@mui/icons-material/Support';
import TwitterIcon from '@mui/icons-material/Twitter';
import ForumIcon from '@mui/icons-material/Forum';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import { URLS, DIMENSIONS } from 'constants/landing';

// Define the structure for footer sections
const footerSections = [
  {
    title: 'Product & Code',
    links: [
      { label: 'GitHub Repository', href: URLS.githubRepo, icon: <GitHubIcon sx={{ fontSize: DIMENSIONS.iconSize.small }} /> },
      { label: 'Documentation', href: URLS.documentation, icon: <MenuBookIcon sx={{ fontSize: DIMENSIONS.iconSize.small }} /> },
      { label: 'Live Demo', href: '#', icon: <LaunchIcon sx={{ fontSize: DIMENSIONS.iconSize.small }} /> },
    ],
  },
  {
    title: 'DigitalOcean Services',
    links: [
      { label: 'App Platform', href: URLS.appPlatform, icon: <CloudIcon sx={{ fontSize: DIMENSIONS.iconSize.small }} /> },
      { label: 'Spaces Storage', href: URLS.spaces, icon: <StorageIcon sx={{ fontSize: DIMENSIONS.iconSize.small }} /> },
      { label: 'Managed Databases', href: URLS.databases, icon: <DatabaseIcon sx={{ fontSize: DIMENSIONS.iconSize.small }} /> },
      { label: 'Gradient', href: URLS.gradient, icon: <PsychologyIcon sx={{ fontSize: DIMENSIONS.iconSize.small }} /> },
    ],
  },
  {
    title: 'Support & Community',
    links: [
      { label: 'DigitalOcean Support', href: URLS.support, icon: <SupportIcon sx={{ fontSize: DIMENSIONS.iconSize.small }} /> },
      { label: 'DigitalOcean Twitter', href: URLS.twitter, icon: <TwitterIcon sx={{ fontSize: DIMENSIONS.iconSize.small }} /> },
      { label: 'Community Forum', href: URLS.community, icon: <ForumIcon sx={{ fontSize: DIMENSIONS.iconSize.small }} /> },
      { label: 'Status Page', href: URLS.status, icon: <MonitorHeartIcon sx={{ fontSize: DIMENSIONS.iconSize.small }} /> },
    ],
  },
];

/**
 * Footer of the application
 * Displays sections with links organized by categories and copyright
 * 
 * The footer is divided into three sections:
 * 1. Product & Code - links to GitHub, documentation, and demo
 * 2. DigitalOcean Services - links to various DigitalOcean services used
 * 3. Support & Community - links to support and community resources
 * 
 * The layout is responsive and changes based on screen size
 */
export default function Footer() {
  const theme = useTheme();

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: 'background.paper',
        py: DIMENSIONS.spacing.card,
        borderTop: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Container maxWidth="lg">
        {/* Footer content grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
            },
            gap: DIMENSIONS.spacing.container,
            mb: DIMENSIONS.spacing.container,
          }}
        >
          {/* Map over footer sections and render each one */}
          {footerSections.map((section) => (
            <Box key={section.title}>
              {/* Section title */}
              <Typography variant="h6" fontWeight={600} sx={{ color: 'text.primary', mb: DIMENSIONS.spacing.small }}>
                {section.title}
              </Typography>
              
              {/* Section links */}
              <Stack spacing={DIMENSIONS.spacing.tiny}>
                {section.links.map((link) => (
                  <Box key={link.label} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {/* Link icon */}
                    <Box sx={{ color: 'text.secondary' }}>
                      {link.icon}
                    </Box>
                    
                    {/* Link text */}
                    <Typography
                      component={Link}
                      href={link.href}
                      target={link.href.startsWith('http') ? '_blank' : '_self'}
                      rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      sx={{
                        color: 'text.secondary',
                        textDecoration: 'none',
                        fontSize: '0.875rem',
                        '&:hover': {
                          color: 'primary.main',
                          textDecoration: 'underline',
                        },
                      }}
                    >
                      {link.label}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          ))}
        </Box>
        
        {/* Copyright notice */}
        <Box sx={{ pt: DIMENSIONS.spacing.container, borderTop: `1px solid ${theme.palette.divider}`, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            © 2025 SeaNotes. Built with ❤️ using DigitalOcean services.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}