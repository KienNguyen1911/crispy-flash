"use client";

import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { ProjectForm } from "@/components/projects/ProjectForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import DataLoader from "@/components/ui/DataLoader";
import useSWR from "swr";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useAuthFetcher } from '@/hooks/useAuthFetcher';
import { toast } from "sonner";

export default function Dashboard() {
  const { isAuthenticated, isLoading, login } = useAuth();
  const fetcher = useAuthFetcher();

  const { data: projectsRaw, error: projectsError, mutate: mutateProjects } = useSWR(
    isAuthenticated ? '/api/projects' : null,
    fetcher
  );

  const projects = projectsRaw
    ? projectsRaw.map((p: any) => ({
        id: p.id,
        name: p.title ?? p.name ?? "",
        description: p.description ?? "",
        topicsCount: p.topicsCount ?? 0,
        wordsCount: p.wordsCount ?? 0
      }))
    : [];

  const addProject = async (projectData: any): Promise<boolean> => {
    try {
      const body = {
        title: projectData.name,
        description: projectData.description || ""
      };
      // No need to pass token, apiClient handles it
      await apiClient("/api/projects", {
        method: "POST",
        body: JSON.stringify(body)
      });
      // Refresh the projects list after creation
      mutateProjects();
      toast.success("Project created successfully");
      return true;
    } catch (err) {
      console.error("Create project error:", err);
      return false;
    }
  };

  const deleteProject = async (projectId: string) => {
    try {
      // No need to pass token, apiClient handles it
      await apiClient(`/api/projects/${projectId}`, {
        method: "DELETE"
      });
      mutateProjects(); // Refresh the projects list

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

  return (
    <div className="container mx-auto max-w-5xl py-8 px-4">
      <Card className="mb-8 p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold font-headline">My Projects</h1>
            <p className="text-muted-foreground">
              Organize your vocabulary learning into projects.
            </p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create a New Project</DialogTitle>
              </DialogHeader>
              <ProjectForm
                onSubmit={addProject}
                submitButtonText="Create Project"
              />
            </DialogContent>
          </Dialog>
        </div>
      </Card>

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
                          <Button variant="outline" className="mt-0">Cancel</Button>
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
    </div>
  );
}