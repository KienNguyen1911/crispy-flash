"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiUrl } from "@/lib/api";
import {
  Database,
  CloudUpload,
  CheckCircle2,
  XCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  TableProperties,
} from "lucide-react";

interface BackupProgress {
  jobId: string;
  status: "idle" | "running" | "completed" | "failed";
  currentTable: string;
  tablesDone: number;
  tablesTotal: number;
  rowsCopied: number;
  errors: string[];
  startedAt?: string;
  completedAt?: string;
  message?: string;
}

const TABLE_TOTAL = 12;

export function DatabaseBackupPanel() {
  const [progress, setProgress] = useState<BackupProgress | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [logs, setLogs] = useState<{ time: string; message: string; type: "info" | "success" | "error" }[]>([]);
  const esRef = useRef<EventSource | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const addLog = useCallback(
    (message: string, type: "info" | "success" | "error" = "info") => {
      setLogs((prev) => [
        ...prev,
        { time: new Date().toLocaleTimeString("vi-VN"), message, type },
      ]);
    },
    []
  );

  // Auto scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const startBackup = useCallback(async () => {
    if (esRef.current) {
      esRef.current.close();
    }

    setLogs([]);
    setIsExpanded(true);
    addLog("Khởi động backup...", "info");

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("jwt_token") : null;
      const res = await fetch(apiUrl("/dashboard/backup/start"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) {
        throw new Error(`Không thể bắt đầu backup: ${res.status} ${res.statusText}`);
      }

      const { jobId } = await res.json();
      addLog(`Job ID: ${jobId}`, "info");

      setProgress({
        jobId,
        status: "running",
        currentTable: "",
        tablesDone: 0,
        tablesTotal: TABLE_TOTAL,
        rowsCopied: 0,
        errors: [],
        message: "Đang kết nối Supabase...",
      });

      // Connect SSE stream with auth token in query param (fallback for SSE)
      const sseUrl = `${apiUrl("/dashboard/backup/stream/" + jobId)}${token ? `?token=${token}` : ""}`;
      const es = new EventSource(sseUrl);
      esRef.current = es;

      es.onmessage = (event) => {
        try {
          const data: BackupProgress = JSON.parse(event.data);
          setProgress(data);

          if (data.message) {
            const type =
              data.status === "failed"
                ? "error"
                : data.status === "completed"
                ? "success"
                : "info";
            addLog(data.message, type);
          }

          // Log errors inline
          if (data.errors?.length) {
            const lastErr = data.errors[data.errors.length - 1];
            addLog(lastErr, "error");
          }

          if (data.status === "completed" || data.status === "failed") {
            es.close();
            esRef.current = null;
          }
        } catch {
          // ignore parse errors
        }
      };

      es.onerror = () => {
        if (esRef.current) {
          addLog("Kết nối stream bị gián đoạn.", "error");
          es.close();
          esRef.current = null;
        }
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      addLog(`Lỗi: ${message}`, "error");
      setProgress((prev) =>
        prev
          ? { ...prev, status: "failed", message }
          : null
      );
    }
  }, [addLog]);

  const pct =
    progress && progress.tablesTotal > 0
      ? Math.round((progress.tablesDone / progress.tablesTotal) * 100)
      : 0;

  const isRunning = progress?.status === "running";
  const isCompleted = progress?.status === "completed";
  const isFailed = progress?.status === "failed";

  const statusBadge = () => {
    if (!progress) return null;
    switch (progress.status) {
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
    <div className="rounded-xl border border-border/60 bg-card overflow-hidden shadow-sm">
      {/* Header bar */}
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
            onClick={startBackup}
            className="gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white border-0 shadow-none"
          >
            {isRunning ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <CloudUpload className="h-3.5 w-3.5" />
            )}
            {isRunning ? "Đang backup..." : "Bắt đầu Backup"}
          </Button>

          {progress && (
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-muted-foreground"
              onClick={() => setIsExpanded((e) => !e)}
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

      {/* Progress section — only shown when there's active/past backup */}
      {progress && isExpanded && (
        <div className="px-5 py-4 space-y-4">
          {/* Overall progress bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-medium">
                {isCompleted
                  ? "Backup hoàn tất"
                  : isFailed
                  ? "Backup thất bại"
                  : `Đang backup: ${progress.currentTable || "…"}`}
              </span>
              <span className="tabular-nums font-mono text-foreground/70">
                {progress.tablesDone}/{progress.tablesTotal} bảng
              </span>
            </div>
            <div className="relative">
              <Progress
                value={isCompleted ? 100 : pct}
                className={`h-2 ${
                  isFailed
                    ? "[&>div]:bg-red-500"
                    : isCompleted
                    ? "[&>div]:bg-emerald-500"
                    : "[&>div]:bg-gradient-to-r [&>div]:from-violet-500 [&>div]:to-indigo-500"
                }`}
              />
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            <StatBox
              icon={<TableProperties className="h-3.5 w-3.5 text-indigo-400" />}
              label="Bảng xong"
              value={`${progress.tablesDone}/${progress.tablesTotal}`}
            />
            <StatBox
              icon={<Database className="h-3.5 w-3.5 text-violet-400" />}
              label="Rows đã copy"
              value={progress.rowsCopied.toLocaleString("vi-VN")}
            />
            <StatBox
              icon={<AlertTriangle className="h-3.5 w-3.5 text-amber-400" />}
              label="Lỗi"
              value={String(progress.errors.length)}
              valueClass={progress.errors.length > 0 ? "text-amber-400" : undefined}
            />
          </div>

          {/* Live log */}
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Live Log
            </p>
            <ScrollArea className="h-44 rounded-lg border border-border/50 bg-muted/30">
              <div className="p-3 font-mono text-xs space-y-1">
                {logs.map((log) => (
                  <div key={log.time} className="flex items-start gap-2">
                    <span className="shrink-0 text-muted-foreground/60">
                      {log.time}
                    </span>
                    <span
                      className={
                        log.type === "error"
                          ? "text-red-400"
                          : log.type === "success"
                          ? "text-emerald-400"
                          : "text-foreground/80"
                      }
                    >
                      {log.message}
                    </span>
                  </div>
                ))}
                <div ref={logsEndRef} />
              </div>
            </ScrollArea>
          </div>
        </div>
      )}

      {/* Compact summary bar when collapsed but has state */}
      {progress && !isExpanded && (
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
            {isCompleted ? "100%" : `${pct}%`} · {progress.rowsCopied.toLocaleString()} rows
          </span>
        </div>
      )}
    </div>
  );
}

function StatBox({
  icon,
  label,
  value,
  valueClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-lg border border-border/40 bg-muted/20 p-3">
      <div className="flex items-center gap-1.5 mb-1">
        {icon}
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className={`text-sm font-semibold tabular-nums ${valueClass ?? "text-foreground"}`}>
        {value}
      </p>
    </div>
  );
}
