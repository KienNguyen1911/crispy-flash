"use client";

import { useState } from "react";
import useSWR from "swr";
import { ProjectReviewOverview } from "@/components/srs/ProjectReviewOverview";
import { BatchReviewSummary, ReviewSession } from "@/components/srs/ReviewSession";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, BookOpen, ArrowRight, Loader, BarChart3 } from "lucide-react";
import { useDailyReviewSummary, useDueReviewCount } from "@/hooks/use-srs";
import { getProjects } from "@/services/projects-api";

export default function ReviewPage() {
  const { data: projects = [], isLoading: projectsLoading } = useSWR(
    "/api/projects",
    getProjects,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );
  const [isInSession, setIsInSession] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [lastBatchSummary, setLastBatchSummary] = useState<BatchReviewSummary | null>(null);

  const handleSelectProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    setIsInSession(false);
  };

  const handleStartReview = (projectId: string) => {
    setSelectedProjectId(projectId);
    setIsInSession(true);
    setLastBatchSummary(null);
  };

  const handleCompleteSession = (summary: BatchReviewSummary) => {
    setLastBatchSummary(summary);
    setIsInSession(false);
  };

  const handleCancelSession = () => {
    setIsInSession(false);
  };

  const selectedProject = projects.find((project: any) => project.id === selectedProjectId);

  return (
    <div className="container mx-auto py-6 px-4 max-w-6xl">
      <div className="mb-8">
        <div className="flex items-center gap-2">
          <Brain className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold">Smart Review</h1>
        </div>
        <p className="text-muted-foreground mt-2">Select a project to start reviewing vocabulary</p>
      </div>

      {isInSession ? (
        <ReviewSession
          projectId={selectedProjectId}
          onComplete={handleCompleteSession}
          onCancel={handleCancelSession}
        />
      ) : selectedProject ? (
        <ProjectReviewOverview
          projectId={selectedProject.id}
          projectTitle={selectedProject.title}
          batchSummary={lastBatchSummary}
          onStartReview={() => handleStartReview(selectedProject.id)}
          onBack={() => {
            setSelectedProjectId("");
            setLastBatchSummary(null);
          }}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projectsLoading ? (
            <Card className="col-span-full">
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  <Loader className="h-8 w-8 mx-auto mb-2 animate-spin" />
                  <p>Loading projects...</p>
                </div>
              </CardContent>
            </Card>
          ) : projects.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No projects yet. Create a project to start reviewing!</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            projects.map((project: any) => (
              <ProjectReviewCard
                key={project.id}
                project={project}
                onSelect={handleSelectProject}
                onStartReview={handleStartReview}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

interface ProjectReviewCardProps {
  project: any;
  onSelect: (projectId: string) => void;
  onStartReview: (projectId: string) => void;
}

function ProjectReviewCard({ project, onSelect, onStartReview }: ProjectReviewCardProps) {
  const { count, dueToday, overdue, isLoading } = useDueReviewCount(project.id);
  const { summary, isLoading: summaryLoading } = useDailyReviewSummary(project.id);

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{project.title}</CardTitle>
            {project.description && (
              <CardDescription className="mt-1">{project.description}</CardDescription>
            )}
          </div>
          <BookOpen className="h-5 w-5 text-blue-600 flex-shrink-0" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{isLoading ? "-" : count}</div>
              <div className="text-xs text-muted-foreground">Total to review</div>
            </div>
            <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{isLoading ? "-" : dueToday}</div>
              <div className="text-xs text-muted-foreground">Due today</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-100 dark:bg-slate-900 p-3 rounded-lg">
              <div className="text-2xl font-bold">{summaryLoading ? "-" : summary?.reviewedCount || 0}</div>
              <div className="text-xs text-muted-foreground">Today reviewed</div>
            </div>
            <div className="bg-amber-50 dark:bg-amber-950 p-3 rounded-lg">
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-300">
                {summaryLoading ? "-" : summary?.weakWordCount || 0}
              </div>
              <div className="text-xs text-muted-foreground">Weak words</div>
            </div>
          </div>

          {/* Overdue warning */}
          {overdue > 0 && (
            <div className="bg-red-50 dark:bg-red-950 p-3 rounded-lg border border-red-200 dark:border-red-800">
              <div className="text-sm font-medium text-red-600 dark:text-red-400">
                ⚠️ {overdue} overdue
              </div>
            </div>
          )}

          {/* Start button */}
          <Button
            className="w-full mt-2"
            disabled={isLoading || count === 0}
            onClick={(e) => {
              e.stopPropagation();
              onStartReview(project.id);
            }}
          >
            {count === 0 ? "No words to review" : "Start Review"}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
          <Button
            className="w-full"
            variant="outline"
            onClick={() => onSelect(project.id)}
          >
            Today Summary
            <BarChart3 className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
