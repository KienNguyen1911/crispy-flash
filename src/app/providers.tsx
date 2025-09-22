'use client';

import { ProjectProvider } from '@/context/ProjectContext';
import { TopicProvider } from '@/context/TopicContext';
import { VocabularyProvider } from '@/context/VocabularyContext';
import { type ReactNode } from 'react';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ProjectProvider>
      <TopicProvider>
        <VocabularyProvider>
          {children}
        </VocabularyProvider>
      </TopicProvider>
    </ProjectProvider>
  );
}
