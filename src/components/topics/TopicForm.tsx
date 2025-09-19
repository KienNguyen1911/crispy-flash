'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { Topic } from '@/lib/types';
import { DialogClose } from '../ui/dialog';

const formSchema = z.object({
  title: z.string().min(1, 'Topic title is required.'),
  description: z.string().min(1, 'Description is required.'),
});

type TopicFormValues = z.infer<typeof formSchema>;

interface TopicFormProps {
  topic?: Topic;
  onSubmit: (data: Omit<Topic, 'id' | 'projectId' | 'vocabulary'> | (Partial<Topic> & { id: string })) => void;
  submitButtonText?: string;
}

export function TopicForm({ topic, onSubmit, submitButtonText = 'Save' }: TopicFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<TopicFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: topic?.title ?? '',
      description: topic?.description ?? '',
    },
  });

  const handleSubmit = (data: TopicFormValues) => {
    setIsSubmitting(true);
    if (topic) {
        onSubmit({ ...data, id: topic.id });
    } else {
        onSubmit(data);
    }
    setIsSubmitting(false);
    document.getElementById('closeDialog')?.click();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Topic Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Basic Kanji" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Describe this topic..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2">
            <DialogClose asChild>
                <Button id="closeDialog" variant="ghost">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : submitButtonText}
            </Button>
        </div>
      </form>
    </Form>
  );
}
