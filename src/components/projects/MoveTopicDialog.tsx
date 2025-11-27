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
  const [selectedProjectName, setSelectedProjectName] = useState<string>("");
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
      setSelectedProjectName("");
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
              setSelectedProjectName("");
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
            <div className="rounded-t-2xl border border-border bg-card shadow-lg">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border p-6">
                <div>
                  <h2 className="text-xl font-semibold">Move Topic</h2>
                  <p className="text-sm md:text-base text-muted-foreground mt-1">
                    Move "{topicTitle}" to another project
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setOpen(false);
                    setSelectedProjectId("");
                    setSelectedProjectName("");
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
                    <p className="text-sm text-muted-foreground">
                      No other projects available. Create a new project to move this topic.
                    </p>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Select a project
                        </label>
                        <div className="border border-border rounded-md overflow-y-auto max-h-[250px]">
                          {availableProjects.map((project) => (
                            <button
                              key={project.id}
                              onClick={() => {
                                setSelectedProjectId(project.id);
                                setSelectedProjectName(project.title);
                              }}
                              className={`w-full px-4 py-3 text-left hover:bg-muted transition-colors flex items-center justify-between border-b last:border-b-0 ${
                                selectedProjectId === project.id
                                  ? "bg-muted"
                                  : ""
                              }`}
                            >
                              <span className="text-sm">{project.title}</span>
                              {selectedProjectId === project.id && (
                                <Check className="h-4 w-4 text-primary" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setOpen(false);
                            setSelectedProjectId("");
                            setSelectedProjectName("");
                            onOpenChange?.(false);
                          }}
                          disabled={isMoving}
                        >
                          Cancel
                        </Button>
                        <Button
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
