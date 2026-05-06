import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Topic Learning',
  description: 'Learn vocabulary with interactive flashcards.',
};

export default function TopicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
