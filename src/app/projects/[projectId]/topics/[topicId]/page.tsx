"use client";

import { useState, useCallback } from "react";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { useSWRConfig } from "swr";
import dynamic from "next/dynamic";
import { useAuthFetcher } from "@/hooks/useAuthFetcher";
import { useContentGeneration } from "@/hooks/useContentGeneration";
import { columns } from "./columns";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import type { AIGeneratedContent } from "@/lib/types";

import GenerateStoryDialog from "@/components/GenerateStoryDialog";
import ShareTopicDialog from "@/components/ShareTopicDialog";
import { TopicHeader } from "@/components/topics/TopicHeader";
import { TopicActions } from "@/components/topics/TopicActions";
import { StoryDrawer } from "@/components/topics/StoryDrawer";
import { LearnModeModal } from "@/components/topics/LearnModeModal";

const DataTable = dynamic(
  () =>
    import("@/components/DataTable").then((mod) => ({
      default: mod.DataTable,
    })),
  {
    loading: () => (
      <div className="w-full">
        <Skeleton className="h-10 w-1/3 mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    ),
  },
);

export default function TopicDetailPage() {
  const params = useParams<{ projectId: string; topicId: string }>();
  const { projectId, topicId } = params;
  
  const [isLearnMode, setIsLearnMode] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<AIGeneratedContent | null>(null);

  const fetcher = useAuthFetcher();
  const { mutate } = useSWRConfig();

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
  } = useSWR(projectId && topicId ? `/api/topics/${topicId}` : null, fetcher);

  const isLoading = isProjectLoading || isTopicLoading;
  const hasVocabulary = topic?.vocabulary && topic.vocabulary.length > 0;

  const mutateProjectTopics = useCallback(async () => {
    await mutate(
      (key) =>
        typeof key === "string" &&
        key.startsWith(`/api/projects/${projectId}/topics?page=`),
    );
  }, [mutate, projectId]);

  const { handleGenerateWithSettings } = useContentGeneration({
    topicId,
    projectOwnerId: project?.ownerId,
    hasVocabulary,
    onContentGenerated: (content) => {
      setGeneratedContent(content);
      setIsDrawerOpen(true);
      mutateTopic();
    },
    onGeneratingChange: setIsGenerating,
  });

  const handleGenerateContent = useCallback(() => {
    if (!hasVocabulary) {
      return;
    }

    if (
      topic?.contentGenerationStatus === "COMPLETED" &&
      topic.contextualPracticeContent
    ) {
      setGeneratedContent(topic.contextualPracticeContent as AIGeneratedContent);
      setIsDrawerOpen(true);
      return;
    }

    if (topic?.contentGenerationStatus === "GENERATING") {
      return;
    }

    setIsDialogOpen(true);
  }, [hasVocabulary, topic?.contentGenerationStatus, topic?.contextualPracticeContent]);

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

  return (
    <>
      <div className="container mx-auto max-w-5xl py-8 px-4">
        <TopicHeader
          projectId={projectId}
          projectTitle={project.title}
          topic={topic}
        />

        <TopicActions
          hasVocabulary={hasVocabulary}
          isGenerating={isGenerating}
          contentGenerationStatus={topic.contentGenerationStatus}
          onLearn={() => setIsLearnMode(true)}
          onShare={() => setIsShareDialogOpen(true)}
          onGenerateContent={handleGenerateContent}
        />

        <DataTable
          columns={columns}
          data={topic.vocabulary || []}
          projectId={projectId}
          topicId={topicId}
        />
      </div>

      <LearnModeModal
        isOpen={isLearnMode}
        topicId={topicId}
        projectId={projectId}
        vocabulary={topic.vocabulary || []}
        onClose={() => setIsLearnMode(false)}
        mutateTopic={mutateTopic}
        mutateProjectTopics={mutateProjectTopics}
      />

      <StoryDrawer
        isOpen={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        generatedContent={generatedContent}
        vocabulary={topic.vocabulary || []}
      />

      <GenerateStoryDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onGenerate={handleGenerateWithSettings}
        isGenerating={isGenerating}
      />

      <ShareTopicDialog
        topicId={topicId}
        topicTitle={topic.title}
        isOpen={isShareDialogOpen}
        onOpenChange={setIsShareDialogOpen}
      />
    </>
  );
}
