import type { Metadata } from 'next';
import { Geist, Geist_Mono, Roboto, Plus_Jakarta_Sans, Inter } from 'next/font/google';
import { Providers } from 'context/Providers';
import WithLoadingSpinner from 'components/Common/LoadingSpinner/LoadingSpinner';
import Preloader from 'components/Common/Preloader/Preloader';

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

export const metadata: Metadata = {
  title: 'SeaNotes',
  description: 'SeaNotes - A SaaS Starter Kit note-taking app from DigitalOcean',
};

/**
 * Root layout of the application.
 * Applies global fonts, base styles and provides shared context through the Providers component.
 *
 * @returns HTML layout with fonts and providers applied.
 */
const RootLayout = ({ children }: { children: React.ReactNode }) => (
  <html lang="en" className={`${roboto.variable} ${plusJakartaSans.variable} ${inter.variable}`}>
    <body
      className={`${geistSans.variable} ${geistMono.variable}`}
      style={{ margin: 0, WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}
    >
      <Preloader />
      <Providers>
        <WithLoadingSpinner>{children}</WithLoadingSpinner>
      </Providers>
    </body>
  </html>
);

export default RootLayout;