"use client";

import { Progress } from "@/components/ui/progress";

interface BackupSummaryProps {
  tablesDone: number;
  tablesTotal: number;
  rowsCopied: number;
  status: "idle" | "running" | "completed" | "failed";
}

export function BackupSummary({
  tablesDone,
  tablesTotal,
  rowsCopied,
  status,
}: BackupSummaryProps) {
  const pct = tablesTotal > 0 ? Math.round((tablesDone / tablesTotal) * 100) : 0;
  const isCompleted = status === "completed";
  const isFailed = status === "failed";

  return (
    <div className="px-5 py-2.5 flex items-center gap-3 bg-muted/20 border-t border-border/40">
      <Progress
        value={isCompleted ? 100 : pct}
        className={`flex-1 h-1.5 ${
          isFailed
            ? "[&>div]:bg-red-500"
            : isCompleted
            ? "[&>div]:bg-emerald-500"
            : "[&>div]:bg-gradient-to-r [&>div]:from-violet-500 [&>div]:to-indigo-500"
        }`}
      />
      <span className="text-xs text-muted-foreground shrink-0 tabular-nums">
        {isCompleted ? "100%" : `${pct}%`} · {rowsCopied.toLocaleString()} rows
      </span>
    </div>
  );
}
