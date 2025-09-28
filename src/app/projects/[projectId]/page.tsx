"use client";

import { notFound } from "next/navigation";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { apiUrl } from "@/lib/api";
import useSWR from 'swr';
import TopicCreate from "@/components/projects/TopicCreate";
import ProjectHeaderEditor from "@/components/projects/ProjectHeaderEditor";
import TopicCardClient from "@/components/projects/TopicCardClient";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { BrainCircuit } from "lucide-react";

export default function ProjectPage() {
  const params = useParams();
  const projectId = params.projectId as string;

  const { data: projectRaw, error: projectError } = useSWR(
    projectId ? apiUrl(`/projects/${projectId}`) : null,
    {
      onError: (err) => {
        if (err.status === 404) notFound();
      }
    }
  );

  const { data: topicsRaw, error: topicsError, mutate: mutateTopics } = useSWR(
    projectId ? apiUrl(`/projects/${projectId}/topics`) : null
  );

  const project = projectRaw ? {
    id: projectRaw.id,
    name: projectRaw.title ?? "",
    description: projectRaw.description ?? ""
  } : null;

  const topics = topicsRaw ? topicsRaw.map((t: any) => ({
    id: t.id,
    title: t.title,
    description: "",
    vocabularyCount: t.wordsCount ?? 0
  })) : [];

  const loading = !project || !topicsRaw;
  const error = projectError || topicsError;

  const refetchTopics = () => {
    mutateTopics();
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!project) {
    return notFound();
  }

  const totalWords = topics.reduce(
    (acc: number, t: any) => acc + (t.vocabularyCount ?? 0),
    0
  );

  return (
    <div className="container mx-auto max-w-5xl py-8 px-4">
      <Breadcrumb className="mb-8">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Projects</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{project.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mb-8">
        <ProjectHeaderEditor project={project} />
      </div>

      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-semibold font-headline">Topics</h2>
        <div className="flex gap-2">
          <Button variant="outline" disabled={totalWords === 0}>
            <BrainCircuit className="mr-2 h-4 w-4" />
            Learn All
          </Button>
          {/* TopicCreate is a client component that uses AppDataContext to add topics */}
          <TopicCreate projectId={projectId} onTopicCreated={refetchTopics} />
        </div>
      </div>

      {topics.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topics.map((topic: any) => (
            <div key={topic.id}>
              <TopicCardClient projectId={projectId} topic={topic} onTopicUpdated={refetchTopics} onTopicDeleted={refetchTopics} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border-2 border-dashed rounded-lg">
          <h2 className="text-xl font-semibold">No Topics Yet</h2>
          <p className="text-muted-foreground mt-2">
            Create a topic to start adding vocabulary.
          </p>
        </div>
      )}
    </div>
  );
}
