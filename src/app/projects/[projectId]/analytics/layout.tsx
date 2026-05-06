import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Project Analytics',
  description: 'View your learning progress and analytics.',
};

export default function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
