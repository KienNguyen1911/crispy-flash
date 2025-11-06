"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Topic } from "@/lib/types";

const formSchema = z.object({
  title: z
    .string()
    .min(1, "Topic title is required.")
    .max(100, "Title is too long."),
  description: z.string().max(500, "Description is too long.").nullable(),
});

type TopicFormValues = z.infer<typeof formSchema>;

interface TopicFormProps {
  topic?: Topic;
  // Use the validated form shape for onSubmit so title/description are always present.
  onSubmit: (
    data: TopicFormValues | (TopicFormValues & { id: string }),
  ) => void;
  submitButtonText?: string;
  onClose?: () => void;
}

export function TopicForm({
  topic,
  onSubmit,
  submitButtonText = "Save",
  onClose,
}: TopicFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<TopicFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: topic?.title ?? "",
      description: topic?.description ?? "",
    },
  });

  const handleSubmit = async (data: TopicFormValues) => {
    setIsSubmitting(true);
    try {
      if (topic) {
        await onSubmit({ ...data, id: topic.id });
      } else {
        await onSubmit(data);
      }
      form.reset();
      onClose?.();
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
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
                <Input placeholder="e.g., Basic Words" {...field} />
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
        <div className="flex justify-center gap-2">
          <Button className="w-full" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : submitButtonText}
          </Button>
        </div>
      </form>
    </Form>
  );
}
