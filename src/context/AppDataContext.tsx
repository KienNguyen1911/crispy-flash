'use client';

import { createContext, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import useLocalStorage from '@/hooks/use-local-storage';
import { initialProjects } from '@/lib/mock-data';
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
  addProject: () => {},
  updateProject: () => {},
  deleteProject: () => {},
  getProjectById: () => undefined,
  addTopic: () => {},
  updateTopic: () => {},
  deleteTopic: () => {},
  getTopicById: () => undefined,
  addVocabulary: () => {},
  updateVocabulary: () => {},
  deleteVocabulary: () => {},
  updateVocabularyStatus: () => {},
});

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useLocalStorage<Project[]>('linguaflash-projects', initialProjects);
  const { toast } = useToast();

  const getProjectById = (projectId: string) => projects.find(p => p.id === projectId);

  const getTopicById = (projectId: string, topicId: string) => {
    const project = getProjectById(projectId);
    return project?.topics.find(t => t.id === topicId);
  }

  const addProject = (projectData: Omit<Project, 'id' | 'topics'>) => {
    const newProject: Project = { ...projectData, id: uuidv4(), topics: [] };
    setProjects(prev => [...prev, newProject]);
    toast({ title: "Project Created", description: `"${newProject.name}" has been successfully created.` });
  };

  const updateProject = (projectId: string, projectData: Partial<Project>) => {
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, ...projectData } : p));
    toast({ title: "Project Updated" });
  };

  const deleteProject = (projectId: string) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
    toast({ title: "Project Deleted", variant: "destructive" });
  };

  const addTopic = (projectId: string, topicData: Omit<Topic, 'id' | 'projectId' | 'vocabulary'>) => {
    const newTopic: Topic = { ...topicData, id: uuidv4(), projectId, vocabulary: [] };
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return { ...p, topics: [...p.topics, newTopic] };
      }
      return p;
    }));
    toast({ title: "Topic Created", description: `"${newTopic.title}" has been added.` });
  };

  const updateTopic = (projectId: string, topicId: string, topicData: Partial<Topic>) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          topics: p.topics.map(t => t.id === topicId ? { ...t, ...topicData } : t)
        };
      }
      return p;
    }));
    toast({ title: "Topic Updated" });
  };

  const deleteTopic = (projectId: string, topicId: string) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return { ...p, topics: p.topics.filter(t => t.id !== topicId) };
      }
      return p;
    }));
     toast({ title: "Topic Deleted", variant: "destructive" });
  };

  const addVocabulary = (projectId: string, topicId: string, vocabularyItems: Omit<Vocabulary, 'id' | 'topicId' | 'status'>[]) => {
    const newVocab: Vocabulary[] = vocabularyItems.map(v => ({
      ...v,
      id: uuidv4(),
      topicId,
      status: 'unseen'
    }));
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          topics: p.topics.map(t => {
            if (t.id === topicId) {
              return { ...t, vocabulary: [...t.vocabulary, ...newVocab] };
            }
            return t;
          })
        };
      }
      return p;
    }));
    toast({ title: "Vocabulary Saved", description: `${newVocab.length} new word(s) added.` });
  };

  const updateVocabulary = (projectId: string, topicId: string, vocabId: string, vocabData: Partial<Vocabulary>) => {
     setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          topics: p.topics.map(t => {
            if (t.id === topicId) {
              return { ...t, vocabulary: t.vocabulary.map(v => v.id === vocabId ? { ...v, ...vocabData } : v) };
            }
            return t;
          })
        };
      }
      return p;
    }));
    toast({ title: "Vocabulary Updated" });
  };

  const deleteVocabulary = (projectId: string, topicId: string, vocabId: string) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          topics: p.topics.map(t => {
            if (t.id === topicId) {
              return { ...t, vocabulary: t.vocabulary.filter(v => v.id !== vocabId) };
            }
            return t;
          })
        };
      }
      return p;
    }));
    toast({ title: "Vocabulary Deleted", variant: "destructive" });
  };
  
  const updateVocabularyStatus = (projectId: string, topicId: string, vocabId: string, status: Vocabulary['status']) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          topics: p.topics.map(t => {
            if (t.id === topicId) {
              return { ...t, vocabulary: t.vocabulary.map(v => v.id === vocabId ? { ...v, status } : v) };
            }
            return t;
          })
        };
      }
      return p;
    }));
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
