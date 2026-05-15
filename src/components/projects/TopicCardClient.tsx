"use client";

import React, { useContext, useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  AlertDialogAction,
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ArrowRight, Menu, Trash2 } from "lucide-react";
import { Check, X } from "lucide-react";
import { TopicContext } from "@/context/TopicContext";
import { Progress } from "@/components/ui/progress";
import { NeoPanel } from "@/components/ui/neo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const [deleteOpen, setDeleteOpen] = useState(false);
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
    <NeoPanel
      ref={containerRef}
      className="group relative flex min-h-[166px] flex-col p-6 transition-all duration-200 hover:-translate-x-1 hover:-translate-y-1 hover:bg-[var(--neo-surface-raised)] hover:shadow-[7px_7px_0_#000]"
    >
      <div className="pr-10">
        {editing ? (
          <input
            className="w-full rounded-[var(--neo-radius)] border-2 border-[var(--neo-line)] bg-black/20 px-2 py-1 text-2xl font-black font-headline text-white outline-none focus:border-cyan-400"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        ) : (
          <h3
            className="cursor-text truncate whitespace-nowrap pr-2 font-headline text-2xl font-black leading-tight text-white"
            onClick={() => setEditing(true)}
            title={topic.title}
          >
            {topic.title}
          </h3>
        )}
        {editing ? (
          <textarea
            className="mt-2 w-full rounded-[var(--neo-radius)] border-2 border-[var(--neo-line)] bg-black/20 px-2 py-1 text-sm md:text-base text-muted-foreground outline-none focus:border-cyan-400"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        ) : (
          <p
            className="mt-2 min-h-5 cursor-text truncate whitespace-nowrap pr-2 text-sm font-medium text-muted-foreground"
            onClick={() => setEditing(true)}
            title={topic.description ?? ""}
          >
            {topic.description}
          </p>
        )}
      </div>

      <div className="mt-auto pt-8">
        <p className="mb-3 text-sm md:text-base font-semibold text-muted-foreground">
          <span className="font-semibold text-foreground/80">
            {topic.vocabularyCount}
          </span>{" "}
          word(s), <span className="text-primary">{topic.learnedCount}</span>{" "}
          learned
        </p>
        <Progress
          value={
            topic.vocabularyCount > 0
              ? (topic.learnedCount / topic.vocabularyCount) * 100
              : 0
          }
          className="h-2 border-2 border-[var(--neo-line)] shadow-[var(--neo-shadow-sm)]"
        />
      </div>

      <div className="absolute top-2 right-2 z-20 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        {!editing ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="neoGhost"
                size="icon"
                className="h-8 w-8 text-muted-foreground"
              >
                <Menu className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-44 rounded-[var(--neo-radius)] border-2 border-[var(--neo-line)] bg-[var(--neo-surface-raised)] text-white shadow-[var(--neo-shadow-sm)]"
            >
              <DropdownMenuItem
                className="cursor-pointer font-semibold focus:bg-white/10 focus:text-white"
                onSelect={() => onMoveClick?.(topic.id, topic.title)}
              >
                <ArrowRight className="h-4 w-4" />
                Move to project
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer font-semibold text-red-300 focus:bg-red-500/10 focus:text-red-200"
                onSelect={() => setDeleteOpen(true)}
              >
                <Trash2 className="h-4 w-4" />
                Delete topic
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
        {/* Legend-style icon buttons when editing */}
        {editing && (
          <div className="flex items-center gap-1 rounded-[var(--neo-radius)] border-2 border-[var(--neo-line)] bg-[var(--neo-surface-raised)] p-1 shadow-[var(--neo-shadow-sm)]">
            <button
              title="Cancel"
              aria-label="Cancel"
              className="rounded p-1 text-muted-foreground hover:bg-muted"
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
              className="rounded p-1 text-primary hover:bg-primary/10"
              onClick={save}
              disabled={!isDirty || saving}
            >
              <Check className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
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
              <Button variant="neoSecondary" className="mt-0">
                Cancel
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                variant="neoDanger"
                onClick={async () => {
                  try {
                    await deleteTopic(projectId, topic.id);
                    onTopicDeleted?.();
                    setDeleteOpen(false);
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

      {/* Full-card overlay link (under delete button) - disable while editing */}
      {!editing && (
        <Link
          href={`/projects/${projectId}/topics/${topic.id}`}
          className="absolute inset-0 z-10"
          aria-hidden
        />
      )}
    </NeoPanel>
  );
}
