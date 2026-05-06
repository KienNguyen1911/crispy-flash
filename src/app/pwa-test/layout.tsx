import { Metadata } from "next";

export const metadata: Metadata = {
  title: "PWA Test | Flashcard",
  description: "Test Progressive Web App installation status",
};

export default function PWATestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
