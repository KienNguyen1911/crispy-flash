'use client';

import { ProjectProvider } from '@/context/ProjectContext';
import { TopicProvider } from '@/context/TopicContext';
import { VocabularyProvider } from '@/context/VocabularyContext';
import { type ReactNode } from 'react';
import { SWRConfig } from 'swr';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '@/context/AuthContext'; // Import AuthProvider
import { PWARegister } from '@/components/PWARegister';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider> { /* Use AuthProvider instead of SessionProvider */ }
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <SWRConfig
          value={{
            revalidateOnFocus: false,
            revalidateOnReconnect: true,
            dedupingInterval: 5000, // 5 seconds
          }}
        >
          <ProjectProvider>
            <TopicProvider>
              <VocabularyProvider>
                <PWARegister />
                {children}
              </VocabularyProvider>
            </TopicProvider>
          </ProjectProvider>
        </SWRConfig>
      </ThemeProvider>
    </AuthProvider>
  );
}