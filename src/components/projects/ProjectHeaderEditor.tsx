'use client';

import React, { useState, useContext, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { Project } from '@/lib/types';
import { ProjectContext } from '@/context/ProjectContext';

export default function ProjectHeaderEditor({ project }: { project: { id: string; name: string; description: string } }) {
  const { updateProject } = useContext(ProjectContext);
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description ?? '');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const isDirty = name !== (project.name ?? '') || description !== (project.description ?? '');

  const save = async () => {
    if (!isDirty) { setEditing(false); return; }
    try {
      setSaving(true);
      await updateProject(project.id, { name, description });
      setEditing(false);
    } catch (e) {
      // updateProject will surface toasts; nothing else here
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
        // revert
        setName(project.name);
        setDescription(project.description ?? '');
        setEditing(false);
      }
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [editing, project.name, project.description]);

  return (
    <div className="relative" ref={containerRef}>
      <div className={`group rounded-md p-2 transition-all ${editing ? 'ring-2 ring-primary/50' : 'hover:ring-1 hover:ring-primary/20'}`}>
        <div>
          {editing ? (
            <input className="text-3xl font-bold font-headline w-full bg-transparent outline-none" value={name} onChange={(e) => setName(e.target.value)} />
          ) : (
            <h1 onClick={() => setEditing(true)} className="text-3xl font-bold font-headline cursor-text">{name}</h1>
          )}
          {editing ? (
            <textarea className="text-lg text-muted-foreground w-full mt-1 bg-transparent outline-none" value={description} onChange={(e) => setDescription(e.target.value)} />
          ) : (
            <p onClick={() => setEditing(true)} className="text-lg text-muted-foreground mt-1 cursor-text">{description}</p>
          )}
        </div>
      </div>

      {/* Save button attached to outline top-right */}
      {editing && (
        <div className="absolute right-4 -top-3 z-30 flex items-center gap-1 bg-white/90 dark:bg-slate-900/80 rounded-md p-1 shadow">
          <button title="Cancel" aria-label="Cancel" className="p-1 rounded text-muted-foreground hover:bg-muted" onClick={() => { setEditing(false); setName(project.name); setDescription(project.description ?? ''); }}>
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
