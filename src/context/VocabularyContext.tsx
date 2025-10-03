'use client';

import React, { createContext, ReactNode, useContext } from 'react';
import type { Vocabulary } from '@/lib/types';
import { ProjectContext } from '@/context/ProjectContext';
import { useToast } from '@/hooks/use-toast';
import { apiUrl, apiClient } from '@/lib/api';
import { useAuth } from './AuthContext';

interface VocabularyContextType {
  addVocabulary: (projectId: string, topicId: string, vocabularyItems: Omit<Vocabulary, 'id' | 'topicId' | 'status'>[]) => Promise<void>;
  updateVocabulary: (projectId: string, topicId: string, vocabId: string, vocabData: Partial<Vocabulary>) => Promise<void>;
  deleteVocabulary: (projectId: string, topicId: string, vocabId: string) => Promise<void>;
  updateVocabularyStatus: (projectId: string, topicId: string, vocabId: string, status: Vocabulary['status']) => Promise<void>;
}

export const VocabularyContext = createContext<VocabularyContextType>({
  addVocabulary: async () => {},
  updateVocabulary: async () => {},
  deleteVocabulary: async () => {},
  updateVocabularyStatus: async () => {},
});

export function VocabularyProvider({ children }: { children: ReactNode }) {
  const { reloadProjects } = useContext(ProjectContext);
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  const addVocabulary = async (projectId: string, topicId: string, vocabularyItems: Omit<Vocabulary, 'id' | 'topicId' | 'status'>[]) => {
    try {
      console.log(`Sending ${vocabularyItems.length} vocabulary items to API`);
      const result = await apiClient(`/projects/${projectId}/topics/${topicId}/vocabulary`, {
        method: 'POST',
        body: JSON.stringify(vocabularyItems),
      });
      console.log('API response:', result);
      await reloadProjects();
      toast({ title: 'Vocabulary Saved', description: `${vocabularyItems.length} new word(s) added.`, duration: 4000 });
    } catch (err) {
      console.error('addVocabulary error:', err);
      toast({ title: 'Save failed', description: 'Could not save vocabulary', variant: 'destructive', duration: 4000 });
    }
  };

  const updateVocabulary = async (projectId: string, topicId: string, vocabId: string, vocabData: Partial<Vocabulary>) => {
    try {
      await apiClient(`/projects/${projectId}/topics/${topicId}/vocabulary/${vocabId}`, {
        method: 'PATCH',
        body: JSON.stringify(vocabData),
      });
      await reloadProjects();
      toast({ title: 'Vocabulary Updated', duration: 4000 });
    } catch (err) {
      console.error(err);
      toast({ title: 'Update failed', description: 'Could not update vocabulary', variant: 'destructive', duration: 4000 });
    }
  };

  const deleteVocabulary = async (projectId: string, topicId: string, vocabId: string) => {
    try {
      await apiClient(`/projects/${projectId}/topics/${topicId}/vocabulary/${vocabId}`, {
        method: 'DELETE',
      });
      await reloadProjects();
      toast({ title: 'Vocabulary Deleted', variant: 'destructive', duration: 4000 });
    } catch (err) {
      console.error(err);
      toast({ title: 'Delete failed', description: 'Could not delete vocabulary', variant: 'destructive', duration: 4000 });
    }
  };

  const updateVocabularyStatus = async (projectId: string, topicId: string, vocabId: string, status: Vocabulary['status']) => {
    try {
      await apiClient(`/projects/${projectId}/topics/${topicId}/vocabulary/${vocabId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      await reloadProjects();
    } catch (err) {
      console.error(err);
      toast({ title: 'Update failed', description: 'Could not update vocabulary status', variant: 'destructive', duration: 4000 });
    }
  };

  return (
    <VocabularyContext.Provider value={{ addVocabulary, updateVocabulary, deleteVocabulary, updateVocabularyStatus }}>
      {children}
    </VocabularyContext.Provider>
  );
}