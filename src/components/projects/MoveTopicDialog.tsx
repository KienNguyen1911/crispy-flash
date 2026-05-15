"use client";

import React, { useContext, useState } from "react";
import type { Project } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { X, Check } from "lucide-react";
import { TopicContext } from "@/context/TopicContext";
import { AnimatePresence, motion } from "framer-motion";

export default function MoveTopicDialog({
  topicId,
  topicTitle,
  currentProjectId,
  projects,
  onTopicMoved,
  onOpenChange,
}: {
  topicId: string;
  topicTitle: string;
  currentProjectId: string;
  projects: Project[];
  onTopicMoved?: () => void;
  onOpenChange?: (open: boolean) => void;
}) {
  const { moveTopic } = useContext(TopicContext);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [isMoving, setIsMoving] = useState(false);
  const [open, setOpen] = useState(true);

  // Filter out the current project
  const availableProjects = projects.filter(
    (project) => project.id !== currentProjectId
  );

  const handleMove = async () => {
    if (!selectedProjectId) return;

    try {
      setIsMoving(true);
      await moveTopic(topicId, selectedProjectId);
      setOpen(false);
      setSelectedProjectId("");
      onTopicMoved?.();
    } catch (error) {
      console.error("Failed to move topic:", error);
    } finally {
      setIsMoving(false);
    }
  };

  return (
    <AnimatePresence mode="wait">
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            onClick={() => {
              setOpen(false);
              setSelectedProjectId("");
              onOpenChange?.(false);
            }}
          />

          {/* Drawer */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{
              type: "spring",
              damping: 30,
              stiffness: 300,
            }}
            className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-2xl"
          >
            <div className="rounded-t-[var(--neo-radius)] border-2 border-[var(--neo-line-strong)] bg-[var(--neo-surface)] shadow-[var(--neo-shadow)]">
              {/* Header */}
              <div className="flex items-center justify-between border-b-2 border-[var(--neo-line)] p-6">
                <div>
                  <h2 className="text-xl font-black text-white">Move Topic</h2>
                  <p className="mt-1 text-sm md:text-base font-medium text-muted-foreground">
                    Move "{topicTitle}" to another project
                  </p>
                </div>
                <Button
                  variant="neoGhost"
                  size="icon"
                  onClick={() => {
                    setOpen(false);
                    setSelectedProjectId("");
                    onOpenChange?.(false);
                  }}
                  className="shrink-0"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Content */}
              <div className="p-6 max-h-[70vh] overflow-y-auto">
                <div className="space-y-4">
                  {availableProjects.length === 0 ? (
                    <p className="text-sm font-medium text-muted-foreground">
                      No other projects available. Create a new project to move this topic.
                    </p>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <label className="text-sm font-black text-white">
                          Select a project
                        </label>
                        <div className="max-h-[250px] overflow-y-auto rounded-[var(--neo-radius)] border-2 border-[var(--neo-line)] bg-black/10">
                          {availableProjects.map((project) => (
                            <button
                              key={project.id}
                              onClick={() => {
                                setSelectedProjectId(project.id);
                              }}
                              className={`flex w-full items-center justify-between border-b border-[var(--neo-line)] px-4 py-3 text-left transition-colors last:border-b-0 ${
                                selectedProjectId === project.id
                                  ? "bg-cyan-950/40 text-white"
                                  : "text-muted-foreground hover:bg-white/5 hover:text-white"
                              }`}
                            >
                              <span className="text-sm font-semibold">{project.title}</span>
                              {selectedProjectId === project.id && (
                                <Check className="h-4 w-4 text-cyan-300" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button
                          variant="neoSecondary"
                          onClick={() => {
                            setOpen(false);
                            setSelectedProjectId("");
                            onOpenChange?.(false);
                          }}
                          disabled={isMoving}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="neo"
                          onClick={handleMove}
                          disabled={!selectedProjectId || isMoving}
                        >
                          {isMoving ? "Moving..." : "Move"}
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
