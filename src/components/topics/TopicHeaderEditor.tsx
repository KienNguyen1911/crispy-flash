'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Check, X } from 'lucide-react';
import { mutate } from 'swr';
import { updateTopicHeader } from '@/services/topics-vocabularies-api';
import { toast } from 'sonner';

export default function TopicHeaderEditor({ projectId, topic }: { projectId: string; topic: { id: string; title: string; description?: string } }) {
  const [title, setTitle] = useState(topic.title);
  const [description, setDescription] = useState(topic.description ?? '');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);


  const isDirty = title !== (topic.title ?? '') || description !== (topic.description ?? '');

  const save = async () => {
    if (!isDirty) {
      setEditing(false);
      return;
    }

    setSaving(true);
    try {
      const updatedTopic = await updateTopicHeader(projectId, topic.id, { title, description });
      mutate(`/api/projects/${projectId}/topics/${topic.id}`, updatedTopic, false);
      toast.success('Topic updated successfully!');
      setEditing(false);
    } catch (error) {
      console.error('Failed to update topic:', error);
      toast.error('Failed to update topic.');
      // Revert changes on error
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

  return (
    <div className="relative" ref={containerRef}>
      <div className={`group rounded-md p-2 transition-all ${editing ? 'ring-2 ring-primary/50' : 'hover:ring-1 hover:ring-primary/20'}`}>
        <div>
          {editing ? (
            <input className="text-3xl font-bold font-headline w-full bg-transparent outline-none" value={title} onChange={(e) => setTitle(e.target.value)} />
          ) : (
            <h1 onClick={() => setEditing(true)} className="text-3xl font-bold font-headline cursor-text">{topic.title}</h1>
          )}
          {editing ? (
            <textarea className="text-lg text-muted-foreground w-full mt-1 bg-transparent outline-none" value={description} onChange={(e) => setDescription(e.target.value)} />
          ) : (
            <p onClick={() => setEditing(true)} className="text-lg text-muted-foreground mt-1 cursor-text">{topic.description ?? ''}</p>
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