import React from 'react';
import { Box } from '@mui/material';
import HeroSection from 'components/Public/HeroSection/HeroSection';
import ApplicationPreview from 'components/Public/ApplicationPreview/ApplicationPreview';
import FeatureCards from 'components/Public/FeatureCards/FeatureCards';
import CTASection from 'components/Public/CTASection/CTASection';

/**
 * Home page component that displays the landing page with hero section,
 * application preview, feature cards, and call-to-action section.
 * @returns {JSX.Element} The home page component
 */
const Home = () => {
  return (
    <Box component="main">
      <HeroSection />
      <ApplicationPreview />
      <FeatureCards />
      <CTASection />
    </Box>
  );
};

export default Home;
