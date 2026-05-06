"use client";

import { Progress } from "@/components/ui/progress";
import { Database, TableProperties, AlertTriangle } from "lucide-react";

interface BackupProgressProps {
  tablesDone: number;
  tablesTotal: number;
  rowsCopied: number;
  errors: string[];
  currentTable: string;
  status: "idle" | "running" | "completed" | "failed";
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

export function BackupProgress({
  tablesDone,
  tablesTotal,
  rowsCopied,
  errors,
  currentTable,
  status,
}: BackupProgressProps) {
  const pct = tablesTotal > 0 ? Math.round((tablesDone / tablesTotal) * 100) : 0;
  const isCompleted = status === "completed";
  const isFailed = status === "failed";

  return (
    <div className="px-5 py-4 space-y-4">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground font-medium">
            {isCompleted
              ? "Backup hoàn tất"
              : isFailed
              ? "Backup thất bại"
              : `Đang backup: ${currentTable || "…"}`}
          </span>
          <span className="tabular-nums font-mono text-foreground/70">
            {tablesDone}/{tablesTotal} bảng
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

      <div className="grid grid-cols-3 gap-3">
        <StatBox
          icon={<TableProperties className="h-3.5 w-3.5 text-indigo-400" />}
          label="Bảng xong"
          value={`${tablesDone}/${tablesTotal}`}
        />
        <StatBox
          icon={<Database className="h-3.5 w-3.5 text-violet-400" />}
          label="Rows đã copy"
          value={rowsCopied.toLocaleString("vi-VN")}
        />
        <StatBox
          icon={<AlertTriangle className="h-3.5 w-3.5 text-amber-400" />}
          label="Lỗi"
          value={String(errors.length)}
          valueClass={errors.length > 0 ? "text-amber-400" : undefined}
        />
      </div>
    </div>
  );
}
