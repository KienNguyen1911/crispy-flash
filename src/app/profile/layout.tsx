import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'User Profile',
  description: 'Manage your profile, activity, and API settings.',
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
