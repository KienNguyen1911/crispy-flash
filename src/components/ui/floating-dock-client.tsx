'use client';

import { usePathname } from 'next/navigation';
import { FloatingDock } from '@/components/ui/floating-dock';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { AuthIcon } from '@/components/ui/auth-button';
import { BackButton } from '@/components/ui/back-button';
import { BookOpen, Home, FolderOpen } from 'lucide-react';

export function FloatingDockClient() {
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  const desktopItems = [
    {
      title: "Guide",
      icon: (
        <BookOpen className="h-full w-full text-primary" />
      ),
      href: "/guide",
    },
    {
      title: "Home",
      icon: (
        <Home className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "/",
    },
    ...(isHomePage
      ? [
        //   {
        //     title: "Projects",
        //     icon: (
        //       <FolderOpen className="h-full w-full text-neutral-500 dark:text-neutral-300" />
        //     ),
        //     href: "/projects",
        //   },
        ]
      : [
          {
            title: "Back",
            icon: <BackButton />,
            href: "#",
          },
        ]
    ),
    {
      title: "Toggle Theme",
      icon: (
        <ThemeToggle />
      ),
      href: "#",
    },
    {
      title: "Account",
      icon: (
        <AuthIcon />
      ),
      href: "#",
    },
  ];

  return <FloatingDock items={desktopItems} />;
}