"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import useSWR from "swr";
import dynamic from "next/dynamic";
import { useAuthFetcher } from "@/hooks/useAuthFetcher";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { columns } from "./columns";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { generateContent } from "@/services/topics-api";
import type { AIGeneratedContent } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

import GenerateStoryDialog from "@/components/GenerateStoryDialog";
import StoryDisplay from "@/components/StoryDisplay";
import { AnimatePresence, motion } from "motion/react";

// Dynamic imports to split heavy client bundles
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

const LearnMode = dynamic(() => import("@/components/LearnMode"), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin" />
    </div>
  ),
});

const TopicHeaderEditor = dynamic(
  () => import("@/components/topics/TopicHeaderEditor"),
  {
    ssr: false,
    loading: () => <div className="h-10" />,
  },
);

export default function TopicDetailPage() {
  const params = useParams<{ projectId: string; topicId: string }>();
  const [isLearnMode, setIsLearnMode] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [generatedContent, setGeneratedContent] =
    useState<AIGeneratedContent | null>(null);
  const fetcher = useAuthFetcher();
  const { toast } = useToast();
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
  } = useSWR(projectId && topicId ? `/api/topics/${topicId}` : null, fetcher);

  const isLoading = isProjectLoading || isTopicLoading;
  const hasVocabulary = topic?.vocabulary && topic.vocabulary.length > 0;

  const handleGenerateContent = useCallback(() => {
    if (!hasVocabulary) {
      toast({
        title: "No vocabulary",
        description: "Please add vocabulary words before generating content.",
        variant: "destructive",
      });
      return;
    }

    // If content already exists, just show it
    if (
      topic?.contentGenerationStatus === "COMPLETED" &&
      topic.contextualPracticeContent
    ) {
      setGeneratedContent(
        topic.contextualPracticeContent as AIGeneratedContent,
      );
      setIsDrawerOpen(true);
      return;
    }

    // If already generating, don't trigger again
    if (topic?.contentGenerationStatus === "GENERATING") {
      toast({
        title: "Already generating",
        description: "Content is being generated. Please wait...",
      });
      return;
    }

    // Open dialog to get settings
    setIsDialogOpen(true);
  }, [
    hasVocabulary,
    topic?.contentGenerationStatus,
    topic?.contextualPracticeContent,
    toast,
  ]);

  const handleGenerateWithSettings = useCallback(
    async (
      language: "english" | "vietnamese",
      difficulty: "easy" | "medium" | "hard",
    ) => {
      setIsDialogOpen(false);
      setIsGenerating(true);

      try {
        const response = await generateContent(topicId, language, difficulty);

        if (!response.ok) {
          throw new Error("Failed to trigger content generation");
        }

        toast({
          title: "Generating content...",
          description: "Please wait while we create your story.",
        });
      } catch (error) {
        console.error("Content generation error:", error);
        setIsGenerating(false);
        toast({
          title: "Generation failed",
          description:
            error instanceof Error
              ? error.message
              : "Failed to trigger content generation. Please try again.",
          variant: "destructive",
        });
      }
    },
    [topicId, toast],
  );

  // Poll topic data when generating (from local state or DB status)
  useEffect(() => {
    const shouldPoll =
      (isGenerating || topic?.contentGenerationStatus === "GENERATING") &&
      topic;

    if (shouldPoll) {
      const pollInterval = setInterval(async () => {
        await mutateTopic();
      }, 10000); // Poll every 5 seconds

      return () => clearInterval(pollInterval);
    }
  }, [isGenerating, topic?.contentGenerationStatus, mutateTopic, topic]);

  // Sync local state with DB status on mount/update
  useEffect(() => {
    if (topic?.contentGenerationStatus === "GENERATING" && !isGenerating) {
      setIsGenerating(true);
    }
  }, [topic?.contentGenerationStatus, isGenerating]);

  // Check for content generation completion
  useEffect(() => {
    if (topic?.contentGenerationStatus === "COMPLETED" && isGenerating) {
      setIsGenerating(false);

      if (topic.contextualPracticeContent) {
        setGeneratedContent(
          topic.contextualPracticeContent as AIGeneratedContent,
        );
        setIsDrawerOpen(true);
        toast({
          title: "Content generated!",
          description: "Your short story has been created successfully.",
        });
      }
    } else if (topic?.contentGenerationStatus === "FAILED" && isGenerating) {
      setIsGenerating(false);
      toast({
        title: "Generation failed",
        description: "Failed to generate content. Please try again.",
        variant: "destructive",
      });
    }
  }, [
    topic?.contentGenerationStatus,
    topic?.contextualPracticeContent,
    isGenerating,
    toast,
  ]);

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
        <Card className="mb-8 p-6">
          <Breadcrumb className="mb-4">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href={`/projects/${project.id}`}>
                  {project.title}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{topic.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <TopicHeaderEditor projectId={projectId} topic={topic} />

          <div className="mt-4 flex justify-end">
            <Button
              onClick={handleGenerateContent}
              disabled={
                !hasVocabulary ||
                topic.contentGenerationStatus === "GENERATING" ||
                isGenerating
              }
              className="gap-2"
              variant={
                topic.contentGenerationStatus === "COMPLETED"
                  ? "outline"
                  : "default"
              }
            >
              {isGenerating ||
              topic.contentGenerationStatus === "GENERATING" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : topic.contentGenerationStatus === "COMPLETED" ? (
                <>
                  <Sparkles className="h-4 w-4" />
                  View Story
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate Story
                </>
              )}
            </Button>
          </div>
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

      <AnimatePresence mode="wait">
        {isLearnMode && (
          <motion.div
            initial={{ opacity: 1, y: "100%" }}
            animate={{ opacity: 1, y: "0%" }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{
              duration: 0.3,
              ease: [0.4, 0, 0.2, 1],
            }}
          >
            <LearnMode
              topicId={topicId}
              projectId={projectId}
              initialVocab={topic.vocabulary || []}
              onClose={() => setIsLearnMode(false)}
              mutateTopic={mutateTopic}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent className="w-full sm:max-w-3xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Generated Stories
            </SheetTitle>
            <SheetDescription>
              Multiple short stories using your vocabulary words
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6">
            {generatedContent ? (
              <>
                <StoryDisplay
                  stories={generatedContent.stories}
                  vocabularyList={topic.vocabulary || []}
                />
              </>
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                <p>No content generated yet</p>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <GenerateStoryDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onGenerate={handleGenerateWithSettings}
        isGenerating={isGenerating}
      />
    </>
  );
}
