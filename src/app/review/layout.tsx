import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Smart Review',
  description: 'Review vocabulary with spaced repetition learning',
};

export default function ReviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
