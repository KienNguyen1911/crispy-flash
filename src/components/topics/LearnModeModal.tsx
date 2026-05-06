"use client";

import { AnimatePresence, m, LazyMotion } from "framer-motion";
import { domAnimation } from "framer-motion/m";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const LearnMode = dynamic(() => import("@/components/LearnMode"), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin" />
    </div>
  ),
});

interface LearnModeModalProps {
  isOpen: boolean;
  topicId: string;
  projectId: string;
  vocabulary: any[];
  onClose: () => void;
  mutateTopic: () => Promise<any>;
  mutateProjectTopics: () => Promise<any>;
}

export const LearnModeModal = ({
  isOpen,
  topicId,
  projectId,
  vocabulary,
  onClose,
  mutateTopic,
  mutateProjectTopics,
}: LearnModeModalProps) => (
  <LazyMotion features={domAnimation}>
    <AnimatePresence mode="wait">
      {isOpen && (
        <m.div
          initial={{ opacity: 1, y: "100%" }}
          animate={{ opacity: 1, y: "0%" }}
          exit={{ opacity: 0, y: "100%" }}
          transition={{
            duration: 0.3,
            ease: [0.4, 0, 0.2, 1],
          }}
        >
          <LearnMode
            topicId={topicId}
            projectId={projectId}
            initialVocab={vocabulary}
            onClose={onClose}
            mutateTopic={mutateTopic}
            mutateProjectTopics={mutateProjectTopics}
          />
        </m.div>
      )}
    </AnimatePresence>
  </LazyMotion>
);
