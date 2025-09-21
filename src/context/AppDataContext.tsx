'use client';

import { createContext, ReactNode, useEffect, useState } from 'react';
import type { Project, Topic, Vocabulary } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface AppDataContextType {
  projects: Project[];
  addProject: (projectData: Omit<Project, 'id' | 'topics'>) => void;
  updateProject: (projectId: string, projectData: Partial<Project>) => void;
  deleteProject: (projectId: string) => void;
  getProjectById: (projectId: string) => Project | undefined;
  addTopic: (projectId: string, topicData: Omit<Topic, 'id' | 'projectId' | 'vocabulary'>) => void;
  updateTopic: (projectId: string, topicId: string, topicData: Partial<Topic>) => void;
  deleteTopic: (projectId: string, topicId: string) => void;
  getTopicById: (projectId: string, topicId: string) => Topic | undefined;
  addVocabulary: (projectId: string, topicId: string, vocabularyItems: Omit<Vocabulary, 'id' | 'topicId' | 'status'>[]) => void;
  updateVocabulary: (projectId: string, topicId: string, vocabId: string, vocabData: Partial<Vocabulary>) => void;
  deleteVocabulary: (projectId: string, topicId: string, vocabId: string) => void;
  updateVocabularyStatus: (projectId: string, topicId: string, vocabId: string, status: Vocabulary['status']) => void;
}

export const AppDataContext = createContext<AppDataContextType>({
  projects: [],
  addProject: async () => {},
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

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const { toast } = useToast();

  // load projects from API on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/projects');
        if (!res.ok) throw new Error('Failed to load projects');
        const data = await res.json();
        if (mounted) setProjects(data.map((p: any) => ({ id: p.id, name: p.title ?? p.name ?? '', description: p.description ?? '', topics: p.topics ?? [] })));
      } catch (err) {
        console.error(err);
        toast({ title: 'Load error', description: 'Could not load projects from server.' });
      }
    })();
    return () => { mounted = false; };
  }, [toast]);

  const getProjectById = (projectId: string) => projects.find(p => p.id === projectId);

  const getTopicById = (projectId: string, topicId: string) => {
    const project = getProjectById(projectId);
    return project?.topics.find(t => t.id === topicId);
  }

  const addProject = async (projectData: Omit<Project, 'id' | 'topics'>) => {
    try {
      const body = { title: projectData.name, description: projectData.description };
      const res = await fetch('/api/projects', { method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        toast({ title: 'Create failed', description: errBody?.error || 'Failed to create project', variant: 'destructive' });
        return false;
      }
      const createdRaw: any = await res.json();
      const created: Project = { id: createdRaw.id, name: createdRaw.title ?? createdRaw.name ?? projectData.name, description: createdRaw.description ?? projectData.description ?? '', topics: createdRaw.topics ?? [] };
      setProjects(prev => [...prev, created]);
      toast({ title: 'Project Created', description: `${created.name}` });
      return true;
    } catch (err: any) {
      console.error(err);
      toast({ title: 'Create failed', description: err?.message || 'Failed to create project', variant: 'destructive' });
      return false;
    }
  };

  const updateProject = async (projectId: string, projectData: Partial<Project>) => {
    const body = { title: projectData.name, description: projectData.description };
    const res = await fetch(`/api/projects/${projectId}`, { method: 'PATCH', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } });
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody?.error || 'Failed to update project');
    }
    const updatedRaw: any = await res.json();
    const updated: Project = { id: updatedRaw.id, name: updatedRaw.title ?? updatedRaw.name ?? projectData.name ?? '', description: updatedRaw.description ?? projectData.description ?? '', topics: updatedRaw.topics ?? [] };
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, ...updated } : p));
    toast({ title: 'Project Updated' });
  };

  const deleteProject = async (projectId: string) => {
    const res = await fetch(`/api/projects/${projectId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete project');
    setProjects(prev => prev.filter(p => p.id !== projectId));
    toast({ title: 'Project Deleted', variant: 'destructive' });
  };

  const addTopic = async (projectId: string, topicData: Omit<Topic, 'id' | 'projectId' | 'vocabulary'>) => {
    const res = await fetch(`/api/projects/${projectId}/topics`, { method: 'POST', body: JSON.stringify(topicData), headers: { 'Content-Type': 'application/json' } });
    if (!res.ok) throw new Error('Failed to create topic');
    const created: Topic = await res.json();
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, topics: [...p.topics, created] } : p));
    toast({ title: 'Topic Created', description: `${created.title}` });
  };

  const updateTopic = async (projectId: string, topicId: string, topicData: Partial<Topic>) => {
    const res = await fetch(`/api/projects/${projectId}/topics/${topicId}`, { method: 'PATCH', body: JSON.stringify(topicData), headers: { 'Content-Type': 'application/json' } });
    if (!res.ok) throw new Error('Failed to update topic');
    const updated: Topic = await res.json();
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, topics: p.topics.map(t => t.id === topicId ? updated : t) } : p));
    toast({ title: 'Topic Updated' });
  };

  const deleteTopic = async (projectId: string, topicId: string) => {
    const res = await fetch(`/api/projects/${projectId}/topics/${topicId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete topic');
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, topics: p.topics.filter(t => t.id !== topicId) } : p));
    toast({ title: 'Topic Deleted', variant: 'destructive' });
  };

  const addVocabulary = async (projectId: string, topicId: string, vocabularyItems: Omit<Vocabulary, 'id' | 'topicId' | 'status'>[]) => {
    // create multiple vocabulary items sequentially
    const createdItems: Vocabulary[] = [];
    for (const v of vocabularyItems) {
      const res = await fetch(`/api/projects/${projectId}/topics/${topicId}/vocabulary`, { method: 'POST', body: JSON.stringify(v), headers: { 'Content-Type': 'application/json' } });
      if (!res.ok) throw new Error('Failed to create vocabulary');
      const created: Vocabulary = await res.json();
      createdItems.push(created);
    }
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, topics: p.topics.map(t => t.id === topicId ? { ...t, vocabulary: [...t.vocabulary, ...createdItems] } : t) } : p));
    toast({ title: 'Vocabulary Saved', description: `${createdItems.length} new word(s) added.` });
  };

  const updateVocabulary = async (projectId: string, topicId: string, vocabId: string, vocabData: Partial<Vocabulary>) => {
    const res = await fetch(`/api/projects/${projectId}/topics/${topicId}/vocabulary/${vocabId}`, { method: 'PATCH', body: JSON.stringify(vocabData), headers: { 'Content-Type': 'application/json' } });
    if (!res.ok) throw new Error('Failed to update vocabulary');
    const updated: Vocabulary = await res.json();
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, topics: p.topics.map(t => t.id === topicId ? { ...t, vocabulary: t.vocabulary.map(v => v.id === vocabId ? updated : v) } : t) } : p));
    toast({ title: 'Vocabulary Updated' });
  };

  const deleteVocabulary = async (projectId: string, topicId: string, vocabId: string) => {
    const res = await fetch(`/api/projects/${projectId}/topics/${topicId}/vocabulary/${vocabId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete vocabulary');
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, topics: p.topics.map(t => t.id === topicId ? { ...t, vocabulary: t.vocabulary.filter(v => v.id !== vocabId) } : t) } : p));
    toast({ title: 'Vocabulary Deleted', variant: 'destructive' });
  };
  
  const updateVocabularyStatus = async (projectId: string, topicId: string, vocabId: string, status: Vocabulary['status']) => {
    await updateVocabulary(projectId, topicId, vocabId, { status });
  };

  const value = {
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

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}
