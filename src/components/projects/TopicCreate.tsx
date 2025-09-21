'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { TopicForm } from '@/components/topics/TopicForm';
import { useContext } from 'react';
import { AppDataContext } from '@/context/AppDataContext';

export default function TopicCreate({ projectId }: { projectId: string }) {
  const { addTopic } = useContext(AppDataContext);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Topic
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a New Topic</DialogTitle>
        </DialogHeader>
        <TopicForm onSubmit={(data) => addTopic(projectId, data)} submitButtonText="Create Topic" />
      </DialogContent>
    </Dialog>
  );
}
