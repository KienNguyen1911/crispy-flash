import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Project Analytics | Flashcard",
  description: "View your project learning analytics and progress",
};

export default function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
