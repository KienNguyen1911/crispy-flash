'use client';

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Loader2, RefreshCcw } from "lucide-react";
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

interface Meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface InitialData {
  data: GenerationLog[];
  meta: Meta;
}

export function AiQueueTab({ initialData }: { initialData: InitialData }) {
  const [logs, setLogs] = useState<GenerationLog[]>(initialData.data);
  const [meta, setMeta] = useState<Meta>(initialData.meta);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("ALL");

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await apiClient(
        `/system-logs/generation?page=${page}&limit=20&status=${status}`
      );
      setLogs((data as any).data);
      setMeta(data as any);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (page === 1 && status === "ALL") return;
    fetchLogs();
  }, [page, status]);

  const getStatusColor = (status: string) => {
      switch (status) {
          case 'COMPLETED': return 'default';
          case 'FAILED': return 'destructive';
          case 'TIMEOUT': return 'destructive';
          case 'GENERATING': return 'secondary';
          default: return 'outline';
      }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
            <div>
                <CardTitle>AI Generation Queue</CardTitle>
                <CardDescription>Monitor AI story generation jobs.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
                <Select value={status} onValueChange={(val) => { setStatus(val); setPage(1); }}>
                    <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Filter Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">All Status</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                        <SelectItem value="FAILED">Failed</SelectItem>
                        <SelectItem value="GENERATING">Generating</SelectItem>
                        <SelectItem value="TIMEOUT">Timeout</SelectItem>
                    </SelectContent>
                </Select>
                <Button variant="outline" size="icon" onClick={() => fetchLogs()}>
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
                <TableHead>Topic</TableHead>
                <TableHead className="w-[100px]">Status</TableHead>
                <TableHead className="w-[100px]">Duration</TableHead>
                <TableHead>Error</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                 <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    </TableCell>
                 </TableRow>
              ) : logs.length === 0 ? (
                 <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">No logs found.</TableCell>
                 </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id} suppressHydrationWarning>
                    <TableCell className="font-mono text-xs">
                      {format(new Date(log.createdAt), "yyyy-MM-dd HH:mm:ss")}
                    </TableCell>
                    <TableCell className="font-medium">
                      {log.topic?.title || "Unknown Topic"}
                    </TableCell>
                     <TableCell>
                      <Badge variant={getStatusColor(log.status) as any}>{log.status}</Badge>
                    </TableCell>
                    <TableCell>
                        {log.duration ? `${(log.duration / 1000).toFixed(1)}s` : '-'}
                    </TableCell>
                    <TableCell className="text-xs text-red-500 max-w-[200px] truncate">
                        {log.error}
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
