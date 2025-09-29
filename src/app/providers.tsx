'use client';

import { ProjectProvider } from '@/context/ProjectContext';
import { TopicProvider } from '@/context/TopicContext';
import { VocabularyProvider } from '@/context/VocabularyContext';
import { type ReactNode } from 'react';
import { SWRConfig } from 'swr';
import { ThemeProvider } from 'next-themes';
import { SessionProvider } from 'next-auth/react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <SWRConfig
          value={{
            fetcher,
            revalidateOnFocus: false,
            revalidateOnReconnect: true,
            dedupingInterval: 5000, // 5 seconds
          }}
        >
          <ProjectProvider>
            <TopicProvider>
              <VocabularyProvider>
                {children}
              </VocabularyProvider>
            </TopicProvider>
          </ProjectProvider>
        </SWRConfig>
      </ThemeProvider>
    </SessionProvider>
  );
}
