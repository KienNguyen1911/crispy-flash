'use client';

import { useState, useContext, useRef, useEffect, useReducer } from 'react';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { Project } from '@/lib/types';
import { ProjectContext } from '@/context/ProjectContext';
import { mutate } from 'swr';
import { apiUrl } from '@/lib/api';

interface EditorState {
  name: string;
  description: string;
  editing: boolean;
  saving: boolean;
}

type EditorAction = 
  | { type: 'SET_NAME'; payload: string }
  | { type: 'SET_DESCRIPTION'; payload: string }
  | { type: 'SET_EDITING'; payload: boolean }
  | { type: 'SET_SAVING'; payload: boolean }
  | { type: 'SYNC_PROJECT'; payload: { name: string; description: string } }
  | { type: 'RESET_TO_PROJECT'; payload: { name: string; description: string } };

const editorReducer = (state: EditorState, action: EditorAction): EditorState => {
  switch (action.type) {
    case 'SET_NAME':
      return { ...state, name: action.payload };
    case 'SET_DESCRIPTION':
      return { ...state, description: action.payload };
    case 'SET_EDITING':
      return { ...state, editing: action.payload };
    case 'SET_SAVING':
      return { ...state, saving: action.payload };
    case 'SYNC_PROJECT':
      return { ...state, name: action.payload.name, description: action.payload.description };
    case 'RESET_TO_PROJECT':
      return { ...state, name: action.payload.name, description: action.payload.description, editing: false };
    default:
      return state;
  }
};

export default function ProjectHeaderEditor({ project }: { project: { id: string; name: string; description: string } }) {
  const { updateProject } = useContext(ProjectContext);
  const [state, dispatch] = useReducer(editorReducer, {
    name: '',
    description: '',
    editing: false,
    saving: false
  });
  const optimisticProjectRef = useRef<{ name: string; description: string } | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const isDirty = state.name !== (project.name ?? '') || state.description !== (project.description ?? '');
  
  // Sync state with prop changes
  useEffect(() => {
    dispatch({ type: 'SYNC_PROJECT', payload: { name: project.name, description: project.description ?? '' } });
  }, [project.id]);

  const save = () => {
    if (!isDirty) { dispatch({ type: 'SET_EDITING', payload: false }); return; }

    // Create optimistic update - immediately show new data
    const optimisticData = { name: state.name, description: state.description };
    optimisticProjectRef.current = optimisticData;
    dispatch({ type: 'SET_EDITING', payload: false });

    // Run API update in background
    (async () => {
      try {
        dispatch({ type: 'SET_SAVING', payload: true });
        await updateProject(project.id, { name: state.name, description: state.description });
        // Revalidate the project data in SWR cache
        await mutate(apiUrl(`/api/projects/${project.id}`));
        // Clear optimistic data once API completes successfully
        optimisticProjectRef.current = null;
      } catch (e) {
        // On error, revert to original data
        optimisticProjectRef.current = null;
        dispatch({ type: 'RESET_TO_PROJECT', payload: { name: project.name, description: project.description ?? '' } });
        // updateProject will surface toasts
      } finally {
        dispatch({ type: 'SET_SAVING', payload: false });
      }
    })();
  };


  // Click outside to cancel editing and revert
  useEffect(() => {
    if (!state.editing) return;
    const handlePointerDown = (e: PointerEvent) => {
      if (!containerRef.current) return;
      const target = e.target as Node;
      if (!containerRef.current.contains(target)) {
        // revert
        dispatch({ type: 'RESET_TO_PROJECT', payload: { name: project.name, description: project.description ?? '' } });
      }
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [state.editing, project.name, project.description]);

  // Use optimistic data if available, otherwise use current state or project data
  const displayName = optimisticProjectRef.current ? optimisticProjectRef.current.name : (state.editing ? state.name : project.name);
  const displayDescription = optimisticProjectRef.current ? optimisticProjectRef.current.description : (state.editing ? state.description : (project.description ?? ''));

  return (
    <div className="relative" ref={containerRef}>
      <div className={`group rounded-md p-2 transition-all ${state.editing ? 'ring-2 ring-primary/50' : 'hover:ring-1 hover:ring-primary/20'}`}>
        <div>
          {state.editing ? (
            <input className="text-3xl font-bold font-headline w-full bg-transparent outline-none" value={state.name} onChange={(e) => dispatch({ type: 'SET_NAME', payload: e.target.value })} />
          ) : (
            <h1 onClick={() => dispatch({ type: 'SET_EDITING', payload: true })} onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                dispatch({ type: 'SET_EDITING', payload: true });
              }
            }} role="button" tabIndex={0} className="text-3xl font-bold font-headline cursor-text">{displayName}</h1>
          )}
          {state.editing ? (
            <textarea className="text-lg text-muted-foreground w-full mt-1 bg-transparent outline-none" value={state.description} onChange={(e) => dispatch({ type: 'SET_DESCRIPTION', payload: e.target.value })} />
          ) : (
            <p onClick={() => dispatch({ type: 'SET_EDITING', payload: true })} onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                dispatch({ type: 'SET_EDITING', payload: true });
              }
            }} role="button" tabIndex={0} className="text-lg text-muted-foreground mt-1 cursor-text">{displayDescription}</p>
          )}
        </div>
      </div>

      {/* Save button attached to outline top-right */}
      {state.editing && (
        <div className="absolute right-4 -top-3 z-30 flex items-center gap-1 bg-white/90 dark:bg-slate-900/80 rounded-md p-1 shadow">
          <button title="Cancel" aria-label="Cancel" className="p-1 rounded text-muted-foreground hover:bg-muted" onClick={() => dispatch({ type: 'RESET_TO_PROJECT', payload: { name: project.name, description: project.description ?? '' } })}>
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