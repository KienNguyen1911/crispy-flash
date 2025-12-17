'use client';

import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { FloatingDock } from '@/components/ui/floating-dock';
import { BackButton } from '@/components/ui/back-button';
import { BookOpen, Home, User, Hourglass, LayoutDashboard, Sparkles } from 'lucide-react';

import { useAuth } from '@/context/AuthContext';

export function FloatingDockClient() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const isHomePage = pathname === '/';
  const isAdmin = user?.role === 'ADMIN';

  const desktopItems = [
    ...(isAdmin ? [{
      title: "Dashboard",
      icon: <LayoutDashboard className="h-full w-full" />,
      href: "/dashboard",
    }] : []),
    {
      title: "Guide",
      icon: (
        <BookOpen className="h-full w-full" />
      ),
      href: "/guide",
      isCurrentPage: pathname === "/guide",
    },
    {
      title: "Review",
      icon: (
        <Hourglass className="h-full w-full" />
      ),
      href: "/review",
      isCurrentPage: pathname === "/review",
    },
    {
      title: "Home",
      icon: (
        <Home className="h-full w-full" />
      ),
      href: "/",
      isCurrentPage: pathname === "/",
    },
    ...(isHomePage
      ? []
      : [
          {
            title: "Back",
            icon: <BackButton />,
            href: "#",
          },
        ]
    ),
    {
      title: "Upgrade",
      icon: (
        <Sparkles className="h-full w-full text-yellow-500" />
      ),
      href: "/checkout",
    },
    {
      title: "Profile",
      icon: (
        <User />
      ),
      href: "/profile",
    },
  ];

  return <FloatingDock items={desktopItems} />;
}