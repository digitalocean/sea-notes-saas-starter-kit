// React and MUI imports
import React from 'react';
import { Typography, Box, Container, Stack, Card, CardContent } from '@mui/material';
import StorageIcon from '@mui/icons-material/Storage';
import PaymentIcon from '@mui/icons-material/Payment';
import SecurityIcon from '@mui/icons-material/Security';
import CloudIcon from '@mui/icons-material/Cloud';
import EmailIcon from '@mui/icons-material/Email';
import PsychologyIcon from '@mui/icons-material/Psychology';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import { FEATURES, DIMENSIONS } from 'constants/landing';

// Map feature titles to their corresponding icons
const featureIcons = {
  'One-Click Deployment': <RocketLaunchIcon sx={{ fontSize: DIMENSIONS.iconSize.large, color: FEATURES[0].color }} />,
  'DigitalOcean Spaces': <CloudIcon sx={{ fontSize: DIMENSIONS.iconSize.large, color: FEATURES[1].color }} />,
  'DigitalOcean Gradient': <PsychologyIcon sx={{ fontSize: DIMENSIONS.iconSize.large, color: FEATURES[2].color }} />,
  'PostgreSQL and Prisma ORM': <StorageIcon sx={{ fontSize: DIMENSIONS.iconSize.large, color: FEATURES[3].color }} />,
  'Stripe Integration': <PaymentIcon sx={{ fontSize: DIMENSIONS.iconSize.large, color: FEATURES[4].color }} />,
  'NextAuth Authentication': <SecurityIcon sx={{ fontSize: DIMENSIONS.iconSize.large, color: FEATURES[5].color }} />,
  'Resend Email Service': <EmailIcon sx={{ fontSize: DIMENSIONS.iconSize.large, color: FEATURES[6].color }} />,
  'Admin Dashboard': <AdminPanelSettingsIcon sx={{ fontSize: DIMENSIONS.iconSize.large, color: FEATURES[7].color }} />,
  'System Health Monitoring': <MonitorHeartIcon sx={{ fontSize: DIMENSIONS.iconSize.large, color: FEATURES[8].color }} />,
};

/**
 * FeatureCards component
 * This component displays a grid of feature cards highlighting the key features
 * of the SeaNotes SaaS template
 * 
 * The cards are arranged in a responsive grid that changes based on screen size
 * Each card has an icon, title, and description
 */
export default function FeatureCards() {
  return (
    <Box component="section" py={DIMENSIONS.spacing.section} bgcolor="background.default" aria-labelledby="features-title">
      <Container maxWidth="lg">
        <Stack spacing={DIMENSIONS.spacing.card}>
          {/* Section header */}
          <Box component="header">
            <Typography variant="h4" component="h3" id="features-title" fontWeight="bold" textAlign="center">
              What&apos;s included
            </Typography>
          </Box>
          
          {/* Feature cards grid */}
          <Box
            role="grid"
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
              },
              gap: DIMENSIONS.spacing.stack,
            }}
          >
            {/* Map over features and create a card for each one */}
            {FEATURES.map((feature, idx) => (
              <Card component="article" key={idx} role="gridcell" sx={{ height: '100%' }}>
                <CardContent>
                  <Stack spacing={DIMENSIONS.spacing.stack} alignItems="center" textAlign="center">
                    {/* Feature icon in a container */}
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      width: DIMENSIONS.iconContainer.width,
                      height: DIMENSIONS.iconContainer.height,
                      borderRadius: 2,
                      bgcolor: 'grey.50',
                      border: '1px solid',
                      borderColor: 'divider'
                    }}>
                      {featureIcons[feature.title as keyof typeof featureIcons]}
                    </Box>
                    
                    {/* Feature title */}
                    <Box component="header">
                      <Typography variant="h6" component="h4" fontWeight="bold">
                        {feature.title}
                      </Typography>
                    </Box>
                    
                    {/* Feature description */}
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}