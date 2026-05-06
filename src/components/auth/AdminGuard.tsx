"use client";

import { useAuth } from "@/context/AuthContext";
import { redirect } from "next/navigation";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated || user?.role !== "ADMIN") {
    redirect("/");
  }

  return <>{children}</>;
}
