'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Check, X } from 'lucide-react';
import { mutate } from 'swr';
import { updateTopic } from '@/services/topics-api';
import { toast } from 'sonner';

export default function TopicHeaderEditor({ projectId, topic }: { projectId: string; topic: { id: string; title: string; description?: string } }) {
  const [title, setTitle] = useState(topic.title);
  const [description, setDescription] = useState(topic.description ?? '');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [optimisticTopic, setOptimisticTopic] = useState<{ title: string; description: string } | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);


  const isDirty = title !== (topic.title ?? '') || description !== (topic.description ?? '');

  useEffect(() => {
    setTitle(topic.title);
    setDescription(topic.description ?? '');
  }, [topic.title, topic.description]);

  const save = async () => {
    const nextTitle = title.trim();
    const nextDescription = description.trim();

    if (!nextTitle) {
      toast.error('Topic title cannot be empty.');
      return;
    }

    if (!isDirty) {
      setEditing(false);
      return;
    }

    const optimisticData = {
      title: nextTitle,
      description: nextDescription
    };
    setOptimisticTopic(optimisticData);
    setEditing(false);
    setSaving(true);
    try {
      const updatedTopic = await updateTopic(topic.id, {
        title: nextTitle,
        description: nextDescription
      });
      await mutate(
        `/api/topics/${topic.id}`,
        (currentTopic?: {
          id: string;
          title: string;
          description?: string;
          vocabulary?: unknown[];
        }) => {
          if (!currentTopic) {
            return updatedTopic;
          }

          return {
            ...currentTopic,
            ...updatedTopic,
            vocabulary: currentTopic.vocabulary ?? []
          };
        },
        false
      );
      await mutate(`/api/topics/${topic.id}`);
      await mutate(`/api/projects/${projectId}/topics`);
      setOptimisticTopic(null);
      toast.success('Topic updated successfully!');
    } catch (error) {
      console.error('Failed to update topic:', error);
      toast.error('Failed to update topic.');
      setOptimisticTopic(null);
      setTitle(topic.title);
      setDescription(topic.description ?? '');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (!editing) return;
    const handlePointerDown = (e: PointerEvent) => {
      if (!containerRef.current) return;
      const target = e.target as Node;
      if (!containerRef.current.contains(target)) {
        setTitle(topic.title);
        setDescription(topic.description ?? '');
        setEditing(false);
      }
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [editing, topic.title, topic.description]);

  const displayTitle = optimisticTopic ? optimisticTopic.title : (editing ? title : topic.title);
  const displayDescription = optimisticTopic
    ? optimisticTopic.description
    : (editing ? description : (topic.description ?? ''));

  return (
    <div className="relative" ref={containerRef}>
      <div className={`group rounded-[var(--neo-radius)] p-2 transition-all ${editing ? 'ring-2 ring-primary/50' : 'hover:ring-1 hover:ring-primary/20'}`}>
        <div>
          {editing ? (
            <input
              className="w-full rounded-[var(--neo-radius)] border-2 border-[var(--neo-line)] bg-black/20 px-2 py-1 text-3xl font-black font-headline text-white outline-none focus:border-cyan-400"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          ) : (
            <h1
              onClick={() => setEditing(true)}
              className="cursor-text text-3xl font-black font-headline text-white"
            >
              {displayTitle}
            </h1>
          )}
          {editing ? (
            <textarea
              className="mt-2 w-full rounded-[var(--neo-radius)] border-2 border-[var(--neo-line)] bg-black/20 px-2 py-1 text-lg text-muted-foreground outline-none focus:border-cyan-400"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          ) : (
            <p
              onClick={() => setEditing(true)}
              className="mt-1 cursor-text text-lg font-medium text-muted-foreground"
            >
              {displayDescription}
            </p>
          )}
        </div>
      </div>

      {editing && (
        <div className="absolute right-4 -top-3 z-30 flex items-center gap-1 rounded-[var(--neo-radius)] border-2 border-[var(--neo-line)] bg-[var(--neo-surface-raised)] p-1 shadow-[var(--neo-shadow-sm)]">
          <button title="Cancel" aria-label="Cancel" className="rounded p-1 text-muted-foreground hover:bg-muted" onClick={() => { setEditing(false); setTitle(topic.title); setDescription(topic.description ?? ''); }}>
            <X className="h-4 w-4" />
          </button>
          <button title="Save" aria-label="Save" className="rounded p-1 text-primary hover:bg-primary/10" onClick={save} disabled={!isDirty || saving}>
            <Check className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
