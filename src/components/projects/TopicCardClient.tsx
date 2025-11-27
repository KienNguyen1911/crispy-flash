"use client";

import React, { useContext, useState, useRef, useEffect } from "react";
import Link from "next/link";
import type { Project } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Trash2, ArrowRight } from "lucide-react";
import { Check, X } from "lucide-react";
import { TopicContext } from "@/context/TopicContext";
import { Progress } from "@/components/ui/progress";

export default function TopicCardClient({
  projectId,
  topic,
  onTopicUpdated,
  onTopicDeleted,
  onMoveClick
}: {
  projectId: string;
  topic: any;
  onTopicUpdated?: () => void;
  onTopicDeleted?: () => void;
  onMoveClick?: (topicId: string, topicTitle: string) => void;
}) {
  const { deleteTopic } = useContext(TopicContext);
  const { updateTopic } = useContext(TopicContext) as any;
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(topic.title);
  const [description, setDescription] = useState(topic.description ?? "");
  const [saving, setSaving] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const isDirty =
    title !== topic.title || description !== (topic.description ?? "");

  const save = async () => {
    if (!isDirty) {
      setEditing(false);
      return;
    }
    try {
      setSaving(true);
      await updateTopic(projectId, topic.id, { title, description });
      onTopicUpdated?.();
      setEditing(false);
    } catch (e) {
      // context handles toasts
    } finally {
      setSaving(false);
    }
  };

  // Click outside to cancel editing and revert
  useEffect(() => {
    if (!editing) return;
    const handlePointerDown = (e: PointerEvent) => {
      if (!containerRef.current) return;
      const target = e.target as Node;
      if (!containerRef.current.contains(target)) {
        setTitle(topic.title);
        setDescription(topic.description ?? "");
        setEditing(false);
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [editing, topic.title, topic.description]);

  return (
    <Card
      ref={containerRef}
      className="relative h-full flex flex-col hover:shadow-lg hover:scale-105 transition-all duration-300"
    >
      <CardHeader>
        <div>
          {editing ? (
            <input
              className="text-xl font-headline w-full bg-transparent outline-none"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          ) : (
            <CardTitle
              className="font-headline cursor-text"
              onClick={() => setEditing(true)}
            >
              {topic.title}
            </CardTitle>
          )}
          {editing ? (
            <textarea
              className="text-sm md:text-base text-muted-foreground w-full mt-1 bg-transparent outline-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          ) : (
            <CardDescription onClick={() => setEditing(true)}>
              {topic.description}
            </CardDescription>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-sm md:text-base text-muted-foreground">
          {topic.vocabularyCount } word(s), {topic.learnedCount} learned
        </p>
        <Progress
          value={(topic.learnedCount / topic.vocabularyCount) * 100}
          className="mt-2"
        />
      </CardContent>

      {/* Delete button top-right */}
      <div className="absolute top-2 right-2 z-20 flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
          onClick={() => onMoveClick?.(topic.id, topic.title)}
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="sm" className="text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete topic?</AlertDialogTitle>
            </AlertDialogHeader>
            <p>
              Are you sure you want to permanently delete the topic "
              {topic.title}" and its vocabulary? This action cannot be undone.
            </p>
            <div className="mt-4 flex justify-center gap-2">
              <AlertDialogCancel asChild>
                <Button variant="outline" className="mt-0">Cancel</Button>
              </AlertDialogCancel>
              <AlertDialogAction asChild>
                <Button
                  variant="destructive"
                  onClick={async () => {
                    try {
                      await deleteTopic(projectId, topic.id);
                      onTopicDeleted?.();
                    } catch (e) {
                      /* ignore */
                    }
                  }}
                >
                  Delete
                </Button>
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
        {/* Legend-style icon buttons when editing */}
        {editing && (
          <div className="ml-2 bg-white/90 dark:bg-slate-900/80 rounded-md p-1 shadow flex items-center gap-1">
            <button
              title="Cancel"
              aria-label="Cancel"
              className="p-1 rounded text-muted-foreground hover:bg-muted"
              onClick={() => {
                setEditing(false);
                setTitle(topic.title);
                setDescription(topic.description ?? "");
              }}
            >
              <X className="h-4 w-4" />
            </button>
            <button
              title="Save"
              aria-label="Save"
              className="p-1 rounded text-primary hover:bg-primary/10"
              onClick={save}
              disabled={!isDirty || saving}
            >
              <Check className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Full-card overlay link (under delete button) - disable while editing */}
      {!editing && (
        <Link
          href={`/projects/${projectId}/topics/${topic.id}`}
          className="absolute inset-0 z-10"
          aria-hidden
        />
      )}
    </Card>
  );
}