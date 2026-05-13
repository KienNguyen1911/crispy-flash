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
import { NeoHeader, NeoPage, NeoPanel, NeoStat } from "@/components/ui/neo";

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
    <NeoPage>
      <NeoHeader
        title={
          <span className="inline-flex items-center gap-3">
            <Brain className="h-8 w-8 text-cyan-300" />
            Smart Review
          </span>
        }
        description="Select a project to start reviewing vocabulary"
        className="mb-8"
      />

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
    </NeoPage>
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
    <NeoPanel className="transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{project.title}</CardTitle>
            {project.description && (
              <CardDescription className="mt-1">{project.description}</CardDescription>
            )}
          </div>
          <BookOpen className="h-5 w-5 flex-shrink-0 text-cyan-300" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <NeoStat tone="info" value={isLoading ? "-" : count} label="Total to review" className="p-3" />
            <NeoStat tone="success" value={isLoading ? "-" : dueToday} label="Due today" className="p-3" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <NeoStat value={summaryLoading ? "-" : summary?.reviewedCount || 0} label="Today reviewed" className="p-3" />
            <NeoStat tone="warning" value={summaryLoading ? "-" : summary?.weakWordCount || 0} label="Weak words" className="p-3" />
          </div>

          {/* Overdue warning */}
          {overdue > 0 && (
            <div className="rounded-[var(--neo-radius)] border-2 border-[var(--neo-danger)] bg-red-950/45 p-3 shadow-[var(--neo-shadow-sm)]">
              <div className="text-sm font-bold text-red-200">
                {overdue} overdue
              </div>
            </div>
          )}

          {/* Start button */}
          <Button
            className="w-full mt-2"
            variant="neo"
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
            variant="neoSecondary"
            onClick={() => onSelect(project.id)}
          >
            Today Summary
            <BarChart3 className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </NeoPanel>
  );
}
