'use client';

import React, { useState, useContext, useRef, useEffect } from 'react';
import { Check, X } from 'lucide-react';
import { TopicContext } from '@/context/TopicContext';
import { mutate } from 'swr';
import { apiUrl } from '@/lib/api';

export default function TopicHeaderEditor({ projectId, topic }: { projectId: string; topic: { id: string; title: string; description?: string } }) {
  const { updateTopic } = useContext(TopicContext) as any;
  const [title, setTitle] = useState(topic.title);
  const [description, setDescription] = useState(topic.description ?? '');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [optimisticTopic, setOptimisticTopic] = useState<{ title: string; description: string } | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const isDirty = title !== (topic.title ?? '') || description !== (topic.description ?? '');

  const save = () => {
    if (!isDirty) { setEditing(false); return; }

    // Create optimistic update - immediately show new data
    const optimisticData = { title, description };
    setOptimisticTopic(optimisticData);
    setEditing(false);

    // Run API update in background
    (async () => {
      try {
        setSaving(true);
        await updateTopic(projectId, topic.id, { title, description });
        // Revalidate the topic data in SWR cache
        await mutate(apiUrl(`/projects/${projectId}/topics/${topic.id}`));
        // Clear optimistic data once API completes successfully
        setOptimisticTopic(null);
      } catch (e) {
        // On error, revert to original data
        setOptimisticTopic(null);
        setTitle(topic.title);
        setDescription(topic.description ?? '');
        // TopicContext handles toasts
      } finally {
        setSaving(false);
      }
    })();
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

  // Use optimistic data if available, otherwise use current state or topic data
  const displayTitle = optimisticTopic ? optimisticTopic.title : (editing ? title : topic.title);
  const displayDescription = optimisticTopic ? optimisticTopic.description : (editing ? description : (topic.description ?? ''));

  return (
    <div className="relative" ref={containerRef}>
      <div className={`group rounded-md p-2 transition-all ${editing ? 'ring-2 ring-primary/50' : 'hover:ring-1 hover:ring-primary/20'}`}>
        <div>
          {editing ? (
            <input className="text-3xl font-bold font-headline w-full bg-transparent outline-none" value={title} onChange={(e) => setTitle(e.target.value)} />
          ) : (
            <h1 onClick={() => setEditing(true)} className="text-3xl font-bold font-headline cursor-text">{displayTitle}</h1>
          )}
          {editing ? (
            <textarea className="text-lg text-muted-foreground w-full mt-1 bg-transparent outline-none" value={description} onChange={(e) => setDescription(e.target.value)} />
          ) : (
            <p onClick={() => setEditing(true)} className="text-lg text-muted-foreground mt-1 cursor-text">{displayDescription}</p>
          )}
        </div>
      </div>

      {editing && (
        <div className="absolute right-6 -top-3 z-30 flex items-center gap-1 bg-white/90 dark:bg-slate-900/80 rounded-md p-1 shadow">
          <button title="Cancel" aria-label="Cancel" className="p-1 rounded text-muted-foreground hover:bg-muted" onClick={() => { setEditing(false); setTitle(topic.title); setDescription(topic.description ?? ''); }}>
            <X className="h-4 w-4" />
          </button>
          <button title="Save" aria-label="Save" className="p-1 rounded text-primary hover:bg-primary/10" onClick={save} disabled={!isDirty || saving}>
            <Check className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
