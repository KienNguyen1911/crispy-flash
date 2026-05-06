"use client";

import { useState, useRef, useCallback } from "react";
import { apiUrl } from "@/lib/api";
import { BackupHeader } from "./BackupHeader";
import { BackupProgress } from "./BackupProgress";
import { BackupLogs } from "./BackupLogs";
import { BackupSummary } from "./BackupSummary";

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

  const addLog = useCallback(
    (message: string, type: "info" | "success" | "error" = "info") => {
      setLogs((prev) => [
        ...prev,
        { time: new Date().toLocaleTimeString("vi-VN"), message, type },
      ]);
    },
    []
  );

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

  const isRunning = progress?.status === "running";

  return (
    <div className="rounded-xl border border-border/60 bg-card overflow-hidden shadow-sm">
      <BackupHeader
        status={progress?.status ?? null}
        isExpanded={isExpanded}
        isRunning={isRunning}
        onStartBackup={startBackup}
        onToggleExpand={() => setIsExpanded((e) => !e)}
        hasProgress={!!progress}
      />

      {progress && isExpanded && (
        <>
          <BackupProgress
            tablesDone={progress.tablesDone}
            tablesTotal={progress.tablesTotal}
            rowsCopied={progress.rowsCopied}
            errors={progress.errors}
            currentTable={progress.currentTable}
            status={progress.status}
          />
          <BackupLogs logs={logs} />
        </>
      )}

      {progress && !isExpanded && (
        <BackupSummary
          tablesDone={progress.tablesDone}
          tablesTotal={progress.tablesTotal}
          rowsCopied={progress.rowsCopied}
          status={progress.status}
        />
      )}
    </div>
  );
}
