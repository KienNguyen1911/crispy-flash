"use client";

import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Log {
  time: string;
  message: string;
  type: "info" | "success" | "error";
}

interface BackupLogsProps {
  logs: Log[];
}

export function BackupLogs({ logs }: BackupLogsProps) {
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <div className="px-5 py-4 space-y-1.5">
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
  );
}
