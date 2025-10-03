"use client";

import { notFound } from "next/navigation";
import { useParams } from "next/navigation";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import TopicViewer from '@/components/topics/TopicViewer';
import useSWR from 'swr';
import DataLoader from '@/components/ui/DataLoader';

export default function TopicPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const topicId = params.topicId as string;
  const { isAuthenticated } = useAuth();

  const { data: projectRaw, error: projectError } = useSWR(
    projectId && isAuthenticated ? `/projects/${projectId}` : null
  );

  const { data: topic, error: topicError } = useSWR(
    projectId && topicId && isAuthenticated ? `/projects/${projectId}/topics/${topicId}` : null
  );

  // Handle 404 errors
  if (projectError?.status === 404 || topicError?.status === 404) {
    notFound();
  }

  const project = projectRaw ? {
    id: projectRaw.id,
    name: projectRaw.title ?? "",
    description: projectRaw.description ?? ""
  } : null;

  const loading = !project || !topic;
  const error = projectError || topicError;

  if (loading) {
    return <DataLoader />;
  }

  if (!project || !topic) {
    return notFound();
  }

  return (
    <TopicViewer projectId={projectId} topic={topic} projectName={project.name} />
  );
}