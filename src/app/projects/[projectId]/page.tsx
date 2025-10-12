"use client";

import { notFound } from "next/navigation";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useAuthFetcher } from "@/hooks/useAuthFetcher";
import useSWR from "swr";
import DataLoader from "@/components/ui/DataLoader";
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
import { Card } from "@/components/ui/card";
import { invalidateCache } from "@/lib/cache";

export default function ProjectPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const { isAuthenticated } = useAuth();
  const fetcher = useAuthFetcher();

  const { data: projectRaw, error: projectError } = useSWR(
    isAuthenticated && projectId ? `/api/projects/${projectId}` : null,
    fetcher
  );

  // Handle 404 errors
  if (projectError?.status === 404) {
    notFound();
  }

  const {
    data: topicsRaw,
    error: topicsError,
    mutate: mutateTopics
  } = useSWR(
    isAuthenticated && projectId ? `/api/projects/${projectId}/topics` : null,
    fetcher
  );

  const project = projectRaw
    ? {
        id: projectRaw.id,
        name: projectRaw.title ?? "",
        description: projectRaw.description ?? ""
      }
    : null;

  const topics = topicsRaw
    ? topicsRaw.map((t: any) => ({
        id: t.id,
        title: t.title,
        description: "",
        vocabularyCount: t.wordsCount ?? 0
      }))
    : [];

  // isLoading is true if either the project or topics are not yet loaded.
  const isLoading = !projectRaw || !topicsRaw;
  const error = projectError || topicsError;

  const refetchTopics = () => {
    // invalidate the topics cache to refresh topics
    // This will trigger a refetch of the topics data
    invalidateCache(`projects:topics:${projectId}`);
    mutateTopics();
  };

  if (isLoading) {
    return <DataLoader />;
  }

  if (error) {
    // You might want to show a more user-friendly error message here
    if (error.status === 404) return notFound();
    return <div>Failed to load project data.</div>;
  }

  if (!project) {
    // This can happen briefly while loading or if there's an error
    return <DataLoader />;
  }

  return (
    <div className="container mx-auto max-w-5xl py-8 px-4">
      <Card className="mb-8 p-6">
        <Breadcrumb className="mb-4">
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

        <ProjectHeaderEditor project={project} />
      </Card>

      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-semibold font-headline">Topics</h2>
        <div className="flex gap-2">
          {/* TopicCreate is a client component that uses AppDataContext to add topics */}
          <TopicCreate projectId={projectId} onTopicCreated={refetchTopics} />
        </div>
      </div>

      {topics.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topics.map((topic: any) => (
            <div key={topic.id}>
              <TopicCardClient
                projectId={projectId}
                topic={topic}
                onTopicUpdated={refetchTopics}
                onTopicDeleted={refetchTopics}
              />
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
