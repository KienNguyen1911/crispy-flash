'use client';

import { AppDataProvider } from '@/context/AppDataContext';
import { type ReactNode } from 'react';

export function AppProviders({ children }: { children: ReactNode }) {
  return <AppDataProvider>{children}</AppDataProvider>;
}
