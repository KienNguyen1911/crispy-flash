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

  if (pathname.startsWith('/dashboard')) {
    return null;
  }

  const allItems = [
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
    },
    {
      title: "Review",
      icon: (
        <Hourglass className="h-full w-full" />
      ),
      href: "/review",
    },
    {
      title: "Home",
      icon: (
        <Home className="h-full w-full" />
      ),
      href: "/",
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

  const desktopItems = allItems.filter(item => item.href !== pathname);

  return <FloatingDock items={desktopItems} />;
}