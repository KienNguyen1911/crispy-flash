"use client";

import React, { createContext, ReactNode, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import type { Project } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { getProjects, createProject, updateProject, deleteProject } from "@/services/projects-api";
import { TOAST_DURATION } from '@/lib/constants';

interface ProjectContextType {
  projects: Project[];
  reloadProjects: () => Promise<void>;
  addProject: (
    projectData:
      | Omit<Project, "id" | "topics">
      | (Partial<Project> & { id: string })
  ) => Promise<boolean>;
  updateProject: (
    projectId: string,
    projectData: Partial<Project>
  ) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  getProjectById: (projectId: string) => Project | undefined;
  // Update topics for a single project (used after creating a topic)
  setProjectTopics: (projectId: string, topics: any[]) => void;
}

export const ProjectContext = createContext<ProjectContextType>({
  projects: [],
  reloadProjects: async () => {},
  addProject: async () => false,
  updateProject: async () => {},
  deleteProject: async () => {},
  getProjectById: () => undefined,
  setProjectTopics: () => {}
});

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  const reloadProjects = async () => {
    // Only load projects if user is authenticated
    if (!isAuthenticated) {
      setProjects([]);
      return;
    }

    try {
      // Token is now handled by apiClient automatically
      const data = await getProjects();

      // data is expected to be lightweight project items with counts
      const loadedProjects = data.map((p: any) => ({
        id: p.id,
        name: p.title ?? p.name ?? "",
        description: p.description ?? "",
        topics: [],
        topicsCount: p.topicsCount,
        wordsCount: p.wordsCount
      }));

      setProjects(loadedProjects);

      // Show toast if user has no projects
      if (loadedProjects.length === 0) {
        toast({
          title: "No project yet",
          description: "You don't have any project yet, let's start creating your first project!",
          duration: 5000,
        });
      }
    } catch (err: any) {
      console.error("Failed to load projects:", err);
      
      // Handle different error types
      if (err.message?.includes('Network error') || err.message?.includes('Failed to fetch')) {
        toast({
          title: "Network error",
          description: "Unable to connect to server. Please check your connection.",
          variant: "destructive"
        });
      } else if (err.message?.includes('Unauthorized') || err.message?.includes('401')) {
        toast({
          title: "Authentication error",
          description: "Your session has expired. Please log in again.",
          variant: "destructive"
        });
        // Optionally redirect to login
        // window.location.href = '/';
      } else {
        toast({
          title: "Load error",
          description: err.message || "Could not load projects from server.",
          variant: "destructive"
        });
      }
    }
  };

  const pathname = usePathname();

  // Only auto-load the projects list on the projects-list page.
  // This prevents the provider from fetching `/api/projects` on every route
  // (for example on project detail pages like `/projects/:projectId`).
  // The dashboard page (/) now handles its own data fetching with SWR.
  useEffect(() => {
    if (pathname === "/projects" && isAuthenticated) {
      reloadProjects();
    }
  }, [pathname, isAuthenticated]);

  const getProjectById = (projectId: string) =>
    projects.find((p) => p.id === projectId);

  const setProjectTopics = (projectId: string, topics: any[]) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, topics } : p))
    );
  };

  const addProject = async (
    projectData:
      | Omit<Project, "id" | "topics">
      | (Partial<Project> & { id: string })
  ) => {
    try {
      // if payload includes an id, treat as update
      if ((projectData as any).id) {
        const id = (projectData as any).id as string;
        await updateProject(id, projectData as any);
        return true;
      }
      const body = {
        title: (projectData as any).name,
        description: (projectData as any).description
      };
      const createdRaw = await createProject(body).catch((err: any) => {
        toast({
          title: "Create failed",
          description: err?.message || "Failed to create project",
          variant: "destructive"
        });
        return null;
      });
      
      if (!createdRaw) return false;
      const created: Project = {
        id: createdRaw.id,
        name: createdRaw.title ?? createdRaw.name ?? projectData.name,
        description: createdRaw.description ?? projectData.description ?? "",
        topics: []
      };
      setProjects((prev) => [...prev, created]);
      toast({ title: "Project Created", description: `${created.name}`, duration: TOAST_DURATION });
      return true;
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Create failed",
        description: err?.message || "Failed to create project",
        variant: "destructive"
      });
      return false;
    }
  };

  const updateProject = async (
    projectId: string,
    projectData: Partial<Project>
  ) => {
    const body = {
      title: projectData.name,
      description: projectData.description
    };
    const updatedRaw = await updateProject(projectId, body);
    const updated: Project = {
      id: updatedRaw.id,
      name: updatedRaw.title ?? updatedRaw.name ?? projectData.name ?? "",
      description: updatedRaw.description ?? projectData.description ?? "",
      topics: []
    };
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, ...updated } : p))
    );
    toast({ title: "Project Updated", duration: TOAST_DURATION });
  };

  const deleteProject = async (projectId: string) => {
    await deleteProject(projectId);
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
    toast({ title: "Project Deleted", variant: "destructive", duration: TOAST_DURATION });
  };

  const value = {
    projects,
    reloadProjects,
    addProject,
    updateProject,
    deleteProject,
    getProjectById,
    setProjectTopics
  };
  return (
    <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
  );
}