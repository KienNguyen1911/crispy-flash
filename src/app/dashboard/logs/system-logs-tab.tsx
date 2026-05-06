'use client';

import { useState } from "react";
import { format } from "date-fns";
import { Loader2, RefreshCcw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiClient } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface SystemLog {
  id: string;
  level: "INFO" | "WARN" | "ERROR";
  message: string;
  context?: string;
  metadata?: any;
  createdAt: string;
}

interface Meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface InitialData {
  data: SystemLog[];
  meta: Meta;
}

export function SystemLogsTab({ initialData }: { initialData: InitialData }) {
  const [page, setPage] = useState(1);
  const [level, setLevel] = useState("ALL");

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["system-logs", page, level],
    queryFn: async () => {
      const data = await apiClient<{ data: SystemLog[]; meta: Meta }>(
        `/system-logs?page=${page}&limit=20&level=${level}`
      );
      return data as { data: SystemLog[]; meta: Meta };
    },
    initialData: page === 1 && level === "ALL" ? initialData : undefined,
  });

  const logs = data?.data || [];
  const meta = data?.meta || null;

  const getLevelColor = (level: string) => {
    switch (level) {
      case "ERROR": return "destructive";
      case "WARN": return "secondary";
      default: return "secondary";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
            <div>
                <CardTitle>System & Error Logs</CardTitle>
                <CardDescription>View application errors and system events.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
                <Select value={level} onValueChange={(val) => { setLevel(val); setPage(1); }}>
                    <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Filter Level" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">All Levels</SelectItem>
                        <SelectItem value="ERROR">Error</SelectItem>
                        <SelectItem value="WARN">Warning</SelectItem>
                        <SelectItem value="INFO">Info</SelectItem>
                    </SelectContent>
                </Select>
            <Button variant="outline" size="icon" onClick={() => refetch()}>
                    <RefreshCcw className="h-4 w-4" />
                </Button>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">Timestamp</TableHead>
                <TableHead className="w-[100px]">Level</TableHead>
                <TableHead>Message</TableHead>
                <TableHead className="w-[200px]">Context</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                 <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    </TableCell>
                 </TableRow>
              ) : logs.length === 0 ? (
                 <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">No logs found.</TableCell>
                 </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id} suppressHydrationWarning>
                    <TableCell className="font-mono text-xs">
                      {format(new Date(log.createdAt), "yyyy-MM-dd HH:mm:ss")}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getLevelColor(log.level) as any}>{log.level}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">{log.message}</TableCell>
                    <TableCell className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {log.metadata?.method} {log.metadata?.path}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
         {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-end space-x-2 mt-4">
            <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
            >
                Previous
            </Button>
            <div className="text-sm text-muted-foreground">
                Page {page} of {meta.totalPages}
            </div>
            <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                disabled={page === meta.totalPages}
            >
                Next
            </Button>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
