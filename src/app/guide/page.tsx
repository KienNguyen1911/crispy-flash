"use client";

import { useAuth } from "@/context/AuthContext";
import DataLoader from "@/components/ui/DataLoader";
import { GuideContent } from "./GuideContent";
import { ResizableNavbar } from "@/components/ui/resizable-navbar";
import { Footer } from "@/components/landing/Footer";

function PublicGuidePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground w-full overflow-x-hidden pt-20">
      <ResizableNavbar />
      <GuideContent />
      <Footer />
    </div>
  );
}

function UserGuidePage() {
  return <GuideContent />;
}

export default function GuidePage() {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) return <DataLoader />;
  
  if (!isAuthenticated) return <PublicGuidePage />;
  
  return <UserGuidePage />;
}