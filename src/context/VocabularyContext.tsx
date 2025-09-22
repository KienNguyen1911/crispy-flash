'use client';

import React, { createContext, ReactNode, useContext } from 'react';
import type { Vocabulary } from '@/lib/types';
import { ProjectContext } from '@/context/ProjectContext';
import { useToast } from '@/hooks/use-toast';

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

  const addVocabulary = async (projectId: string, topicId: string, vocabularyItems: Omit<Vocabulary, 'id' | 'topicId' | 'status'>[]) => {
    try {
      // create multiple vocabulary items sequentially (keeps existing behavior)
      for (const v of vocabularyItems) {
        const res = await fetch(`/api/projects/${projectId}/topics/${topicId}/vocabulary`, { method: 'POST', body: JSON.stringify(v), headers: { 'Content-Type': 'application/json' } });
        if (!res.ok) throw new Error('Failed to create vocabulary');
      }
      await reloadProjects();
      toast({ title: 'Vocabulary Saved', description: `${vocabularyItems.length} new word(s) added.` });
    } catch (err) {
      console.error(err);
      toast({ title: 'Save failed', description: 'Could not save vocabulary', variant: 'destructive' });
    }
  };

  const updateVocabulary = async (projectId: string, topicId: string, vocabId: string, vocabData: Partial<Vocabulary>) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/topics/${topicId}/vocabulary/${vocabId}`, { method: 'PATCH', body: JSON.stringify(vocabData), headers: { 'Content-Type': 'application/json' } });
      if (!res.ok) throw new Error('Failed to update vocabulary');
      await reloadProjects();
      toast({ title: 'Vocabulary Updated' });
    } catch (err) {
      console.error(err);
      toast({ title: 'Update failed', description: 'Could not update vocabulary', variant: 'destructive' });
    }
  };

  const deleteVocabulary = async (projectId: string, topicId: string, vocabId: string) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/topics/${topicId}/vocabulary/${vocabId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete vocabulary');
      await reloadProjects();
      toast({ title: 'Vocabulary Deleted', variant: 'destructive' });
    } catch (err) {
      console.error(err);
      toast({ title: 'Delete failed', description: 'Could not delete vocabulary', variant: 'destructive' });
    }
  };

  const updateVocabularyStatus = async (projectId: string, topicId: string, vocabId: string, status: Vocabulary['status']) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/topics/${topicId}/vocabulary/${vocabId}`, { method: 'PATCH', body: JSON.stringify({ status }), headers: { 'Content-Type': 'application/json' } });
      if (!res.ok) throw new Error('Failed to update vocabulary status');
      await reloadProjects();
    } catch (err) {
      console.error(err);
      toast({ title: 'Update failed', description: 'Could not update vocabulary status', variant: 'destructive' });
    }
  };

  return (
    <VocabularyContext.Provider value={{ addVocabulary, updateVocabulary, deleteVocabulary, updateVocabularyStatus }}>
      {children}
    </VocabularyContext.Provider>
  );
}
