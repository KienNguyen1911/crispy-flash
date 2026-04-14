"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

export function MainContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const isDashboard = pathname?.startsWith("/dashboard");
  const isPublicPage = (pathname === "/" || pathname === "/guide") && !user;

  return (
    <main className={cn("flex-1", (!isDashboard && !isPublicPage) && "mb-16")}>
      {children}
    </main>
  );
}
