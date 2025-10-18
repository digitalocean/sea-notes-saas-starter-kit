'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, keyframes } from '@mui/material';
import { useTheme } from '@mui/material/styles';

// Keyframes for the whale animation
const float = keyframes`
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
  100% {
    transform: translateY(0px);
  }
`;

// Keyframes for the ripple effect
const ripple = keyframes`
  0% {
    transform: scale(0.8);
    opacity: 1;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
`;

// Keyframes for the pulse effect
const pulse = keyframes`
  0% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.6;
  }
`;

/**
 * Animated preloader component that displays while the app is loading
 */
const Preloader = () => {
  const theme = useTheme();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Hide the preloader after 2 seconds or when the app is ready
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: theme.palette.background.default,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
    >
      {/* Ripple effect */}
      <Box
        sx={{
          position: 'absolute',
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          border: `2px solid ${theme.palette.primary.main}`,
          animation: `${ripple} 1.5s infinite`,
          opacity: 0.3,
        }}
      />
      
      <Box
        sx={{
          position: 'absolute',
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          border: `2px solid ${theme.palette.primary.main}`,
          animation: `${ripple} 1.5s infinite 0.5s`,
          opacity: 0.2,
        }}
      />
      
      <Box
        sx={{
          position: 'absolute',
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          border: `2px solid ${theme.palette.primary.main}`,
          animation: `${ripple} 1.5s infinite 1s`,
          opacity: 0.1,
        }}
      />

      {/* Whale icon with floating animation */}
      <Box
        sx={{
          fontSize: '4rem',
          animation: `${float} 3s ease-in-out infinite`,
          zIndex: 1,
          filter: theme.palette.mode === 'dark' 
            ? 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.3))' 
            : 'drop-shadow(0 0 10px rgba(0, 0, 0, 0.1))',
        }}
      >
        🐳
      </Box>

      {/* Loading text with pulse animation */}
      <Typography
        variant="h6"
        sx={{
          mt: 4,
          color: theme.palette.text.primary,
          animation: `${pulse} 2s ease-in-out infinite`,
          fontWeight: 500,
          zIndex: 1,
        }}
      >
        SeaNotes is loading...
      </Typography>
    </Box>
  );
};

export default Preloader;