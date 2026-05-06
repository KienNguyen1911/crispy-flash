import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile | Flashcard",
  description: "Manage your account and learning statistics",
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
