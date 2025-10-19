'use client';

import React, { createContext, ReactNode, useContext } from 'react';
import type { Vocabulary } from '@/lib/types';
import { ProjectContext } from '@/context/ProjectContext';
import { useToast } from '@/hooks/use-toast';
import { createVocabulary, updateVocabulary, deleteVocabulary, updateVocabularyStatus } from '@/services/vocabulary-api';
import { useAuth } from './AuthContext';
import { TOAST_DURATION } from '@/lib/constants';

interface VocabularyContextType {
  addVocabulary: (topicId: string, vocabularyItems: Omit<Vocabulary, 'id' | 'topicId' | 'status'> | Omit<Vocabulary, 'id' | 'topicId' | 'status'>[]) => Promise<void>;
  updateVocabulary: (vocabId: string, vocabData: Partial<Vocabulary>) => Promise<void>;
  deleteVocabulary: (vocabId: string) => Promise<void>;
  updateVocabularyStatus: (vocabId: string, status: Vocabulary['status']) => Promise<void>;
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

  const addVocabulary = async (topicId: string, vocabularyItems: Omit<Vocabulary, 'id' | 'topicId' | 'status'> | Omit<Vocabulary, 'id' | 'topicId' | 'status'>[]) => {
    try {
      const itemsArray = Array.isArray(vocabularyItems) ? vocabularyItems : [vocabularyItems];
      console.log(`Sending ${itemsArray.length} vocabulary items to API`);
      const result = await createVocabulary(itemsArray.map(item => ({ ...item, topicId })));
      console.log('API response:', result);
      await reloadProjects();
      toast({ title: 'Vocabulary Saved', description: `${itemsArray.length} new word(s) added.`, duration: TOAST_DURATION });
    } catch (err) {
      console.error('addVocabulary error:', err);
      toast({ title: 'Save failed', description: 'Could not save vocabulary', variant: 'destructive', duration: TOAST_DURATION });
    }
  };

  const updateVocabulary = async (vocabId: string, vocabData: Partial<Vocabulary>) => {
    try {
      await updateVocabulary(vocabId, vocabData);
      await reloadProjects();
      toast({ title: 'Vocabulary Updated', duration: TOAST_DURATION });
    } catch (err) {
      console.error(err);
      toast({ title: 'Update failed', description: 'Could not update vocabulary', variant: 'destructive', duration: TOAST_DURATION });
    }
  };

  const deleteVocabulary = async (vocabId: string) => {
    try {
      await deleteVocabulary(vocabId);
      await reloadProjects();
      toast({ title: 'Vocabulary Deleted', variant: 'destructive', duration: TOAST_DURATION });
    } catch (err) {
      console.error(err);
      toast({ title: 'Delete failed', description: 'Could not delete vocabulary', variant: 'destructive', duration: TOAST_DURATION });
    }
  };

  const updateVocabularyStatus = async (vocabId: string, status: Vocabulary['status']) => {
    try {
      await updateVocabularyStatus(vocabId, status);
      await reloadProjects();
    } catch (err) {
      console.error(err);
      toast({ title: 'Update failed', description: 'Could not update vocabulary status', variant: 'destructive', duration: TOAST_DURATION });
    }
  };

  return (
    <VocabularyContext.Provider value={{ addVocabulary, updateVocabulary, deleteVocabulary, updateVocabularyStatus }}>
      {children}
    </VocabularyContext.Provider>
  );
}