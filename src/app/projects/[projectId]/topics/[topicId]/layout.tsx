import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Topic Details | Flashcard",
  description: "View and manage vocabulary in your topic",
};

export default function TopicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
