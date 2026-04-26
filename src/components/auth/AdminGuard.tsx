"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push("/");
      } else if (user?.role !== "ADMIN") {
        router.push("/"); // Non-admin users belong on the main user dashboard
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated || user?.role !== "ADMIN") {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-4 text-center">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Admin access required</h1>
          <p className="text-muted-foreground">
            This page is only available to admin accounts. Redirecting you to the main dashboard.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
