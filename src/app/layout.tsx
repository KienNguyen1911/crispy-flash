import type { Metadata } from 'next';
import './globals.css';
import { AppProviders } from './providers';
import { Toaster } from '@/components/ui/toaster';
import { Header } from '@/components/layout/Header';
import PageLoader from '@/components/ui/PageLoader';
import { Analytics } from "@vercel/analytics/next"

export const metadata: Metadata = {
  title: 'LinguaFlash',
  description: 'A flashcard learning system to master new languages.',
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
      </head>
      <body className="font-body antialiased">
        <AppProviders>
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <PageLoader />
            <main className="flex-1">{children}</main>
          </div>
          <Toaster />
        </AppProviders>
      </body>
    </html>
  );
}
