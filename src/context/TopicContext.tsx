"use client";

import React, { createContext, ReactNode, useContext } from "react";
import type { Topic } from "@/lib/types";
import { ProjectContext } from "@/context/ProjectContext";
import { useToast } from "@/hooks/use-toast";
import { apiUrl, apiClient } from "@/lib/api";
import { useAuth } from "./AuthContext";
import { useSWRConfig } from "swr";
import { invalidateCache } from "@/lib/cache";
import { TOAST_DURATION } from '@/lib/constants';

interface TopicContextType {
  getTopicById: (projectId: string, topicId: string) => Promise<Topic | undefined>;
  addTopic: (
    projectId: string,
    topicData: Omit<Topic, "id" | "projectId" | "vocabulary">
  ) => Promise<void>;
  updateTopic: (
    projectId: string,
    topicId: string,
    topicData: Partial<Topic>
  ) => Promise<void>;
  deleteTopic: (projectId: string, topicId: string) => Promise<void>;
}

export const TopicContext = createContext<TopicContextType>({
  getTopicById: async () => undefined,
  addTopic: async () => {},
  updateTopic: async () => {},
  deleteTopic: async () => {}
});

export function TopicProvider({ children }: { children: ReactNode }) {
  const { projects, reloadProjects, getProjectById } =
    useContext(ProjectContext);
  const { setProjectTopics } = useContext(ProjectContext);
  const { toast } = useToast();
  const { user } = useAuth();
  const { mutate } = useSWRConfig();

  const getTopicById = async (projectId: string, topicId: string) => {
    try {
      const topic = await apiClient(`/topics/${topicId}`, {});
      return topic;
    } catch (err) {
      console.error(err);
      toast({
        title: "Fetch failed",
        description: "Failed to fetch topic",
        variant: "destructive",
        duration: TOAST_DURATION
      });
      return undefined;
    }
  };

  const addTopic = async (
    projectId: string,
    topicData: Omit<Topic, "id" | "projectId" | "vocabulary">
  ) => {
    try {
      const created = await apiClient(`/api/topics`, {
        method: "POST",
        body: JSON.stringify({ ...topicData, projectId })
      });

      // Invalidate the project cache to refresh topics
      await mutate(`/api/projects/${projectId}/topics`);
      if (user) {
        await invalidateCache(
          `topics:${projectId}`,
          `projects:list:${user.id}`,
          `project:${projectId}`
        );
      }

      toast({
        title: "Topic Created",
        description: `${created.title}`,
        duration: TOAST_DURATION
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Create failed",
        description: "Failed to create topic",
        variant: "destructive",
        duration: TOAST_DURATION
      });
    }
  };

  const updateTopic = async (
    projectId: string,
    topicId: string,
    topicData: Partial<Topic>
  ) => {
    try {
      await apiClient(`/api/topics/${topicId}`, {
        method: "PATCH",
        body: JSON.stringify(topicData)
      });

      // Invalidate the project cache to refresh topics
      await mutate(`/api/projects/${projectId}/topics`);
      if (user) {
        await invalidateCache(
          `vocabulary:list:${topicId}`,
          `topics:${projectId}`,
          `projects:list:${user.id}`,
          `project:${projectId}`
        );
      }

      toast({ title: "Topic Updated", duration: TOAST_DURATION });
    } catch (err) {
      console.error(err);
      toast({
        title: "Update failed",
        description: "Failed to update topic",
        variant: "destructive",
        duration: TOAST_DURATION
      });
    }
  };

  const deleteTopic = async (projectId: string, topicId: string) => {
    try {
      await apiClient(`/api/topics/${topicId}`, {
        method: "DELETE"
      });

      // Invalidate the project cache to refresh topics
      await mutate(`/api/projects/${projectId}/topics`);

      toast({ title: "Topic Deleted", variant: "destructive", duration: TOAST_DURATION });
    } catch (err) {
      console.error(err);
      toast({
        title: "Delete failed",
        description: "Could not delete topic",
        variant: "destructive",
        duration: TOAST_DURATION
      });
    }
  };

  return (
    <TopicContext.Provider
      value={{ getTopicById, addTopic, updateTopic, deleteTopic }}
    >
      {children}
    </TopicContext.Provider>
  );
}