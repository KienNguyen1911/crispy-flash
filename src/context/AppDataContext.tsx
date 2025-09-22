'use client';

import React, { createContext, ReactNode, useContext } from 'react';
import type { Project, Topic, Vocabulary } from '@/lib/types';
import { ProjectContext } from '@/context/ProjectContext';
import { TopicContext } from '@/context/TopicContext';
import { VocabularyContext } from '@/context/VocabularyContext';

interface AppDataContextType {
  projects: Project[];
  addProject: (projectData: Omit<Project, 'id' | 'topics'>) => Promise<boolean>;
  updateProject: (projectId: string, projectData: Partial<Project>) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  getProjectById: (projectId: string) => Project | undefined;
  addTopic: (projectId: string, topicData: Omit<Topic, 'id' | 'projectId' | 'vocabulary'>) => Promise<void>;
  updateTopic: (projectId: string, topicId: string, topicData: Partial<Topic>) => Promise<void>;
  deleteTopic: (projectId: string, topicId: string) => Promise<void>;
  getTopicById: (projectId: string, topicId: string) => Topic | undefined;
  addVocabulary: (projectId: string, topicId: string, vocabularyItems: Omit<Vocabulary, 'id' | 'topicId' | 'status'>[]) => Promise<void>;
  updateVocabulary: (projectId: string, topicId: string, vocabId: string, vocabData: Partial<Vocabulary>) => Promise<void>;
  deleteVocabulary: (projectId: string, topicId: string, vocabId: string) => Promise<void>;
  updateVocabularyStatus: (projectId: string, topicId: string, vocabId: string, status: Vocabulary['status']) => Promise<void>;
}

export const AppDataContext = createContext<AppDataContextType>({
  projects: [],
  addProject: async () => false,
  updateProject: async () => {},
  deleteProject: async () => {},
  getProjectById: () => undefined,
  addTopic: async () => {},
  updateTopic: async () => {},
  deleteTopic: async () => {},
  getTopicById: () => undefined,
  addVocabulary: async () => {},
  updateVocabulary: async () => {},
  deleteVocabulary: async () => {},
  updateVocabularyStatus: async () => {},
});

// Compatibility provider: composes the per-model providers and exposes the original API
export function AppDataProvider({ children }: { children: ReactNode }) {
  // We can't call hooks for the contexts until they are provided, so create an inner component
  function InnerProvider({ children: innerChildren }: { children: ReactNode }) {
    const { projects, reloadProjects, addProject, updateProject, deleteProject, getProjectById } = useContext(ProjectContext);
    const { getTopicById, addTopic, updateTopic, deleteTopic } = useContext(TopicContext);
    const { addVocabulary, updateVocabulary, deleteVocabulary, updateVocabularyStatus } = useContext(VocabularyContext);

    const value: AppDataContextType = {
      projects,
      addProject,
      updateProject,
      deleteProject,
      getProjectById,
      addTopic,
      updateTopic,
      deleteTopic,
      getTopicById,
      addVocabulary,
      updateVocabulary,
      deleteVocabulary,
      updateVocabularyStatus,
    };

    return <AppDataContext.Provider value={value}>{innerChildren}</AppDataContext.Provider>;
  }

  // Compose the concrete providers so downstream consumers still get the same behaviour
  return (
    <ProjectContext.Provider value={useContext(ProjectContext) as any}>
      <TopicContext.Provider value={useContext(TopicContext) as any}>
        <VocabularyContext.Provider value={useContext(VocabularyContext) as any}>
          <InnerProvider>{children}</InnerProvider>
        </VocabularyContext.Provider>
      </TopicContext.Provider>
    </ProjectContext.Provider>
  );
}
