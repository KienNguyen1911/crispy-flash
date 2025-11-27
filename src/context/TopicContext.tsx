"use client";

import React, { createContext, ReactNode, useContext } from "react";
import type { Topic } from "@/lib/types";
import { ProjectContext } from "@/context/ProjectContext";
import { useToast } from "@/hooks/use-toast";
import { getTopicById as getTopicByIdApi, createTopic, updateTopic, deleteTopic as deleteTopicApi, moveTopic as moveTopicApi } from "@/services/topics-api";
import { useAuth } from "./AuthContext";
import { useSWRConfig } from "swr";
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
  moveTopic: (topicId: string, targetProjectId: string) => Promise<void>;
}

export const TopicContext = createContext<TopicContextType>({
  getTopicById: async () => undefined,
  addTopic: async () => {},
  updateTopic: async () => {},
  deleteTopic: async () => {},
  moveTopic: async () => {}
});

export function TopicProvider({ children }: { children: ReactNode }) {
  const { projects, reloadProjects, getProjectById } =
    useContext(ProjectContext);
  const { setProjectTopics } = useContext(ProjectContext);
  const { toast } = useToast();
  const { user } = useAuth();
  const { mutate } = useSWRConfig();

  const getTopicById = async (projectId: string, topicId: string): Promise<Topic | undefined> => {
    try {
      const topic = await getTopicByIdApi(topicId);
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
      const created = await createTopic({ ...topicData, projectId });

      // Invalidate the project cache to refresh topics
      await mutate(`/api/projects/${projectId}/topics`);

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
      await updateTopic(topicId, topicData);

      // Invalidate the project cache to refresh topics
      await mutate(`/api/projects/${projectId}/topics`);

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
      await deleteTopicApi(topicId);

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

  const moveTopic = async (topicId: string, targetProjectId: string) => {
    try {
      await moveTopicApi(topicId, targetProjectId);

      // Invalidate both old and new project caches
      await mutate(`/api/projects/${targetProjectId}/topics`);
      await reloadProjects();

      toast({ title: "Topic Moved", duration: TOAST_DURATION });
    } catch (err) {
      console.error(err);
      toast({
        title: "Move failed",
        description: "Could not move topic",
        variant: "destructive",
        duration: TOAST_DURATION
      });
    }
  };

  return (
    <TopicContext.Provider
      value={{ getTopicById, addTopic, updateTopic, deleteTopic, moveTopic }}
    >
      {children}
    </TopicContext.Provider>
  );
}