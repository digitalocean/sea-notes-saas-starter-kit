import type { Metadata } from 'next';
import { Geist, Geist_Mono, Roboto, Plus_Jakarta_Sans, Inter } from 'next/font/google';
import { Providers } from 'context/Providers';
import WithLoadingSpinner from 'components/Common/LoadingSpinner/LoadingSpinner';
import Preloader from 'components/Common/Preloader/Preloader';
import { ClerkProvider } from '@clerk/nextjs';

// Setting up all the fonts we'll be using throughout the app
// Geist for the main UI, Roboto and Plus Jakarta Sans for headers
const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto',
});

const plusJakartaSans = Plus_Jakarta_Sans({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-plus-jakarta-sans',
});

const inter = Inter({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

// Basic metadata for the app
export const metadata: Metadata = {
  title: 'SeaNotes',
  description: 'SeaNotes - A SaaS Starter Kit note-taking app from DigitalOcean',
};

/**
 * Root layout component - this wraps the entire application
 * Sets up all our fonts, Clerk auth, and global providers
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Clerk provider for authentication
    <ClerkProvider>
      <html 
        lang="en" 
        // Apply all our custom fonts to the html element
        className={`${roboto.variable} ${plusJakartaSans.variable} ${inter.variable}`}
      >
        <body
          // Apply Geist fonts to the body
          className={`${geistSans.variable} ${geistMono.variable}`}
          // Reset default browser styles
          style={{ 
            margin: 0, 
            WebkitFontSmoothing: 'antialiased', 
            MozOsxFontSmoothing: 'grayscale' 
          }}
        >
          {/* Show preloader while app is loading */}
          <Preloader />
          {/* All our global context providers */}
          <Providers>
            {/* Loading spinner that shows during navigation */}
            <WithLoadingSpinner>
              {children}
            </WithLoadingSpinner>
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}