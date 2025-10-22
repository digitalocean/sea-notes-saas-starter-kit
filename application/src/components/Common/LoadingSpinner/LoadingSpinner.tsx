'use client';

// MUI imports
import { Box, CircularProgress, Fade } from '@mui/material';
import { useNavigating } from 'hooks/navigation';

/**
 * Full screen loading spinner
 * Used as overlay with semi-transparent background
 * This covers the entire screen with a subtle blur effect
 */
function LoadingSpinner() {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        bgcolor: 'rgba(255, 255, 255, 0.6)',
        backdropFilter: 'blur(2px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1300,
      }}
    >
      <CircularProgress color="primary" size={48} />
    </Box>
  );
}

/**
 * Wrapper showing a spinner while navigation is active
 * Uses Fade to apply smooth animation during loading
 * 
 * @param children - Application content that is rendered while there is no load
 */
export default function WithLoadingSpinner({ children }: { children: React.ReactNode }) {
  const { navigating } = useNavigating();

  // Simple check - show spinner when navigating
  const loading = navigating;

  return (
    <>
      {/* Fade in/out the loading spinner */}
      <Fade in={loading} unmountOnExit timeout={250}>
        <div>
          <LoadingSpinner />
        </div>
      </Fade>
      {children}
    </>
  );
}