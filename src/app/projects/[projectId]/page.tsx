"use client";

import { notFound } from "next/navigation";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useAuthFetcher } from "@/hooks/useAuthFetcher";
import useSWR from "swr";
import useSWRInfinite from "swr/infinite";
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
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Project } from "@/lib/types";
import MoveTopicDialog from "@/components/projects/MoveTopicDialog";
import {
  NeoHeader,
  NeoPage,
  NeoPanel,
  NeoSectionTitle,
} from "@/components/ui/neo";

export default function ProjectPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const { isAuthenticated } = useAuth();
  const fetcher = useAuthFetcher();
  const [movingTopic, setMovingTopic] = useState<{ id: string; title: string } | null>(null);

  const { data: projectRaw, error: projectError } = useSWR(
    isAuthenticated && projectId ? `/api/projects/${projectId}` : null,
    fetcher
  );

  // Fetch all projects for the move dialog
  const { data: projectsData } = useSWR(
    isAuthenticated ? `/api/projects` : null,
    fetcher
  );

  const projects: Project[] = projectsData ?? [];

  // Handle 404 errors
  if (projectError?.status === 404) {
    notFound();
  }

  const PAGE_SIZE = 15;

  const getKey = (pageIndex: number, previousPageData: any) => {
    if (!isAuthenticated || !projectId) return null;
    if (previousPageData && !previousPageData.hasMore) return null; // reached the end
    const page = pageIndex + 1;
    return `/api/projects/${projectId}/topics?page=${page}&limit=${PAGE_SIZE}`;
  };

  const {
    data: topicPages,
    error: topicsError,
    setSize,
    isValidating,
    mutate: mutateTopicPages
  } = useSWRInfinite(getKey, fetcher);

  const project = projectRaw
    ? {
        id: projectRaw.id,
        name: projectRaw.title ?? "",
        description: projectRaw.description ?? ""
      }
    : null;

  const topics = topicPages
    ? topicPages
        .flatMap((page: any) => page.topics ?? [])
        .map((t: any) => ({
          id: t.id,
          title: t.title,
          description: "",
          vocabularyCount: t.wordsCount ?? 0,
          learnedCount: t.learnedCount ?? 0,
          createdAt: t.createdAt ?? new Date().toISOString()
        }))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    : [];

  // Group topics by date
  const groupedTopics = topics.reduce((groups: Record<string, any[]>, topic) => {
    const date = new Date(topic.createdAt);
    const formattedDate = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    if (!groups[formattedDate]) {
      groups[formattedDate] = [];
    }
    groups[formattedDate].push(topic);
    return groups;
  }, {});

  const lastPage = topicPages && topicPages.length > 0 ? topicPages[topicPages.length - 1] : null;
  const hasMore = lastPage ? Boolean(lastPage.hasMore) : false;

  // isLoading is true if either the project or first topics page are not yet loaded.
  const isLoading = !projectRaw || !topicPages;
  const error = projectError || topicsError;

  const refetchTopics = () => {
    // revalidate all pages
    mutateTopicPages();
  };

  // Infinite scroll sentinel
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!hasMore) return;
    const elem = loadMoreRef.current;
    if (!elem) return;

    let blocked = false;
    const observer = new IntersectionObserver((entries) => {
      const first = entries[0];
      if (first.isIntersecting && !blocked && !isValidating) {
        blocked = true;
        setSize((prev) => prev + 1).finally(() => {
          blocked = false;
        });
      }
    }, { root: null, rootMargin: "200px", threshold: 0.1 });

    observer.observe(elem);
    return () => observer.disconnect();
  }, [hasMore, isValidating, setSize]);

  const isLoadingMore = Boolean(topicPages && topicPages.length > 0 && isValidating);

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
    <NeoPage className="max-w-6xl">
      <NeoHeader
        eyebrow={
          <Breadcrumb>
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
        }
        title={<ProjectHeaderEditor project={project} />}
        className="mb-8"
      />

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <NeoSectionTitle
          title="Topics"
          description="Group related vocabulary, then switch between table, graph, and learn mode."
        />
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="neoSecondary">
            <Link href={`/projects/${projectId}/analytics`}>Analytics</Link>
          </Button>
          <TopicCreate projectId={projectId} onTopicCreated={refetchTopics} />
        </div>
      </div>

      {Object.keys(groupedTopics).length > 0 ? (
        <div className="space-y-8">
          {Object.entries(groupedTopics).map(([date, dateTopics]) => (
            <div key={date} className="space-y-4">
              <h3 className="text-lg font-black text-muted-foreground">{date}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dateTopics.map((topic: any) => (
                  <div key={topic.id} className="transition-opacity duration-300">
                    <TopicCardClient
                      projectId={projectId}
                      topic={topic}
                      onTopicUpdated={refetchTopics}
                      onTopicDeleted={refetchTopics}
                      onMoveClick={(topicId, topicTitle) =>
                        setMovingTopic({ id: topicId, title: topicTitle })
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <NeoPanel subtle className="py-20 text-center">
          <h2 className="text-2xl font-black text-white">No Topics Yet</h2>
          <p className="mt-2 text-base font-medium text-muted-foreground">
            Create a topic to start adding vocabulary.
          </p>
        </NeoPanel>
      )}

      {/* Infinite scroll sentinel and loading indicator */}
      {hasMore && (
        <div className="mt-8">
          <div ref={loadMoreRef} className="h-10 w-full" />
          {isLoadingMore && (
            <div className="flex items-center justify-center gap-2 text-sm md:text-base text-muted-foreground" aria-live="polite">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
              Loading more...
            </div>
          )}
        </div>
      )}

      {/* Move Topic Dialog */}
      {movingTopic && (
        <MoveTopicDialog
          topicId={movingTopic.id}
          topicTitle={movingTopic.title}
          currentProjectId={projectId}
          projects={projects}
          onTopicMoved={() => {
            setMovingTopic(null);
            refetchTopics();
          }}
          onOpenChange={(open) => {
            if (!open) {
              setMovingTopic(null);
            }
          }}
        />
      )}
    </NeoPage>
  );
}
