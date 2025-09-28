"use client";

import { notFound } from "next/navigation";
import { useParams } from "next/navigation";
import { apiUrl } from "@/lib/api";
import TopicViewer from '@/components/topics/TopicViewer';
import useSWR from 'swr';

export default function TopicPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const topicId = params.topicId as string;

  const { data: projectRaw, error: projectError } = useSWR(
    projectId ? apiUrl(`/projects/${projectId}`) : null,
    {
      onError: (err) => {
        if (err.status === 404) notFound();
      }
    }
  );

  const { data: topic, error: topicError } = useSWR(
    projectId && topicId ? apiUrl(`/projects/${projectId}/topics/${topicId}`) : null,
    {
      onError: (err) => {
        if (err.status === 404) notFound();
      }
    }
  );

  const project = projectRaw ? {
    id: projectRaw.id,
    name: projectRaw.title ?? "",
    description: projectRaw.description ?? ""
  } : null;

  const loading = !project || !topic;
  const error = projectError || topicError;

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!project || !topic) {
    return notFound();
  }

  return (
    <TopicViewer projectId={projectId} topic={topic} projectName={project.name} />
  );
}

