'use client';

import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { FloatingDock } from '@/components/ui/floating-dock';
import { BackButton } from '@/components/ui/back-button';
import { BookOpen, Home, User, Hourglass } from 'lucide-react';

export function FloatingDockClient() {
  const pathname = usePathname();
  const router = useRouter();
  const isHomePage = pathname === '/';

  const desktopItems = [
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
      title: "Profile",
      icon: (
        <User />
      ),
      href: "/profile",
    },
  ];

  return <FloatingDock items={desktopItems} />;
}