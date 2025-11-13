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
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { useEffect, useRef } from "react";

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
    size,
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
          <Link href={`/projects/${projectId}/analytics`}>
            <Button variant="outline">Analytics</Button>
          </Link>
          <TopicCreate projectId={projectId} onTopicCreated={refetchTopics} />
        </div>
      </div>

      {Object.keys(groupedTopics).length > 0 ? (
        <div className="space-y-8">
          {Object.entries(groupedTopics).map(([date, dateTopics]) => (
            <div key={date} className="space-y-4">
              <h3 className="text-lg font-medium text-muted-foreground">{date}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dateTopics.map((topic: any) => (
                  <div key={topic.id} className="transition-opacity duration-300">
                    <TopicCardClient
                      projectId={projectId}
                      topic={topic}
                      onTopicUpdated={refetchTopics}
                      onTopicDeleted={refetchTopics}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          className="
            text-center py-20 
            rounded-lg 
            bg-black/40 
            backdrop-blur-md 
            border
            shadow-lg
          "
        >
          <h2 className="text-xl font-semibold">No Topics Yet</h2>
          <p className="text-muted-foreground mt-2">
            Create a topic to start adding vocabulary.
          </p>
        </div>
      )}

      {/* Infinite scroll sentinel and loading indicator */}
      {hasMore && (
        <div className="mt-8">
          <div ref={loadMoreRef} className="h-10 w-full" />
          {isLoadingMore && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground" aria-live="polite">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
              Loading more...
            </div>
          )}
        </div>
      )}
    </div>
  );
}