import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Project | Flashcard",
  description: "Manage your project topics and vocabulary",
};

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
