"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Volume2,
  Check,
  RotateCcw,
} from "lucide-react";
import { Vocabulary } from "@prisma/client";
import { updateVocabularyBatchStatus } from "@/services/learn-mode-api";
import { toast } from "sonner";

interface LearnModeProps {
  topicId: string;
  projectId: string;
  initialVocab: Vocabulary[];
  onClose: (updatedVocab: Vocabulary[]) => void;
  mutateTopic?: () => Promise<any>;
}

const LearnMode = ({
  topicId,
  projectId,
  initialVocab,
  onClose,
  mutateTopic,
}: LearnModeProps) => {
  const [vocabularies, setVocabularies] = useState<Vocabulary[]>(() =>
    JSON.parse(JSON.stringify(initialVocab)),
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [showWordFirst, setShowWordFirst] = useState(true);
  const [showPronunciation, setShowPronunciation] = useState(true);

  const currentVocab = useMemo(
    () => vocabularies[currentIndex],
    [vocabularies, currentIndex],
  );

  const saveProgress = async (showToast = true) => {
    try {
      await updateVocabularyBatchStatus(
        topicId,
        vocabularies.map(({ id, status }) => ({ id, status })),
      );
      if (showToast) {
        toast.success("Progress saved!");
      }
      if (mutateTopic) {
        await mutateTopic();
      }
    } catch (error) {
      toast.error("Failed to save progress.");
      console.error("Failed to save progress", error);
    }
  };

  const handleClose = async () => {
    const hasChanges =
      JSON.stringify(vocabularies) !== JSON.stringify(initialVocab);
    if (hasChanges) {
      await saveProgress(false);
    }
    onClose(vocabularies);
  };

  const playAudio = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "ja-JP";
      speechSynthesis.speak(utterance);
    }
  };

  const handleNext = () => {
    if (currentIndex < vocabularies.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    } else {
      setSessionCompleted(true);
      saveProgress(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleRemembered = () => {
    const newVocabs = [...vocabularies];
    newVocabs[currentIndex].status = "REMEMBERED";
    setVocabularies(newVocabs);
    handleNext();
  };

  const handleNotRemembered = () => {
    const newVocabs = [...vocabularies];
    newVocabs[currentIndex].status = "NOT_REMEMBERED";
    setVocabularies(newVocabs);
    handleNext();
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setSessionCompleted(false);
    setVocabularies(JSON.parse(JSON.stringify(initialVocab)));
  };

  const toggleShowMode = () => {
    setShowWordFirst(!showWordFirst);
    setIsFlipped(false);
  };

  const togglePronunciation = () => {
    setShowPronunciation(!showPronunciation);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (sessionCompleted) return;

      if (event.code === "Space") {
        event.preventDefault();
        setIsFlipped((f) => !f);
      }
      if (event.key === "ArrowRight") {
        handleNext();
      }
      if (event.key === "ArrowLeft") {
        handlePrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleNext, handlePrev, sessionCompleted]);

  if (sessionCompleted) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 bg-gradient-to-br from-background via-muted to-primary/30 z-50 flex flex-col items-center justify-center text-foreground"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{
            duration: 0.4,
            ease: [0.4, 0, 0.2, 1],
          }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              delay: 0.2,
              duration: 0.5,
              ease: [0.34, 1.56, 0.64, 1],
            }}
          >
            <Check
              className="w-16 h-16 mx-auto mb-4"
              style={{ color: "hsl(var(--clr-success-a10))" }}
            />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.3 }}
            className="text-2xl font-bold mb-2"
          >
            Session Complete!
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.3 }}
            className="text-muted-foreground mb-6"
          >
            You have reviewed all the flashcards.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.3 }}
            className="flex gap-4"
          >
            <Button onClick={handleRestart} variant="outline">
              <RotateCcw className="mr-2 h-4 w-4" />
              Restart
            </Button>
            <Button onClick={handleClose}>Close</Button>
          </motion.div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center text-foreground"
    >
      <motion.div
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
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="w-full max-w-md px-4"
        style={{ perspective: 1000 }}
      >
        <div className="flex justify-center mb-4">
          <p className="text-sm text-muted-foreground">
            {currentIndex + 1} / {vocabularies.length}
          </p>
        </div>

        <motion.div
          className="relative aspect-[3/2] w-full cursor-pointer"
          style={{ transformStyle: "preserve-3d" }}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.4 }}
          onClick={() => setIsFlipped((f) => !f)}
        >
          <div
            className="absolute w-full h-full bg-card border border-border rounded-lg shadow-lg flex flex-col items-center justify-center p-6"
            style={{ backfaceVisibility: "hidden" }}
          >
            {showWordFirst ? (
              <>
                {currentVocab.word && (
                  <h2 className="text-5xl font-bold mb-2 text-center">
                    {currentVocab.word}
                  </h2>
                )}
                {currentVocab.pronunciation && showPronunciation && (
                  <p className="text-xl text-muted-foreground">
                    {currentVocab.pronunciation}
                  </p>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4"
                  onClick={(e) => {
                    e.stopPropagation();
                    playAudio(
                      currentVocab.word || currentVocab.pronunciation || "",
                    );
                  }}
                >
                  <Volume2 className="h-6 w-6" />
                </Button>
              </>
            ) : (
              <>
                <p className="text-2xl font-semibold text-center">
                  {currentVocab.meaning}
                </p>
                {currentVocab.usageExample && (
                  <p className="text-lg text-muted-foreground mt-4 text-center italic">
                    {currentVocab.usageExample}
                  </p>
                )}
              </>
            )}
          </div>

          <div
            className="absolute w-full h-full bg-card border border-border rounded-lg shadow-lg flex flex-col items-center justify-center p-6"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            {showWordFirst ? (
              <>
                <p className="text-2xl font-semibold text-center">
                  {currentVocab.meaning}
                </p>
                {currentVocab.usageExample && (
                  <p className="text-lg text-muted-foreground mt-4 text-center italic">
                    {currentVocab.usageExample}
                  </p>
                )}
              </>
            ) : (
              <>
                {currentVocab.word && (
                  <h2 className="text-5xl font-bold mb-2 text-center">
                    {currentVocab.word}
                  </h2>
                )}
                {currentVocab.pronunciation && showPronunciation && (
                  <p className="text-xl text-muted-foreground">
                    {currentVocab.pronunciation}
                  </p>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4"
                  onClick={(e) => {
                    e.stopPropagation();
                    playAudio(
                      currentVocab.word || currentVocab.pronunciation || "",
                    );
                  }}
                >
                  <Volume2 className="h-6 w-6" />
                </Button>
              </>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.3 }}
          className="flex justify-between items-center mt-6"
        >
          <Button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            variant="outline"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Prev
          </Button>
          <Button onClick={toggleShowMode} variant="outline" size="lg">
            {showWordFirst ? "Meaning First" : "Word First"}
          </Button>
          <Button onClick={handleNext} variant="outline">
            {currentIndex === vocabularies.length - 1 ? "Finish" : "Next"}
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="flex justify-center mt-4"
        >
          <Button
            onClick={togglePronunciation}
            variant={showPronunciation ? "default" : "outline"}
            size="sm"
          >
            {showPronunciation ? "Hide" : "Show"} Pronunciation
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.3 }}
          className="mt-8 grid grid-cols-2 gap-4"
        >
          <Button
            onClick={handleNotRemembered}
            variant="destructive"
            className="w-full"
          >
            Don't Remember
          </Button>
          <Button
            onClick={handleRemembered}
            variant="default"
            className="w-full"
            style={{
              backgroundColor: "hsl(var(--clr-success-a0))",
              color: "hsl(var(--clr-light))",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor =
                "hsl(var(--clr-success-a10))")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor =
                "hsl(var(--clr-success-a0))")
            }
          >
            Remember
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default LearnMode;
