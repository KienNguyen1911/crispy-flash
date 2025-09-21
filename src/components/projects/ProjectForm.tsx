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
import type { Project } from '@/lib/types';
import { DialogClose } from '../ui/dialog';

const formSchema = z.object({
  name: z.string().min(1, 'Project name is required.'),
  description: z.string().min(1, 'Description is required.'),
});

type ProjectFormValues = z.infer<typeof formSchema>;

interface ProjectFormProps {
  project?: Project;
  onSubmit: (data: Omit<Project, 'id' | 'topics'> | (Partial<Project> & { id: string })) => boolean | Promise<boolean> | void;
  submitButtonText?: string;
}

export function ProjectForm({ project, onSubmit, submitButtonText = 'Save' }: ProjectFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: project?.name ?? '',
      description: project?.description ?? '',
    },
  });
  
  const handleSubmit = async (data: ProjectFormValues) => {
    setIsSubmitting(true);
    try {
      let success = true;
      const run = (payload: any) => {
        try {
          return onSubmit(payload);
        } catch (e) {
          return undefined;
        }
      };

      const ret = project ? run({ ...data, id: project.id }) : run(data);

      // if ret is a thenable, await it
      if (ret && typeof (ret as any).then === 'function') {
        const awaited = await (ret as Promise<any>);
        if (typeof awaited === 'boolean') success = awaited;
      } else if (typeof ret === 'boolean') {
        success = ret;
      }

      if (success) {
        // This allows the dialog to close on submit
        document.getElementById('closeDialog')?.click();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., JLPT N5 Prep" {...field} />
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
                <Textarea placeholder="Describe your project..." {...field} />
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
