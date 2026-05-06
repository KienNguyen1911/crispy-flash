"use client";

import React, { useContext, useState, useRef, useEffect, useReducer } from "react";
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

type EditState = {
  editing: boolean;
  title: string;
  description: string;
  saving: boolean;
};

const editReducer = (state: EditState, action: any): EditState => {
  switch (action.type) {
    case 'INIT':
      return { ...state, title: action.title, description: action.description };
    case 'SET_EDITING':
      return { ...state, editing: action.payload };
    case 'SET_TITLE':
      return { ...state, title: action.payload };
    case 'SET_DESCRIPTION':
      return { ...state, description: action.payload };
    case 'SET_SAVING':
      return { ...state, saving: action.payload };
    case 'RESET':
      return { ...state, title: action.title, description: action.description, editing: false };
    default:
      return state;
  }
};

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
  const [state, dispatch] = useReducer(editReducer, {
    editing: false,
    title: topic.title,
    description: topic.description ?? '',
    saving: false
  });
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    dispatch({ type: 'INIT', title: topic.title, description: topic.description ?? '' });
  }, [topic.id]);

  const isDirty =
    state.title !== topic.title || state.description !== (topic.description ?? "");

  const save = async () => {
    if (!isDirty) {
      dispatch({ type: 'SET_EDITING', payload: false });
      return;
    }
    try {
      dispatch({ type: 'SET_SAVING', payload: true });
      await updateTopic(projectId, topic.id, { title: state.title, description: state.description });
      onTopicUpdated?.();
      dispatch({ type: 'SET_EDITING', payload: false });
    } catch (e) {
      // context handles toasts
    } finally {
      dispatch({ type: 'SET_SAVING', payload: false });
    }
  };

  // Click outside to cancel editing and revert
  useEffect(() => {
    if (!state.editing) return;
    const handlePointerDown = (e: PointerEvent) => {
      if (!containerRef.current) return;
      const target = e.target as Node;
      if (!containerRef.current.contains(target)) {
        dispatch({ type: 'RESET', title: topic.title, description: topic.description ?? "" });
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [state.editing, topic.title, topic.description]);

  return (
    <Card
      ref={containerRef}
      className="group relative h-full flex flex-col bg-card/40 backdrop-blur-sm border-white/5 shadow-lg hover:shadow-glow hover:scale-[1.02] hover:border-primary/30 transition-all duration-300"
    >
      <CardHeader>
        <div>
          {state.editing ? (
            <input
              className="text-xl font-headline w-full bg-transparent outline-none"
              value={state.title}
              onChange={(e) => dispatch({ type: 'SET_TITLE', payload: e.target.value })}
            />
          ) : (
            <CardTitle
              className="font-headline cursor-text"
              onClick={() => dispatch({ type: 'SET_EDITING', payload: true })}
            >
              {topic.title}
            </CardTitle>
          )}
          {state.editing ? (
            <textarea
              className="text-sm md:text-base text-muted-foreground w-full mt-1 bg-transparent outline-none"
              value={state.description}
              onChange={(e) => dispatch({ type: 'SET_DESCRIPTION', payload: e.target.value })}
            />
          ) : (
            <CardDescription onClick={() => dispatch({ type: 'SET_EDITING', payload: true })}>
              {topic.description}
            </CardDescription>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-grow flex flex-col justify-end">
        <div className="mt-auto">
          <p className="text-sm md:text-base text-muted-foreground mb-3">
            <span className="font-semibold text-foreground/80">{topic.vocabularyCount}</span> word(s), <span className="text-primary">{topic.learnedCount}</span> learned
          </p>
          <Progress
            value={topic.vocabularyCount > 0 ? (topic.learnedCount / topic.vocabularyCount) * 100 : 0}
            className="h-1.5 shadow-[0_0_8px_rgba(26,174,204,0.3)]"
          />
        </div>
      </CardContent>

      {/* Action buttons top-right, visible on group hover */}
      <div className="absolute top-2 right-2 z-20 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:bg-muted h-8 w-8 rounded-full"
          onClick={() => onMoveClick?.(topic.id, topic.title)}
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8 rounded-full">
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
        {state.editing && (
          <div className="ml-2 bg-white/90 dark:bg-slate-900/80 rounded-md p-1 shadow flex items-center gap-1">
            <button
              title="Cancel"
              aria-label="Cancel"
              className="p-1 rounded text-muted-foreground hover:bg-muted"
              onClick={() => {
                dispatch({ type: 'RESET', title: topic.title, description: topic.description ?? "" });
              }}
            >
              <X className="h-4 w-4" />
            </button>
            <button
              title="Save"
              aria-label="Save"
              className="p-1 rounded text-primary hover:bg-primary/10"
              onClick={save}
              disabled={!isDirty || state.saving}
            >
              <Check className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Full-card overlay link (under delete button) - disable while editing */}
      {!state.editing && (
        <Link
          href={`/projects/${projectId}/topics/${topic.id}`}
          className="absolute inset-0 z-10"
          aria-hidden
        />
      )}
    </Card>
  );
}