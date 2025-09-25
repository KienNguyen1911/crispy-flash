'use client';

import React, { createContext, ReactNode, useContext } from 'react';
import type { Topic } from '@/lib/types';
import { ProjectContext } from '@/context/ProjectContext';
import { useToast } from '@/hooks/use-toast';
import { apiUrl } from '@/lib/api';

interface TopicContextType {
  getTopicById: (projectId: string, topicId: string) => Topic | undefined;
  addTopic: (projectId: string, topicData: Omit<Topic, 'id' | 'projectId' | 'vocabulary'>) => Promise<void>;
  updateTopic: (projectId: string, topicId: string, topicData: Partial<Topic>) => Promise<void>;
  deleteTopic: (projectId: string, topicId: string) => Promise<void>;
}

export const TopicContext = createContext<TopicContextType>({
  getTopicById: () => undefined,
  addTopic: async () => {},
  updateTopic: async () => {},
  deleteTopic: async () => {},
});

export function TopicProvider({ children }: { children: ReactNode }) {
  const { projects, reloadProjects, getProjectById } = useContext(ProjectContext);
  const { setProjectTopics } = useContext(ProjectContext);
  const { toast } = useToast();

  const getTopicById = (projectId: string, topicId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project?.topics.find(t => t.id === topicId);
  };

  const addTopic = async (projectId: string, topicData: Omit<Topic, 'id' | 'projectId' | 'vocabulary'>) => {
    try {
      const res = await fetch(apiUrl(`/projects/${projectId}/topics`), { method: 'POST', body: JSON.stringify(topicData), headers: { 'Content-Type': 'application/json' } });
      if (!res.ok) throw new Error('Failed to create topic');
      const created = await res.json();
      // fetch updated topic list for this project and update ProjectContext only
      const topicsRes = await fetch(apiUrl(`/projects/${projectId}/topics`));
      if (topicsRes.ok) {
        const topicsList = await topicsRes.json();
        setProjectTopics(projectId, topicsList.map((t: any) => ({ id: t.id, title: t.title, description: t.description ?? '', vocabulary: [] })));
      }
      toast({ title: 'Topic Created', description: `${created.title}` });
    } catch (err) {
      console.error(err);
      toast({ title: 'Create failed', description: 'Failed to create topic', variant: 'destructive' });
    }
  };

  const updateTopic = async (projectId: string, topicId: string, topicData: Partial<Topic>) => {
    try {
      const res = await fetch(apiUrl(`/projects/${projectId}/topics/${topicId}`), { method: 'PATCH', body: JSON.stringify(topicData), headers: { 'Content-Type': 'application/json' } });
      if (!res.ok) throw new Error('Failed to update topic');
      // refresh topics for the project
      const topicsRes = await fetch(apiUrl(`/projects/${projectId}/topics`));
      if (topicsRes.ok) {
        const topicsList = await topicsRes.json();
        setProjectTopics(projectId, topicsList.map((t: any) => ({ id: t.id, title: t.title, description: t.description ?? '', vocabulary: [] })));
      }
      toast({ title: 'Topic Updated' });
    } catch (err) {
      console.error(err);
      toast({ title: 'Update failed', description: 'Failed to update topic', variant: 'destructive' });
    }
  };

  const deleteTopic = async (projectId: string, topicId: string) => {
    try {
      const res = await fetch(apiUrl(`/projects/${projectId}/topics/${topicId}`), { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete topic');
      const topicsRes = await fetch(apiUrl(`/projects/${projectId}/topics`));
      if (topicsRes.ok) {
        const topicsList = await topicsRes.json();
        setProjectTopics(projectId, topicsList.map((t: any) => ({ id: t.id, title: t.title, description: t.description ?? '', vocabulary: [] })));
      }
      toast({ title: 'Topic Deleted', variant: 'destructive' });
    } catch (err) {
      console.error(err);
      toast({ title: 'Delete failed', description: 'Could not delete topic', variant: 'destructive' });
    }
  };

  return (
    <TopicContext.Provider value={{ getTopicById, addTopic, updateTopic, deleteTopic }}>
      {children}
    </TopicContext.Provider>
  );
}
