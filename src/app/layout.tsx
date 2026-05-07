import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import { AppProviders } from './providers';
import { Toaster } from '@/components/ui/toaster';
import { MainContent } from '@/components/ui/main-content';
import PageLoader from '@/components/ui/PageLoader';
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { PWAInstall } from '@/components/PWAInstall';
import { PWAiOSInstall } from '@/components/PWAiOSInstall';
import { PWADesktopInstall } from '@/components/PWADesktopInstall';
import { RootLayoutClient } from './root-layout-client';

export const dynamic = 'force-dynamic';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });

export const metadata: Metadata = {
  title: 'Lingofy',
  description: 'A flashcard learning system to master new languages.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Lingofy',
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'Lingofy',
    'msapplication-TileColor': '#000000',
    'msapplication-tap-highlight': 'no',
    'theme-color': '#000000',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* PWA Icons */}
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.svg" />
        <link rel="icon" type="image/svg+xml" sizes="32x32" href="/icons/favicon-32x32.svg" />
        <link rel="icon" type="image/svg+xml" sizes="16x16" href="/icons/favicon-16x16.svg" />
        <link rel="mask-icon" href="/icons/safari-pinned-tab.svg" color="#000000" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="theme-color" content="#000000" />
        <meta name="google-site-verification" content="kpGH1OCFFQJ2nuwsikJU7gocp-x05eGTjD3yFI57eHU" />
      </head>
      <body className={`${inter.variable} ${outfit.variable} font-body antialiased`}>
        <AppProviders>
          <RootLayoutClient>
            <PageLoader />
            <MainContent>{children}</MainContent>
          </RootLayoutClient>
          <Toaster />
          <PWAInstall />
          <PWAiOSInstall />
          <PWADesktopInstall />
        </AppProviders>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}