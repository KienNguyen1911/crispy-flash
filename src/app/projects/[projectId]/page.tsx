import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import TopicCreate from '@/components/projects/TopicCreate';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { PlusCircle, BrainCircuit } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { TopicForm } from '@/components/topics/TopicForm';

export default async function ProjectPage({ params }: { params: { projectId: string } }) {
  const projectId = params.projectId;

  const projectRaw = await prisma.project.findUnique({
    where: { id: projectId },
    include: { topics: { include: { vocabulary: true } } },
  });

  if (!projectRaw) return notFound();

  const project = {
    id: projectRaw.id,
    name: projectRaw.title ?? projectRaw.name ?? '',
    description: projectRaw.description ?? '',
    topics: (projectRaw.topics ?? []).map((t: any) => ({ ...t })),
  };

  const totalWords = project.topics.reduce((acc, topic) => acc + (topic.vocabulary?.length ?? 0), 0);

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
        <h1 className="text-3xl font-bold font-headline">{project.name}</h1>
        <p className="text-lg text-muted-foreground mt-1">{project.description}</p>
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

      {project.topics.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {project.topics.map((topic) => (
            <Link href={`/projects/${projectId}/topics/${topic.id}`} key={topic.id} passHref>
              <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-300 cursor-pointer">
                <CardHeader>
                  <CardTitle className="font-headline">{topic.title}</CardTitle>
                  <CardDescription>{topic.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{topic.vocabulary.length} word(s)</p>
                </CardContent>
              </Card>
            </Link>
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
