"use client";

import { useAuth } from "@/context/AuthContext";
import DataLoader from "@/components/ui/DataLoader";
import { LandingPage } from "@/components/landing/LandingPage";
import { UserDashboard } from "@/components/dashboard/UserDashboard";

export const metadata = {
  title: "Flashcard Learning System",
  description: "Create projects, organize topics, and learn vocabulary with interactive flashcards",
};

export default function Page() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <DataLoader />;
  }

  if (!isAuthenticated) {
    return <LandingPage />;
  }

  return <UserDashboard />;
}
