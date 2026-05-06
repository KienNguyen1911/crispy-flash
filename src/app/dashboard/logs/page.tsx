import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SystemLogsTab } from "./system-logs-tab";
import { AiQueueTab } from "./ai-queue-tab";

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

async function fetchSystemLogs(page: number = 1, level: string = "ALL"): Promise<{ data: SystemLog[]; meta: Meta }> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE}/system-logs?page=${page}&limit=20&level=${level}`,
      { cache: 'no-store' }
    );
    if (!res.ok) return { data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } };
    return res.json();
  } catch (error) {
    console.error('Failed to fetch system logs:', error);
    return { data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } };
  }
}

async function fetchGenerationLogs(page: number = 1, status: string = "ALL"): Promise<{ data: GenerationLog[]; meta: Meta }> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE}/system-logs/generation?page=${page}&limit=20&status=${status}`,
      { cache: 'no-store' }
    );
    if (!res.ok) return { data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } };
    return res.json();
  } catch (error) {
    console.error('Failed to fetch generation logs:', error);
    return { data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } };
  }
}

export default async function LogsPage() {
  const [systemLogsData, generationLogsData] = await Promise.all([
    fetchSystemLogs(),
    fetchGenerationLogs()
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">System Logs</h1>
      </div>

      <Tabs defaultValue="system" className="w-full">
        <TabsList>
          <TabsTrigger value="system">System Logs</TabsTrigger>
          <TabsTrigger value="ai-queue">AI Queue</TabsTrigger>
        </TabsList>
        <TabsContent value="system" className="mt-4">
           <SystemLogsTab initialData={systemLogsData} />
        </TabsContent>
        <TabsContent value="ai-queue" className="mt-4">
           <AiQueueTab initialData={generationLogsData} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
