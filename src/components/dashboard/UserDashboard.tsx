"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2, Layers, BookA, Sparkles } from "lucide-react";
import ProjectCreate from "@/components/projects/ProjectCreate";
import DataLoader from "@/components/ui/DataLoader";
import useSWRInfinite from "swr/infinite";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useAuthFetcher } from "@/hooks/useAuthFetcher";
import { toast } from "sonner";
import { useEffect, useRef } from "react";
import {
  NeoHeader,
  NeoPage,
  NeoPanel,
  NeoSectionTitle,
} from "@/components/ui/neo";

export function UserDashboard() {
  const { isAuthenticated } = useAuth();
  const fetcher = useAuthFetcher();

  const PAGE_SIZE = 20;
  const getKey = (pageIndex: number, previousPageData: any) => {
    if (!isAuthenticated) return null;
    if (previousPageData && !previousPageData.hasMore) return null;
    const page = pageIndex + 1;
    return `/api/projects?page=${page}&limit=${PAGE_SIZE}`;
  };

  const {
    data: projectPages,
    setSize,
    isValidating,
    mutate: mutateProjectsPages,
  } = useSWRInfinite(getKey, fetcher);

  const projects = projectPages
    ? projectPages
        .flatMap((p: any) => p.projects ?? [])
        .map((proj: any) => ({
          id: proj.id,
          name: proj.title ?? proj.name ?? "",
          description: proj.description ?? "",
          topicsCount: proj.topicsCount ?? 0,
          wordsCount: proj.wordsCount ?? 0,
        }))
    : [];

  const lastPage =
    projectPages && projectPages.length > 0
      ? projectPages[projectPages.length - 1]
      : null;
  const hasMore = lastPage ? Boolean(lastPage.hasMore) : false;

  const isInitialLoading = !projectPages;
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!hasMore) return;
    const elem = loadMoreRef.current;
    if (!elem) return;

    let blocked = false;
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && !blocked && !isValidating) {
          blocked = true;
          setSize((prev) => prev + 1).finally(() => {
            blocked = false;
          });
        }
      },
      { root: null, rootMargin: "200px", threshold: 0.1 },
    );

    observer.observe(elem);
    return () => observer.disconnect();
  }, [hasMore, isValidating, setSize]);

  const addProject = async (projectData: any): Promise<boolean> => {
    try {
      const body = {
        title: projectData.name,
        description: projectData.description || "",
      };
      await apiClient("/api/projects", {
        method: "POST",
        body: JSON.stringify(body),
      });
      await mutateProjectsPages();
      toast.success("Project created successfully");
      return true;
    } catch (err) {
      console.error("Create project error:", err);
      return false;
    }
  };

  const deleteProject = async (projectId: string) => {
    try {
      await apiClient(`/api/projects/${projectId}`, {
        method: "DELETE",
      });
      await mutateProjectsPages();
      toast.success("Project deleted successfully");
    } catch (err) {
      console.error("Delete project error:", err);
      throw err;
    }
  };

  if (isInitialLoading) {
    return <DataLoader />;
  }

  return (
    <NeoPage className="max-w-6xl">
      <NeoHeader
        eyebrow={
          <span className="inline-flex items-center gap-2 text-cyan-300">
            <Sparkles className="h-4 w-4" />
            Learning workspace
          </span>
        }
        title="Master Vocabulary!"
        description="Flashcards only unlock maximum recall power when they are organized. Start systematizing your vocabulary today."
        className="mb-8"
      />

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <NeoSectionTitle
          title="All Projects"
          description="Pick a workspace or create a new one for your next vocabulary set."
        />
        <ProjectCreate
          onSubmit={addProject}
          onProjectCreated={() => mutateProjectsPages()}
        />
      </div>

      {projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project: any) => (
            <div key={project.id}>
              <NeoPanel
                className="group relative flex min-h-[168px] flex-col p-6 transition-all duration-200 hover:-translate-x-1 hover:-translate-y-1 hover:bg-[var(--neo-surface-raised)] hover:shadow-[7px_7px_0_#000]"
              >
                <div className="pr-8">
                  <h3 className="font-headline text-2xl font-black tracking-tight text-white">
                    {project.name}
                  </h3>
                  {project.description ? (
                    <p className="mt-2 line-clamp-2 text-sm font-medium text-muted-foreground">
                      {project.description}
                    </p>
                  ) : null}
                </div>

                <div className="mt-auto flex items-center gap-3 pt-8">
                  <div className="flex items-center gap-1.5 rounded-[var(--neo-radius)] border-2 border-[var(--neo-line)] bg-cyan-950/45 px-3 py-1 text-xs font-black text-cyan-300 shadow-[var(--neo-shadow-sm)]">
                    <Layers className="w-3.5 h-3.5" />
                    <span>{project.topicsCount ?? 0}</span>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-[var(--neo-radius)] border-2 border-[var(--neo-line)] bg-cyan-950/45 px-3 py-1 text-xs font-black text-cyan-300 shadow-[var(--neo-shadow-sm)]">
                    <BookA className="w-3.5 h-3.5" />
                    <span>{project.wordsCount ?? 0}</span>
                  </div>
                </div>

                {/* Delete button positioned top-right, visible on group hover */}
                <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="neoGhost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:border-red-500/70 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete project?</AlertDialogTitle>
                      </AlertDialogHeader>
                      <p>
                        Are you sure you want to permanently delete the project
                        "{project.name}" and all its topics and vocabulary? This
                        action cannot be undone.
                      </p>
                      <div className="mt-4 flex justify-center gap-2">
                        <AlertDialogCancel asChild>
                          <Button variant="neoSecondary" className="mt-0">
                            Cancel
                          </Button>
                        </AlertDialogCancel>
                        <AlertDialogAction asChild>
                          <Button
                            variant="neoDanger"
                            onClick={async () => {
                              try {
                                await deleteProject(project.id);
                              } catch (e) {
                                /* ignore */
                              }
                            }}
                          >
                            Delete
                          </Button>
                        </AlertDialogAction>
                      </div>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>

                {/* Overlay link makes entire card clickable, placed under the delete button */}
                <Link
                  href={`/projects/${project.id}`}
                  className="absolute inset-0 z-10"
                  aria-hidden
                />
              </NeoPanel>
            </div>
          ))}
        </div>
      ) : (
        <NeoPanel subtle className="py-20 text-center">
          <h2 className="text-2xl font-black text-white">No Projects Yet</h2>
          <p className="mt-2 text-base font-medium text-muted-foreground">
            Click &quot;New Project&quot; to get started.
          </p>
        </NeoPanel>
      )}
      {/* Infinite scroll sentinel and loading indicator */}
      {hasMore && (
        <div className="mt-8">
          <div ref={loadMoreRef} className="h-10 w-full" />
          {isValidating && (
            <div
              className="flex items-center justify-center gap-2 text-sm md:text-base text-muted-foreground"
              aria-live="polite"
            >
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
              Loading more...
            </div>
          )}
        </div>
      )}
    </NeoPage>
  );
}
