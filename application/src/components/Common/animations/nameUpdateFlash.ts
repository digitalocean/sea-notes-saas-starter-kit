/**
 * Shared animation utility for name update flash effect
 * Used across EnvironmentsListView and EnvironmentsGridView components
 */

import { SxProps, Theme } from '@mui/material';

/**
 * Returns the keyframes for the name update flash animation
 * @param withPadding - Whether to include padding in the animation (for grid view)
 */
export const getNameUpdateFlashKeyframes = (withPadding: boolean = false) => {
  const basePadding = withPadding ? { padding: '2px 4px' } : {};
  
  return {
    '0%': { 
      backgroundColor: 'rgba(76, 175, 80, 0.3)', // Light green
      borderRadius: '4px',
      ...basePadding
    },
    '100%': { 
      backgroundColor: 'transparent',
      borderRadius: '4px',
      ...basePadding
    }
  };
};

/**
 * Returns the complete sx object for name update flash animation
 * @param isAnimating - Whether the animation should be active
 * @param withPadding - Whether to include padding in the animation (for grid view)
 */
export const getNameUpdateFlashAnimation = (
  isAnimating: boolean, 
  withPadding: boolean = false
): SxProps<Theme> => ({
  animation: isAnimating ? 'nameUpdateFlash 3s ease-out' : 'none',
  '@keyframes nameUpdateFlash': getNameUpdateFlashKeyframes(withPadding),
  '@media (prefers-reduced-motion: reduce)': {
    animation: 'none', // Disable animation for users who prefer reduced motion
  }
});