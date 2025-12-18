"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Loader2, RefreshCcw, Search } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

// Types
interface SystemLog {
  id: string;
  level: "INFO" | "WARN" | "ERROR";
  message: string;
  context?: string;
  metadata?: any;
  createdAt: string;
}

interface GenerationLog {
  id: string;
  status: "PENDING" | "GENERATING" | "COMPLETED" | "FAILED" | "TIMEOUT";
  topic: { title: string };
  jobId?: string;
  language?: string;
  difficulty?: string;
  duration?: number;
  error?: string;
  createdAt: string;
  completedAt?: string;
}

interface Meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function LogsPage() {
  const [activeTab, setActiveTab] = useState("system");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">System Logs</h1>
      </div>

      <Tabs defaultValue="system" className="w-full" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="system">System Logs</TabsTrigger>
          <TabsTrigger value="ai-queue">AI Queue</TabsTrigger>
        </TabsList>
        <TabsContent value="system" className="mt-4">
           <SystemLogsTab isActive={activeTab === "system"} />
        </TabsContent>
        <TabsContent value="ai-queue" className="mt-4">
           <AiQueueTab isActive={activeTab === "ai-queue"} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SystemLogsTab({ isActive }: { isActive: boolean }) {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [level, setLevel] = useState("ALL");

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await apiClient<{ data: SystemLog[]; meta: Meta }>(
        `/system-logs?page=${page}&limit=20&level=${level}`
      );
      setLogs(data.data);
      // Backend actually returns { data, total, page, limit, totalPages } directly, not nested in data.meta or similar depending on implementation
      // Let's check service: returns { data, total, page, limit, totalPages }
      // So apiClient returns that object directly.
      setMeta(data as any); 
      setLogs((data as any).data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isActive) {
      fetchLogs();
    }
  }, [isActive, page, level]);

  const getLevelColor = (level: string) => {
    switch (level) {
      case "ERROR": return "destructive";
      case "WARN": return "secondary"; // orange if customized
      default: return "secondary"; // or "default"
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
                <TableHead className="w-[100px]">Level</TableHead>
                <TableHead>Message</TableHead>
                <TableHead className="w-[200px]">Context</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
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
                  <TableRow key={log.id}>
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
         {/* Pagination */}
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

function AiQueueTab({ isActive }: { isActive: boolean }) {
  const [logs, setLogs] = useState<GenerationLog[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
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
    if (isActive) {
      fetchLogs();
    }
  }, [isActive, page, status]);

  const getStatusColor = (status: string) => {
      switch (status) {
          case 'COMPLETED': return 'default'; // primary
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
                  <TableRow key={log.id}>
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
         {/* Pagination */}
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
