"use client";

import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2, Layers, BookA } from "lucide-react";
import ProjectCreate from "@/components/projects/ProjectCreate";
import DataLoader from "@/components/ui/DataLoader";
import useSWR from "swr";
import useSWRInfinite from "swr/infinite";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useAuthFetcher } from "@/hooks/useAuthFetcher";
import { toast } from "sonner";
import { useEffect, useRef } from "react";

export default function Dashboard() {
  const { isAuthenticated, isLoading, login } = useAuth();
  const fetcher = useAuthFetcher();

  // Keep project creation/deletion working; list will be handled by SWRInfinite below
  const { mutate: mutateProjectsLegacy } = useSWR(null, null);

  const PAGE_SIZE = 20;
  const getKey = (pageIndex: number, previousPageData: any) => {
    if (!isAuthenticated) return null;
    if (previousPageData && !previousPageData.hasMore) return null;
    const page = pageIndex + 1;
    return `/api/projects?page=${page}&limit=${PAGE_SIZE}`;
  };

  const {
    data: projectPages,
    error: projectsError,
    size,
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

  // Ensure hooks are declared before any early returns
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
      // Revalidate from first page to include the new project at the top
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

  if (isLoading) {
    return <DataLoader />;
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto max-w-6xl py-12 px-4 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 text-center lg:text-left">
            <h1 className="text-5xl md:text-6xl font-bold font-headline tracking-tight leading-tight">
              Master Japanese Vocabulary with <span className="text-primary block mt-2">Intelligent Flashcards</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Stop forgetting. Start systematizing your learning today. Group words into projects, study by topic, and let spaced repetition handle the rest.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
              <Button onClick={login} size="lg" className="w-full sm:w-auto text-lg h-14 px-8 rounded-full shadow-glow">
                Sign In with Google
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto text-lg h-14 px-8 rounded-full">
                <a href="/guide">View Guide</a>
              </Button>
            </div>
          </div>
          
          <div className="relative mx-auto w-full max-w-lg lg:max-w-none perspective-1000">
             <div className="relative w-full aspect-square rounded-[2rem] bg-glass-bg border border-glass-border shadow-glass-card p-8 flex items-center justify-center overflow-hidden">
                {/* Decorative floating elements simulating flashcards */}
                <div className="absolute top-1/4 -left-4 w-32 h-40 bg-card rounded-xl border border-border shadow-2xl transform -rotate-12 flex items-center justify-center text-4xl font-headline text-muted-foreground opacity-30 blur-[2px]">漢字</div>
                <div className="absolute bottom-1/4 -right-4 w-32 h-40 bg-card rounded-xl border border-border shadow-2xl transform rotate-12 flex items-center justify-center text-4xl font-headline text-muted-foreground opacity-30 blur-[2px]">単語</div>
                
                {/* Main center "flashcard" */}
                <div className="relative z-10 w-full max-w-xs aspect-[3/4] bg-background rounded-2xl border border-primary/30 shadow-glow flex flex-col items-center justify-center text-center p-6 transition-transform hover:scale-105 duration-500 cursor-default">
                   <div className="text-6xl md:text-7xl font-headline font-bold text-foreground mb-6">意</div>
                   <div className="text-xl text-primary font-medium tracking-wide">mind, meaning</div>
                   <div className="mt-auto mb-4 flex gap-2 w-full px-4">
                      <div className="h-2 flex-1 bg-destructive/20 rounded-full" />
                      <div className="h-2 flex-1 bg-success/80 rounded-full shadow-[0_0_10px_rgba(38,204,143,0.5)]" />
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    );
  }

  if (isInitialLoading) {
    return <DataLoader />;
  }

  return (
    <div className="container mx-auto max-w-5xl py-8 px-4">
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold font-headline">
              Master Vocabulary!
            </h1>
            <p className="text-muted-foreground">
              Flashcards only unlock maximum recall power when they are
              organized. Start systematizing your vocabulary today!
            </p>
          </div>
        </div>
      </Card>

      <div className="flex items-center justify-between py-6">
        <h2 className="text-2xl font-bold font-headline text-foreground">
          All Projects
        </h2>
        <ProjectCreate
          onSubmit={addProject}
          onProjectCreated={() => mutateProjectsPages()}
        />
      </div>

      {projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project: any) => (
            <div key={project.id}>
              <Card
                className="
                  group relative h-full flex flex-col
                  bg-card/40 backdrop-blur-sm border-white/5 shadow-lg
                  hover:shadow-glow hover:scale-[1.02] hover:border-primary/30 transition-all duration-300
                "
              >
                <CardHeader>
                  <div>
                    <CardTitle className="font-headline text-xl tracking-tight">
                      {project.name}
                    </CardTitle>
                  </div>
                </CardHeader>

                <CardContent className="flex-grow flex flex-col justify-end">
                  <div className="flex items-center gap-3 mt-4">
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                      <Layers className="w-3.5 h-3.5" />
                      <span>{(project as any).topicsCount ?? 0}</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                      <BookA className="w-3.5 h-3.5" />
                      <span>{(project as any).wordsCount ?? 0}</span>
                    </div>
                  </div>
                </CardContent>

                {/* Delete button positioned top-right, visible on group hover */}
                <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8 rounded-full"
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
                          <Button variant="outline" className="mt-0">
                            Cancel
                          </Button>
                        </AlertDialogCancel>
                        <AlertDialogAction asChild>
                          <Button
                            variant="destructive"
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
              </Card>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border-2 border-dashed rounded-lg">
          <h2 className="text-xl font-semibold">No Projects Yet</h2>
          <p className="text-muted-foreground mt-2">
            Click &quot;New Project&quot; to get started.
          </p>
        </div>
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
    </div>
  );
}
