'use client';

import { useContext } from 'react';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import { AppDataContext } from '@/context/AppDataContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProjectForm } from '@/components/projects/ProjectForm';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function Dashboard() {
  const { projects, addProject } = useContext(AppDataContext);

  return (
    <div className="container mx-auto max-w-5xl py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold font-headline">My Projects</h1>
          <p className="text-muted-foreground">
            Organize your vocabulary learning into projects.
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a New Project</DialogTitle>
            </DialogHeader>
            <ProjectForm
              onSubmit={addProject}
              submitButtonText="Create Project"
            />
          </DialogContent>
        </Dialog>
      </div>

      {projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link href={`/projects/${project.id}`} key={project.id} passHref>
              <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-300 cursor-pointer">
                <CardHeader>
                  <CardTitle className="font-headline">{project.name}</CardTitle>
                  <CardDescription>{project.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="text-sm text-muted-foreground">
                    <p>{project.topics.length} topic(s)</p>
                    <p>
                      {project.topics.reduce(
                        (acc, topic) => acc + topic.vocabulary.length,
                        0
                      )}{' '}
                      word(s)
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border-2 border-dashed rounded-lg">
          <h2 className="text-xl font-semibold">No Projects Yet</h2>
          <p className="text-muted-foreground mt-2">
            Click &quot;New Project&quot; to get started.
          </p>
        </div>
      )}
    </div>
  );
}
