"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, X } from "lucide-react";
import { TopicForm } from "@/components/topics/TopicForm";
import { useContext } from "react";
import { TopicContext } from "@/context/TopicContext";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function TopicCreate({
  projectId,
  onTopicCreated,
}: {
  projectId: string;
  onTopicCreated?: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const { addTopic } = useContext(TopicContext);
  const router = useRouter();

  const handleSubmit = async (data: any) => {
    await addTopic(projectId, data);
    onTopicCreated?.();
    setIsOpen(false);
    // refresh server-rendered data so the new topic appears immediately
    try {
      router.refresh();
    } catch (e) {
      /* noop */
    }
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        <PlusCircle className="mr-2 h-4 w-4" />
        New Topic
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
                      Create a New Topic
                    </h2>
                    <p className="text-sm md:text-base text-muted-foreground mt-1">
                      Add a new topic to organize your vocabulary
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
                  <TopicForm
                    onSubmit={handleSubmit}
                    submitButtonText="Create Topic"
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
