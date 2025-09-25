import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import TopicCreate from "@/components/projects/TopicCreate";
import ProjectHeaderEditor from "@/components/projects/ProjectHeaderEditor";
import TopicCardClient from "@/components/projects/TopicCardClient";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { BrainCircuit } from "lucide-react";

export default async function ProjectPage({
  params
}: {
  params: { projectId: string };
}) {
  const { projectId } = (await params) as { projectId: string };

  const projectRaw = await prisma.project.findUnique({
    where: { id: projectId },
    include: {}
  });

  if (!projectRaw) return notFound();

  const project = {
    id: projectRaw.id,
    name: projectRaw.title ?? "",
    description: projectRaw.description ?? ""
  };

  // fetch topics for this project with per-topic vocabulary counts
  const topicsRaw = await prisma.topic.findMany({
    where: { projectId },
    select: {
      id: true,
      title: true,
      createdAt: true,
      _count: {
        select: {
          vocabulary: true
        }
      }
    }
  });

  const topics = topicsRaw.map((t: any) => ({
    id: t.id,
    title: t.title,
    description: "",
    vocabularyCount: (t as any)._count?.vocabulary ?? 0
  }));

  const totalWords = topics.reduce(
    (acc, t) => acc + (t.vocabularyCount ?? 0),
    0
  );

  return (
    <div className="container mx-auto max-w-5xl py-8 px-4">
      <Breadcrumb className="mb-8">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Projects</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{project.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mb-8">
        <ProjectHeaderEditor project={project} />
      </div>

      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-semibold font-headline">Topics</h2>
        <div className="flex gap-2">
          <Button variant="outline" disabled={totalWords === 0}>
            <BrainCircuit className="mr-2 h-4 w-4" />
            Learn All
          </Button>
          {/* TopicCreate is a client component that uses AppDataContext to add topics */}
          <TopicCreate projectId={projectId} />
        </div>
      </div>

      {topics.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topics.map((topic) => (
            <div key={topic.id}>
              <TopicCardClient projectId={projectId} topic={topic} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border-2 border-dashed rounded-lg">
          <h2 className="text-xl font-semibold">No Topics Yet</h2>
          <p className="text-muted-foreground mt-2">
            Create a topic to start adding vocabulary.
          </p>
        </div>
      )}
    </div>
  );
}
