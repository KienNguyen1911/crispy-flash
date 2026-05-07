"use client";

import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { LazyMotion, m, domAnimation } from "framer-motion";
import { Vocabulary } from "@prisma/client";
import { LearnModeControls } from "./learn-mode/LearnModeControls";
import { SessionComplete } from "./learn-mode/SessionComplete";
import { CardStack } from "./learn-mode/CardStack";
import { useLearnMode } from "./learn-mode/useLearnMode";

interface LearnModeProps {
  topicId: string;
  projectId: string;
  initialVocab: Vocabulary[];
  onClose: (updatedVocab: Vocabulary[]) => void;
  mutateTopic?: () => Promise<any>;
  mutateProjectTopics?: () => Promise<any>;
}

const LearnMode = ({
  topicId,
  projectId,
  initialVocab,
  onClose,
  mutateTopic,
  mutateProjectTopics,
}: LearnModeProps) => {
  const {
    state,
    currentVocab,
    sessionCompletedRef,
    handleCardClick,
    handleNext,
    handlePrev,
    handleRemembered,
    handleNotRemembered,
    handleRestart,
    toggleShowMode,
    togglePronunciation,
    playAudio,
  } = useLearnMode({
    topicId,
    initialVocab,
    mutateTopic,
    mutateProjectTopics,
  });

  const handleClose = () => {
    onClose(state.vocabularies);
  };

  if (sessionCompletedRef.current) {
    return (
      <SessionComplete onRestart={handleRestart} onClose={handleClose} />
    );
  }

  return (
    <LazyMotion features={domAnimation}>
      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center text-foreground"
        style={{
          backgroundImage:
            "radial-gradient(circle, hsl(var(--foreground) / 0.1) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      >
        <m.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.2 }}
        >
          <Button
            onClick={handleClose}
            className="absolute top-4 right-4"
            variant="ghost"
            size="icon"
          >
            <X className="h-6 w-6" />
          </Button>
        </m.div>

        <CardStack
          currentVocab={currentVocab}
          currentIndex={state.currentIndex}
          totalCards={state.vocabularies.length}
          displayState={{
            isFlipped: state.isFlipped,
            isFlipping: state.isFlipping,
            showWordFirst: state.showWordFirst,
            showPronunciation: state.showPronunciation,
          }}
          swipeDirection={state.swipeDirection}
          previousIndex={state.previousIndex}
          vocabularies={state.vocabularies}
          onCardClick={handleCardClick}
          onPlayAudio={playAudio}
        />

        <LearnModeControls
          currentIndex={state.currentIndex}
          totalCards={state.vocabularies.length}
          showWordFirst={state.showWordFirst}
          showPronunciation={state.showPronunciation}
          onRemembered={handleRemembered}
          onNotRemembered={handleNotRemembered}
          onPrev={handlePrev}
          onToggleShowMode={toggleShowMode}
          onTogglePronunciation={togglePronunciation}
        />
      </m.div>
    </LazyMotion>
  );
};

export default LearnMode;
