"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { useAuthFetcher } from "@/hooks/useAuthFetcher";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpenCheck, Plus } from "lucide-react";
import { DataTable } from "@/components/data-table";
import { columns } from "./columns";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import LearnMode from "@/components/LearnMode";
import TopicHeaderEditor from "@/components/topics/TopicHeaderEditor";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

export default function TopicDetailPage() {
  const params = useParams<{ projectId: string; topicId:string}>();
  const [isLearnMode, setIsLearnMode] = useState(false);
  const fetcher = useAuthFetcher();
  const { projectId, topicId } = params;

  const {
    data: project,
    error: projectError,
    isLoading: isProjectLoading,
  } = useSWR(projectId ? `/api/projects/${projectId}` : null, fetcher);

  const {
    data: topic,
    error: topicError,
    isLoading: isTopicLoading,
    mutate: mutateTopic,
  } = useSWR(
    projectId && topicId
      ? `/api/topics/${topicId}`
      : null,
    fetcher
  );

  const isLoading = isProjectLoading || isTopicLoading;

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-5xl p-8 space-y-4">
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-4 w-1/2" />
        <Separator />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (projectError || topicError) {
    return <div>Error loading data.</div>;
  }

  if (!project || !topic) {
    return <div>No data found.</div>;
  }

  const hasVocabulary = topic.vocabulary && topic.vocabulary.length > 0;

  return (
    <>
      <div className="container mx-auto max-w-5xl py-8 px-4">
        <Card className="mb-8 p-6">
          <Breadcrumb className="mb-4">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href={`/projects/${project.id}`}>{project.title}</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{topic.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <TopicHeaderEditor projectId={projectId} topic={topic} />
        </Card>
        <DataTable
          columns={columns}
          data={topic.vocabulary || []}
          projectId={projectId}
          topicId={topicId}
          hasVocabulary={hasVocabulary}
          setIsLearnMode={setIsLearnMode}
        />
      </div>

      {isLearnMode && (
        <LearnMode
          topicId={topicId}
          projectId={projectId}
          initialVocab={topic.vocabulary || []}
          onClose={() => setIsLearnMode(false)}
          // mutateTopic
          mutateTopic={mutateTopic}
        />
      )}
    </>
  );
}