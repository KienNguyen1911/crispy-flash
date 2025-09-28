'use client';

import { ProjectProvider } from '@/context/ProjectContext';
import { TopicProvider } from '@/context/TopicContext';
import { VocabularyProvider } from '@/context/VocabularyContext';
import { type ReactNode } from 'react';
import { SWRConfig } from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function AppProviders({ children }: { children: ReactNode }) {
  return (
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
  );
}
