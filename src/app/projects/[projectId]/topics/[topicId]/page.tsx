import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import TopicViewer from '@/components/topics/TopicViewer';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { BrainCircuit, Upload, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { Vocabulary } from '@/lib/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';


export default async function TopicPage({ params }: { params: { projectId: string; topicId: string } }) {
  const { projectId, topicId } = params;

  const projectRaw = await prisma.project.findUnique({
    where: { id: projectId },
    include: { topics: { include: { vocabulary: true } } },
  });

  if (!projectRaw) return notFound();

  const topicRaw = (projectRaw.topics ?? []).find(t => t.id === topicId);
  if (!topicRaw) return notFound();

  const project = { id: projectRaw.id, name: projectRaw.title ?? projectRaw.name ?? '', description: projectRaw.description ?? '' };
  const topic = { ...topicRaw };

  return <TopicViewer projectId={projectId} topic={topic} projectName={project.name} />;
}
