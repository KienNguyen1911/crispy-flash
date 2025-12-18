import type { Metadata } from 'next';
import './globals.css';
import { AppProviders } from './providers';
import { Toaster } from '@/components/ui/toaster';
import { FloatingDockClient } from '@/components/ui/floating-dock-client';
import { MainContent } from '@/components/ui/main-content';
import PageLoader from '@/components/ui/PageLoader';
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { PWAInstall } from '@/components/PWAInstall';
import { PWAiOSInstall } from '@/components/PWAiOSInstall';
import { PWADesktopInstall } from '@/components/PWADesktopInstall';

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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&family=PT+Sans:wght@400;700&display=swap"
          rel="stylesheet"
        />
        {/* PWA Icons */}
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.svg" />
        <link rel="icon" type="image/svg+xml" sizes="32x32" href="/icons/favicon-32x32.svg" />
        <link rel="icon" type="image/svg+xml" sizes="16x16" href="/icons/favicon-16x16.svg" />
        <link rel="mask-icon" href="/icons/safari-pinned-tab.svg" color="#000000" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="theme-color" content="#000000" />
        <meta name="google-site-verification" content="kpGH1OCFFQJ2nuwsikJU7gocp-x05eGTjD3yFI57eHU" />
      </head>
      <body className="font-body antialiased">
        <AppProviders>
          <div className="relative flex min-h-screen flex-col">
            <PageLoader />
            <MainContent>{children}</MainContent>
            <FloatingDockClient />
          </div>
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