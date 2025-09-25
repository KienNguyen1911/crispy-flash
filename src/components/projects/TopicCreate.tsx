'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { TopicForm } from '@/components/topics/TopicForm';
import { useContext } from 'react';
import { TopicContext } from '@/context/TopicContext';
import { useRouter } from 'next/navigation';

export default function TopicCreate({ projectId, onTopicCreated }: { projectId: string; onTopicCreated?: () => void }) {
  const { addTopic } = useContext(TopicContext);
  const router = useRouter();

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
        <TopicForm
          onSubmit={async (data) => {
            await addTopic(projectId, data);
            onTopicCreated?.();
            // refresh server-rendered data so the new topic appears immediately
            try { router.refresh(); } catch (e) { /* noop */ }
          }}
          submitButtonText="Create Topic"
        />
      </DialogContent>
    </Dialog>
  );
}
