import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'QR Login',
  description: 'Scan QR code to login to your account.',
};

export default function QrLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
