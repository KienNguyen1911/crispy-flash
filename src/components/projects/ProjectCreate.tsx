"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, X } from "lucide-react";
import { ProjectForm } from "@/components/projects/ProjectForm";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function ProjectCreate({
  onProjectCreated,
  onSubmit,
}: {
  onProjectCreated?: () => void;
  onSubmit: (data: any) => Promise<boolean>;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleSubmit = async (data: any) => {
    const success = await onSubmit(data);
    if (success) {
      onProjectCreated?.();
      setIsOpen(false);
      // refresh server-rendered data so the new project appears immediately
      try {
        router.refresh();
      } catch (e) {
        /* noop */
      }
    }
    return success;
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        <PlusCircle className="mr-2 h-4 w-4" />
        Add Project
      </Button>

      <AnimatePresence mode="wait">
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
              onClick={() => setIsOpen(false)}
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
                    <h2 className="text-xl font-semibold">
                      Create a New Project
                    </h2>
                    <p className="text-sm md:text-base text-muted-foreground mt-1">
                      Add a new project to organize your vocabulary learning
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                    className="shrink-0"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                {/* Content */}
                <div className="p-6 max-h-[70vh] overflow-y-auto">
                  <ProjectForm
                    onSubmit={handleSubmit}
                    submitButtonText="Create Project"
                    onClose={() => setIsOpen(false)}
                  />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
