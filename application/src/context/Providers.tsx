'use client';

// Import all our context providers
import { SessionProvider } from 'next-auth/react';
import { UserProvider } from './UserContext';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { NavigatingProvider } from './Navigation';
import MaterialThemeProvider from 'components/Theme/Theme';

/**
 * Global wrapper that groups all context providers used in the application
 * This makes sure all our global state is available throughout the app
 * 
 * Providers are nested in a specific order:
 * 1. SessionProvider (auth) - outermost because other providers might need auth info
 * 2. AppRouterCacheProvider (MUI) - for MUI to work with Next.js App Router
 * 3. MaterialThemeProvider (theme) - for theming
 * 4. UserProvider (user data) - for custom user info
 * 5. NavigatingProvider (navigation state) - for loading states during navigation
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    // NextAuth session provider
    <SessionProvider>
      {/* MUI App Router cache provider */}
      <AppRouterCacheProvider options={{ enableCssLayer: true }}>
        {/* Our custom Material UI theme provider */}
        <MaterialThemeProvider>
          {/* Custom user context provider */}
          <UserProvider>
            {/* Navigation state provider */}
            <NavigatingProvider>
              {children}
            </NavigatingProvider>
          </UserProvider>
        </MaterialThemeProvider>
      </AppRouterCacheProvider>
    </SessionProvider>
  );
}