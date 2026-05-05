'use client';

import React, { useState, useRef, useEffect, useReducer } from 'react';
import { Check, X } from 'lucide-react';
import { mutate } from 'swr';
import { updateTopic } from '@/services/topics-api';
import { toast } from 'sonner';

interface EditorState {
  title: string;
  description: string;
  editing: boolean;
  saving: boolean;
}

type EditorAction = 
  | { type: 'SET_TITLE'; payload: string }
  | { type: 'SET_DESCRIPTION'; payload: string }
  | { type: 'SET_EDITING'; payload: boolean }
  | { type: 'SET_SAVING'; payload: boolean }
  | { type: 'SYNC_TOPIC'; payload: { title: string; description: string } }
  | { type: 'RESET_TO_TOPIC'; payload: { title: string; description: string } };

const editorReducer = (state: EditorState, action: EditorAction): EditorState => {
  switch (action.type) {
    case 'SET_TITLE':
      return { ...state, title: action.payload };
    case 'SET_DESCRIPTION':
      return { ...state, description: action.payload };
    case 'SET_EDITING':
      return { ...state, editing: action.payload };
    case 'SET_SAVING':
      return { ...state, saving: action.payload };
    case 'SYNC_TOPIC':
      return { ...state, title: action.payload.title, description: action.payload.description };
    case 'RESET_TO_TOPIC':
      return { ...state, title: action.payload.title, description: action.payload.description, editing: false };
    default:
      return state;
  }
};

export default function TopicHeaderEditor({ projectId, topic }: { projectId: string; topic: { id: string; title: string; description?: string } }) {
  const [state, dispatch] = useReducer(editorReducer, {
    title: '',
    description: '',
    editing: false,
    saving: false
  });
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    dispatch({ type: 'SYNC_TOPIC', payload: { title: topic.title, description: topic.description ?? '' } });
  }, [topic.id]);

  const isDirty = state.title !== (topic.title ?? '') || state.description !== (topic.description ?? '');

  const save = async () => {
    const nextTitle = state.title.trim();
    const nextDescription = state.description.trim();

    if (!nextTitle) {
      toast.error('Topic title cannot be empty.');
      return;
    }

    if (!isDirty) {
      dispatch({ type: 'SET_EDITING', payload: false });
      return;
    }

    dispatch({ type: 'SET_SAVING', payload: true });
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
      toast.success('Topic updated successfully!');
      dispatch({ type: 'SET_EDITING', payload: false });
    } catch (error) {
      console.error('Failed to update topic:', error);
      toast.error('Failed to update topic.');
      // Revert changes on error
      dispatch({ type: 'RESET_TO_TOPIC', payload: { title: topic.title, description: topic.description ?? '' } });
    } finally {
      dispatch({ type: 'SET_SAVING', payload: false });
    }
  };

  useEffect(() => {
    if (!state.editing) return;
    const handlePointerDown = (e: PointerEvent) => {
      if (!containerRef.current) return;
      const target = e.target as Node;
      if (!containerRef.current.contains(target)) {
        dispatch({ type: 'RESET_TO_TOPIC', payload: { title: topic.title, description: topic.description ?? '' } });
      }
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [state.editing, topic.title, topic.description]);

  return (
    <div className="relative" ref={containerRef}>
      <div className={`group rounded-md p-2 transition-all ${state.editing ? 'ring-2 ring-primary/50' : 'hover:ring-1 hover:ring-primary/20'}`}>
        <div>
          {state.editing ? (
            <input className="text-3xl font-bold font-headline w-full bg-transparent outline-none" value={state.title} onChange={(e) => dispatch({ type: 'SET_TITLE', payload: e.target.value })} />
          ) : (
            <h1 onClick={() => dispatch({ type: 'SET_EDITING', payload: true })} className="text-3xl font-bold font-headline cursor-text">{topic.title}</h1>
          )}
          {state.editing ? (
            <textarea className="text-lg text-muted-foreground w-full mt-1 bg-transparent outline-none" value={state.description} onChange={(e) => dispatch({ type: 'SET_DESCRIPTION', payload: e.target.value })} />
          ) : (
            <p onClick={() => dispatch({ type: 'SET_EDITING', payload: true })} className="text-lg text-muted-foreground mt-1 cursor-text">{topic.description ?? ''}</p>
          )}
        </div>
      </div>

      {state.editing && (
        <div className="absolute right-6 -top-3 z-30 flex items-center gap-1 bg-white/90 dark:bg-slate-900/80 rounded-md p-1 shadow">
          <button title="Cancel" aria-label="Cancel" className="p-1 rounded text-muted-foreground hover:bg-muted" onClick={() => dispatch({ type: 'RESET_TO_TOPIC', payload: { title: topic.title, description: topic.description ?? '' } })}>
            <X className="h-4 w-4" />
          </button>
          <button title="Save" aria-label="Save" className="p-1 rounded text-primary hover:bg-primary/10" onClick={save} disabled={!isDirty || state.saving}>
            <Check className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
