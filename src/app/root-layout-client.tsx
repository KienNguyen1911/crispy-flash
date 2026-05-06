'use client';

import dynamic from 'next/dynamic';
import { ReactNode } from 'react';

const FloatingDockClient = dynamic(() => import('@/components/ui/floating-dock-client').then(mod => ({ default: mod.FloatingDockClient })), { ssr: false });

export function RootLayoutClient({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col">
      {children}
      <FloatingDockClient />
    </div>
  );
}
