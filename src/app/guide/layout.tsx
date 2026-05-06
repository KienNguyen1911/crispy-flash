import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Learning Guide',
  description: 'Learn how to use the Flashcard Learning System effectively.',
};

export default function GuideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
