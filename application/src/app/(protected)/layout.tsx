import { Box } from '@mui/material';
import Sidebar from 'components/Common/Sidebar/Sidebar';
import { ThemePicker } from 'components/Theme/ThemePicker';
import NavigationHandler from './NavigationHandler';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

/**
 * Dashboard layout wrapper.
 * Injects the Dashboard layout and renders its child content.
 *
 * @param children - Content of the pages inside the dashboard layout.
 */
export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  
  // If the user is not authenticated, redirect to the auth page
  if (!userId) {
    redirect('/auth');
  }

  return (
    <>
      <NavigationHandler />
      <Box sx={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
        <Sidebar />
        <Box
          sx={{
            flexGrow: 1,
            padding: '1rem',
            overflowY: 'auto',
            position: 'relative',
          }}
        >
          {/* Keep the existing ThemePicker for theme selection */}
          <Box
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              zIndex: 10,
              display: { xs: 'none', md: 'block' }, // Hide on mobile since FAB is used
            }}
          >
            <ThemePicker />
          </Box>
          
          {/* Mobile theme picker renders itself with fixed positioning */}
          <Box sx={{ display: { xs: 'block', md: 'none' }, position: 'fixed', top: 70, right: 16 }}>
            <ThemePicker />
          </Box>
          
          {children}
        </Box>
      </Box>
    </>
  );
}