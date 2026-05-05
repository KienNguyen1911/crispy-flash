"use client";

import { ArrowLeft, Clock3, Eye, ListChecks, TriangleAlert } from "lucide-react";
import { useDailyReviewHistory, useDailyReviewSummary, useDueReviewCount, useWeakWords } from "@/hooks/use-srs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { BatchReviewSummary } from "./ReviewSession";

interface ProjectReviewOverviewProps {
  projectId: string;
  projectTitle: string;
  batchSummary: BatchReviewSummary | null;
  onStartReview: () => void;
  onBack: () => void;
}

export function ProjectReviewOverview({
  projectId,
  projectTitle,
  batchSummary,
  onStartReview,
  onBack,
}: ProjectReviewOverviewProps) {
  const { summary, isLoading: summaryLoading } = useDailyReviewSummary(projectId);
  const { items: reviewedToday, isLoading: historyLoading } = useDailyReviewHistory(projectId);
  const { weakWords, isLoading: weakWordsLoading } = useWeakWords(projectId);
  const { count, dueToday, overdue, isLoading: dueLoading } = useDueReviewCount(projectId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-sm text-muted-foreground">Smart Review</div>
          <h2 className="text-2xl font-bold">{projectTitle}</h2>
        </div>
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Projects
        </Button>
      </div>

      {batchSummary && (
        <Card className="border-cyan-500/30 bg-cyan-500/5">
          <CardHeader>
            <CardTitle>Batch completed</CardTitle>
            <CardDescription>Your batch is done. You can inspect today&apos;s results or view weak words.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-5">
            <MetricCard label="Reviewed in batch" value={batchSummary.reviewedCount} />
            <MetricCard label="Correct" value={batchSummary.correctCount} />
            <MetricCard label="Incorrect" value={batchSummary.incorrectCount} />
            <MetricCard label="Timeout" value={batchSummary.timeoutCount} />
            <MetricCard label="Weak words now" value={summary?.weakWordCount || 0} />
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Today in this project</CardTitle>
            <CardDescription>Daily progress for the selected project.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard label="Reviewed today" value={summaryLoading ? "-" : summary?.reviewedCount || 0} />
              <MetricCard label="Correct" value={summaryLoading ? "-" : summary?.correctCount || 0} />
              <MetricCard label="Incorrect" value={summaryLoading ? "-" : summary?.incorrectCount || 0} />
              <MetricCard label="Timeout / Slow" value={summaryLoading ? "-" : `${summary?.timeoutCount || 0} / ${summary?.slowCount || 0}`} />
            </div>
            <HistoryDialog
              reviewedToday={reviewedToday}
              loading={historyLoading}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Need attention</CardTitle>
            <CardDescription>Weak words are listed for later review, not re-tested immediately.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <MetricCard label="Weak words" value={summaryLoading ? "-" : summary?.weakWordCount || 0} />
            <WeakWordsDialog weakWords={weakWords} loading={weakWordsLoading} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Review queue</CardTitle>
          <CardDescription>Each word appears once in a batch, up to 50 words.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <MetricCard label="Total to review" value={dueLoading ? "-" : count} />
            <MetricCard label="Due today" value={dueLoading ? "-" : dueToday} />
            <MetricCard label="Overdue" value={dueLoading ? "-" : overdue} />
          </div>
          <Button onClick={onStartReview} disabled={dueLoading || count === 0} className="w-full sm:w-auto">
            Start Review 50 words
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

function HistoryDialog({
  reviewedToday,
  loading,
}: {
  reviewedToday: ReturnType<typeof useDailyReviewHistory>["items"];
  loading: boolean;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Eye className="mr-2 h-4 w-4" />
          View reviewed today
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Reviewed today</DialogTitle>
          <DialogDescription>Latest result for each word you reviewed today in this project.</DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-2">
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading reviewed words...</div>
          ) : reviewedToday.length === 0 ? (
            <div className="text-sm text-muted-foreground">No reviewed words yet today.</div>
          ) : (
            reviewedToday.map((item) => (
              <div key={item.vocabularyId} className="rounded-lg border p-3" suppressHydrationWarning>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold">{item.word || item.pronunciation || "Untitled word"}</div>
                    <div className="text-sm text-muted-foreground">{item.meaning}</div>
                  </div>
                  <StatusBadge result={item.result} />
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span>{new Date(item.reviewedAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</span>
                  {item.responseTimeMs !== null && (
                    <span>{(item.responseTimeMs / 1000).toFixed(1)}s</span>
                  )}
                  {item.isSlow && (
                    <span className="font-medium text-amber-500">Slow</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function WeakWordsDialog({
  weakWords,
  loading,
}: {
  weakWords: ReturnType<typeof useWeakWords>["weakWords"];
  loading: boolean;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <ListChecks className="mr-2 h-4 w-4" />
          View weak words
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Weak words</DialogTitle>
          <DialogDescription>These words need attention later, but they are not repeated immediately after a batch.</DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-2">
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading weak words...</div>
          ) : weakWords.length === 0 ? (
            <div className="text-sm text-muted-foreground">No weak words right now.</div>
          ) : (
            weakWords.map((item) => (
              <div key={item.id} className="rounded-lg border p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold">{item.word || item.pronunciation || "Untitled word"}</div>
                    <div className="text-sm text-muted-foreground">{item.meaning}</div>
                  </div>
                  <Badge variant={item.weakLevel === "HIGH_RISK" ? "destructive" : "secondary"}>
                    {item.weakLevel === "HIGH_RISK" ? "High risk" : "Needs review"}
                  </Badge>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge variant="outline">Weak score: {item.weakScore}</Badge>
                  {item.reasons.map((reason) => (
                    <Badge key={reason} variant="outline" className="text-xs">
                      {reason}
                    </Badge>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function StatusBadge({ result }: { result: "CORRECT" | "INCORRECT" | "TIMEOUT" }) {
  if (result === "CORRECT") {
    return <Badge className="bg-green-600 text-white hover:bg-green-700">Correct</Badge>;
  }

  if (result === "TIMEOUT") {
    return (
      <Badge variant="secondary">
        <Clock3 className="mr-1 h-3 w-3" />
        Timeout
      </Badge>
    );
  }

  return (
    <Badge variant="destructive">
      <TriangleAlert className="mr-1 h-3 w-3" />
      Incorrect
    </Badge>
  );
}
