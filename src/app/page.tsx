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
import { Trash2 } from "lucide-react";
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
      <div className="container mx-auto max-w-5xl py-8 px-4">
        <Card className="mb-8 p-6" variant="glass">
          <CardHeader className="text-center">
            <CardTitle className="text-4xl font-bold font-headline mb-4">
              Welcome to LinguaFlash
            </CardTitle>
            <CardDescription className="text-lg">
              Master Japanese vocabulary with intelligent flashcards. Organize,
              learn, and track your progress effectively.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            {/* Use the login function from useAuth */}
            <Button onClick={login} size="lg" className="mb-4">
              <PlusCircle className="mr-2 h-5 w-5" />
              Sign In with Google
            </Button>
            <p className="text-sm text-muted-foreground">
              New to LinguaFlash? Check out our{" "}
              <a href="/guide" className="text-primary hover:underline">
                complete guide
              </a>{" "}
              to get started.
            </p>
          </CardContent>
        </Card>
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
                  relative h-full flex flex-col
                  hover:shadow-lg hover:scale-105 hover:ring-primary/50 transition-all duration-300
                "
              >
                <CardHeader>
                  <div>
                    <CardTitle className="font-headline">
                      {project.name}
                    </CardTitle>
                    {/* <CardDescription>{project.description}</CardDescription> */}
                  </div>
                </CardHeader>

                <CardContent className="flex-grow">
                  <div className="text-sm text-muted-foreground">
                    <p>{(project as any).topicsCount ?? 0} topic(s)</p>
                    <p>{(project as any).wordsCount ?? 0} word(s)</p>
                  </div>
                </CardContent>

                {/* Delete button positioned top-right */}
                <div className="absolute top-2 right-2 z-20">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
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
              className="flex items-center justify-center gap-2 text-sm text-muted-foreground"
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
