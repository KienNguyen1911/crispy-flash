"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Database, CloudUpload, CheckCircle2, XCircle, Loader2, ChevronDown, ChevronUp } from "lucide-react";

interface BackupHeaderProps {
  status: "idle" | "running" | "completed" | "failed" | null;
  isExpanded: boolean;
  isRunning: boolean;
  onStartBackup: () => void;
  onToggleExpand: () => void;
  hasProgress: boolean;
}

export function BackupHeader({
  status,
  isExpanded,
  isRunning,
  onStartBackup,
  onToggleExpand,
  hasProgress,
}: BackupHeaderProps) {
  const statusBadge = () => {
    switch (status) {
      case "running":
        return (
          <Badge variant="outline" className="gap-1 border-blue-500/40 bg-blue-500/10 text-blue-400">
            <Loader2 className="h-3 w-3 animate-spin" />
            Đang chạy
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="outline" className="gap-1 border-emerald-500/40 bg-emerald-500/10 text-emerald-400">
            <CheckCircle2 className="h-3 w-3" />
            Hoàn thành
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="outline" className="gap-1 border-red-500/40 bg-red-500/10 text-red-400">
            <XCircle className="h-3 w-3" />
            Thất bại
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-border/60">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/20">
          <Database className="h-4.5 w-4.5 text-violet-400" />
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-sm text-foreground">Backup Database</h3>
          <p className="text-xs text-muted-foreground truncate">
            Local Docker → Supabase PostgreSQL
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {statusBadge()}

        <Button
          size="sm"
          disabled={isRunning}
          onClick={onStartBackup}
          className="gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white border-0 shadow-none"
        >
          {isRunning ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <CloudUpload className="h-3.5 w-3.5" />
          )}
          {isRunning ? "Đang backup..." : "Bắt đầu Backup"}
        </Button>

        {hasProgress && (
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-muted-foreground"
            onClick={onToggleExpand}
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
