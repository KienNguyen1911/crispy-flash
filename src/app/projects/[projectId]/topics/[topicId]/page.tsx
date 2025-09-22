import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import TopicViewer from '@/components/topics/TopicViewer';
import { Suspense } from 'react';

export default async function TopicPage({ params }: { params: { projectId: string; topicId: string } }) {
  const { projectId, topicId } = (await params) as { projectId: string; topicId: string };

  const projectRaw = await prisma.project.findUnique({
    where: { id: projectId },
    include: { topics: { include: { vocabulary: true } } },
  });

  if (!projectRaw) return notFound();

  const topicRaw = (projectRaw.topics ?? []).find(t => t.id === topicId);
  if (!topicRaw) return notFound();

  const project = { id: projectRaw.id, name: projectRaw.title ?? '', description: projectRaw.description ?? '' };
  const topic = { ...topicRaw };

  return <>
    <TopicViewer projectId={projectId} topic={topic} projectName={project.name} />
  </>;
}
