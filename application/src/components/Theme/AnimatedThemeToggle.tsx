'use client';

import React, { useState, useEffect } from 'react';
import { useThemeMode } from './Theme';
import { styled, keyframes } from '@mui/material/styles';
import { Box, Tooltip } from '@mui/material';
import { LightMode, DarkMode } from '@mui/icons-material';

// Keyframes for the sun rays animation
const sunRays = keyframes`
  0% {
    transform: rotate(0deg);
    opacity: 1;
  }
  25% {
    transform: rotate(15deg);
    opacity: 0.9;
  }
  50% {
    transform: rotate(0deg);
    opacity: 1;
  }
  75% {
    transform: rotate(-15deg);
    opacity: 0.9;
  }
  100% {
    transform: rotate(0deg);
    opacity: 1;
  }
`;

// Keyframes for the moon craters animation
const moonCraters = keyframes`
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

// Keyframes for the toggle switch animation
const toggleSwitch = keyframes`
  0% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(2px);
  }
  100% {
    transform: translateX(0);
  }
`;

// Styled animated sun icon
const AnimatedSunIcon = styled(LightMode)(({ theme }) => ({
  color: theme.palette.warning.main,
  animation: `${sunRays} 4s ease-in-out infinite`,
  '& .MuiSvgIcon-root': {
    transition: 'all 0.3s ease-in-out',
  },
}));

// Styled animated moon icon
const AnimatedMoonIcon = styled(DarkMode)(({ theme }) => ({
  color: theme.palette.info.main,
  animation: `${moonCraters} 3s ease-in-out infinite`,
  '& .MuiSvgIcon-root': {
    transition: 'all 0.3s ease-in-out',
  },
}));

// Styled toggle container with animated background
const ToggleContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: 60,
  height: 30,
  backgroundColor: theme.palette.mode === 'dark' 
    ? theme.palette.grey[700] 
    : theme.palette.grey[300],
  borderRadius: 15,
  cursor: 'pointer',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  border: `2px solid ${theme.palette.divider}`,
  boxShadow: theme.palette.mode === 'dark' 
    ? `0 0 10px ${theme.palette.primary.main}40` 
    : `0 0 10px ${theme.palette.warning.main}40`,
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: theme.palette.mode === 'dark' 
      ? `0 0 15px ${theme.palette.primary.main}60` 
      : `0 0 15px ${theme.palette.warning.main}60`,
  },
}));

// Styled toggle switch
const ToggleSwitch = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 2,
  left: 2,
  width: 22,
  height: 22,
  backgroundColor: theme.palette.background.paper,
  borderRadius: '50%',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
  animation: `${toggleSwitch} 2s ease-in-out infinite`,
}));

// Styled icon container
const IconContainer = styled(Box)(() => ({
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '0.8rem',
}));

interface AnimatedThemeToggleProps {
  position?: 'fixed' | 'absolute' | 'relative';
  top?: number | string;
  right?: number | string;
  marginTop?: number | string;
  marginRight?: number | string;
}

/**
 * Animated theme toggle button that switches between light and dark modes
 * with smooth animations and visual effects.
 */
export const AnimatedThemeToggle: React.FC<AnimatedThemeToggleProps> = ({
  position = 'absolute',
  top = 'auto',
  right = '16px',
  marginTop = '16px',
  marginRight = '16px',
}) => {
  const { mode, toggleMode } = useThemeMode();
  const [isAnimating, setIsAnimating] = useState(false);

  const handleToggle = () => {
    setIsAnimating(true);
    toggleMode();
    
    // Reset animation state after transition
    setTimeout(() => {
      setIsAnimating(false);
    }, 400);
  };

  // Apply animation class when mode changes
  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => {
      setIsAnimating(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [mode]);

  return (
    <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
      <Box
        sx={{
          position,
          top,
          right,
          marginTop,
          marginRight,
          zIndex: 1300,
        }}
      >
        <ToggleContainer onClick={handleToggle}>
          {/* Sun icon (visible in light mode) */}
          <IconContainer
            sx={{
              left: 6,
              opacity: mode === 'light' ? 1 : 0,
              transform: mode === 'light' 
                ? 'translateY(-50%) scale(1)' 
                : 'translateY(-50%) scale(0.5)',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            <AnimatedSunIcon fontSize="small" />
          </IconContainer>
          
          {/* Moon icon (visible in dark mode) */}
          <IconContainer
            sx={{
              right: 6,
              opacity: mode === 'dark' ? 1 : 0,
              transform: mode === 'dark' 
                ? 'translateY(-50%) scale(1)' 
                : 'translateY(-50%) scale(0.5)',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            <AnimatedMoonIcon fontSize="small" />
          </IconContainer>
          
          {/* Toggle switch that moves based on mode */}
          <ToggleSwitch
            sx={{
              left: mode === 'dark' ? 34 : 2,
              backgroundColor: mode === 'dark' 
                ? '#90caf9' 
                : '#fffde7',
              transform: isAnimating 
                ? 'scale(1.1)' 
                : 'scale(1)',
              boxShadow: mode === 'dark' 
                ? '0 0 10px #90caf980' 
                : '0 0 10px #fff59d80',
            }}
          />
        </ToggleContainer>
      </Box>
    </Tooltip>
  );
};

export default AnimatedThemeToggle;