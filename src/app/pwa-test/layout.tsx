import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PWA Test',
  description: 'Test Progressive Web App installation and features.',
};

export default function PWATestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
