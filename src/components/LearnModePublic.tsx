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
  XCircle,
  CheckCircle,
  Redo2,
} from "lucide-react";
import { toast } from "sonner";

interface VocabularyItem {
  id: string;
  word?: string;
  pronunciation?: string;
  meaning: string;
  usageExample?: string;
  image?: string;
}

interface LearnModePublicProps {
  topicTitle: string;
  vocabulary: VocabularyItem[];
  onClose: () => void;
}

const LearnModePublic = ({
  topicTitle,
  vocabulary,
  onClose,
}: LearnModePublicProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [showWordFirst, setShowWordFirst] = useState(true);
  const [showPronunciation, setShowPronunciation] = useState(true);
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(
    null,
  );
  const [previousIndex, setPreviousIndex] = useState<number | null>(null);
  const [localStatus, setLocalStatus] = useState<Record<string, string>>({});

  const currentVocab = useMemo(
    () => vocabulary[currentIndex],
    [vocabulary, currentIndex],
  );

  const renderCard = (vocab: VocabularyItem) => (
    <>
      <div
        className="absolute w-full h-full bg-card border border-border rounded-lg shadow-lg flex flex-col items-center justify-center p-6"
        style={{ backfaceVisibility: "hidden" }}
      >
        {showWordFirst ? (
          <>
            {vocab.word && (
              <h2 className="text-5xl font-bold mb-2 text-center">
                {vocab.word}
              </h2>
            )}
            {vocab.pronunciation && showPronunciation && (
              <p className="text-xl text-muted-foreground">
                {vocab.pronunciation}
              </p>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4"
              onClick={(e) => {
                e.stopPropagation();
                playAudio(vocab.word || vocab.pronunciation || "");
              }}
            >
              <Volume2 className="h-6 w-6" />
            </Button>
          </>
        ) : (
          <>
            <p className="text-2xl font-semibold text-center">
              {vocab.meaning}
            </p>
            {vocab.usageExample && (
              <p className="text-lg text-muted-foreground mt-4 text-center italic">
                {vocab.usageExample}
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
              {vocab.meaning}
            </p>
            {vocab.pronunciation && (
              <p className="text-lg text-muted-foreground mt-2 text-center">
                {vocab.pronunciation}
              </p>
            )}
            {vocab.usageExample && (
              <p className="text-lg text-muted-foreground mt-4 text-center italic">
                {vocab.usageExample}
              </p>
            )}
          </>
        ) : (
          <>
            {vocab.word && (
              <h2 className="text-5xl font-bold mb-2 text-center">
                {vocab.word}
              </h2>
            )}
            {vocab.pronunciation && (
              <p className="text-xl text-muted-foreground">
                {vocab.pronunciation}
              </p>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4"
              onClick={(e) => {
                e.stopPropagation();
                playAudio(vocab.word || vocab.pronunciation || "");
              }}
            >
              <Volume2 className="h-6 w-6" />
            </Button>
          </>
        )}
      </div>
    </>
  );

  const playAudio = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "ja-JP";
      speechSynthesis.speak(utterance);
    }
  };

  const handleNext = () => {
    if (currentIndex < vocabulary.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    } else {
      setSessionCompleted(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleRemembered = () => {
    if (swipeDirection) return;

    setLocalStatus((prev) => ({
      ...prev,
      [currentVocab.id]: "REMEMBERED",
    }));

    setPreviousIndex(currentIndex);
    setSwipeDirection("right");
    setIsFlipped(false);

    if (currentIndex < vocabulary.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setTimeout(() => {
        setSwipeDirection(null);
        setPreviousIndex(null);
      }, 400);
    } else {
      setTimeout(() => {
        setSessionCompleted(true);
      }, 400);
    }
  };

  const handleNotRemembered = () => {
    if (swipeDirection) return;

    setLocalStatus((prev) => ({
      ...prev,
      [currentVocab.id]: "NOT_REMEMBERED",
    }));

    setPreviousIndex(currentIndex);
    setSwipeDirection("left");
    setIsFlipped(false);

    if (currentIndex < vocabulary.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setTimeout(() => {
        setSwipeDirection(null);
        setPreviousIndex(null);
      }, 400);
    } else {
      setTimeout(() => {
        setSessionCompleted(true);
      }, 400);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setSessionCompleted(false);
    setLocalStatus({});
  };

  const toggleShowMode = () => {
    setShowWordFirst(!showWordFirst);
    setIsFlipped(false);
  };

  const togglePronunciation = () => {
    setShowPronunciation(!showPronunciation);
  };

  const getRememberedCount = () => {
    return Object.values(localStatus).filter((s) => s === "REMEMBERED").length;
  };

  const getNotRememberedCount = () => {
    return Object.values(localStatus).filter((s) => s === "NOT_REMEMBERED")
      .length;
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
    const rememberedCount = getRememberedCount();
    const notRememberedCount = getNotRememberedCount();
    const reviewedCount = rememberedCount + notRememberedCount;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed bg-background inset-0 z-50 flex flex-col items-center justify-center text-foreground"
        style={{
          backgroundImage:
            "radial-gradient(circle, hsl(var(--foreground) / 0.1) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
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

          {reviewedCount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.3 }}
              className="mb-6 space-y-2 text-sm"
            >
              <p className="text-green-600 font-semibold">
                ✓ Remembered: {rememberedCount}
              </p>
              <p className="text-red-600 font-semibold">
                ✗ Not Remembered: {notRememberedCount}
              </p>
            </motion.div>
          )}

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
            <Button onClick={onClose}>Close</Button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.3 }}
            className="text-xs text-muted-foreground mt-6"
          >
            Note: Your progress is not saved (public mode)
          </motion.p>
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
      style={{
        backgroundImage:
          "radial-gradient(circle, hsl(var(--foreground) / 0.1) 1px, transparent 1px)",
        backgroundSize: "20px 20px",
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.2 }}
      >
        <Button
          onClick={onClose}
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
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm md:text-base text-muted-foreground">
            {currentIndex + 1} / {vocabulary.length}
          </p>
          <p className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
            Public Mode
          </p>
        </div>

        <div className="relative aspect-[3/3] w-full">
          {/* Background cards (stack effect) */}
          {[2, 1].map((offset) => {
            const cardIndex = currentIndex + offset;
            if (cardIndex >= vocabulary.length) return null;

            const adjustedOffset = swipeDirection ? offset - 1 : offset;

            return (
              <motion.div
                key={cardIndex}
                className="absolute w-full h-full bg-card border border-border rounded-lg"
                animate={{
                  top: `${adjustedOffset * 20}px`,
                  scale: 1 - adjustedOffset * 0.06,
                  opacity: adjustedOffset <= 1 ? 1 - adjustedOffset * 0.25 : 0,
                }}
                transition={{ duration: 0.3 }}
                style={{
                  left: 0,
                  zIndex: -offset,
                  pointerEvents: "none",
                  boxShadow:
                    "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
                }}
              />
            );
          })}

          {/* Previous card (swiping out) */}
          {previousIndex !== null && (
            <motion.div
              key={`prev-${previousIndex}`}
              className="absolute w-full h-full cursor-pointer"
              style={{ transformStyle: "preserve-3d", zIndex: 11 }}
              initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
              animate={{
                x: swipeDirection === "left" ? -1000 : 1000,
                y: 100,
                rotate: swipeDirection === "left" ? -15 : 15,
                opacity: 0,
              }}
              transition={{ duration: 0.3 }}
            >
              {renderCard(vocabulary[previousIndex])}
            </motion.div>
          )}

          {/* Current card */}
          <motion.div
            key={currentIndex}
            className="absolute w-full h-full cursor-pointer"
            style={{ transformStyle: "preserve-3d", zIndex: 10 }}
            initial={
              swipeDirection
                ? { scale: 0.97, opacity: 0.7, top: 8 }
                : { scale: 1, opacity: 1 }
            }
            animate={{
              rotateY: isFlipped ? 180 : 0,
              scale: isFlipping ? 1.08 : 1,
              opacity: 1,
              top: 0,
            }}
            transition={{
              duration: swipeDirection ? 0.3 : 0.4,
              scale: {
                duration: 0.15,
                ease: "easeOut",
              },
              rotateY: {
                duration: 0.4,
                ease: "easeInOut",
              },
            }}
            onClick={() => {
              if (swipeDirection) return;
              setIsFlipping(true);
              setTimeout(() => {
                setIsFlipped((f) => !f);
                setTimeout(() => {
                  setIsFlipping(false);
                }, 200);
              }, 150);
            }}
          >
            {renderCard(currentVocab)}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.3 }}
          className="flex justify-center items-center gap-4 mt-6"
        >
          <Button
            onClick={toggleShowMode}
            variant={showWordFirst ? "warning" : "outline"}
            size="sm"
          >
            {showWordFirst ? "Meaning First" : "Word First"}
          </Button>
          <Button
            onClick={togglePronunciation}
            variant={showPronunciation ? "warning" : "outline"}
            size="sm"
          >
            {showPronunciation ? "Hide" : "Show"} Pronunciation
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="mt-20 flex justify-center items-center gap-6"
        >
          <Button
            onClick={handleNotRemembered}
            variant="destructive"
            size="icon"
            className="w-20 h-20 rounded-full transition-transform hover:scale-110"
          >
            <X style={{ width: "2rem", height: "2rem" }} />
          </Button>
          <Button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            variant="outline"
            size="icon"
            className="w-16 h-16 rounded-full transition-transform hover:scale-110 bg-primary"
          >
            <Redo2 style={{ width: "1.5rem", height: "1.5rem" }} />
          </Button>
          <Button
            onClick={handleRemembered}
            variant="success"
            size="icon"
            className="w-20 h-20 rounded-full transition-transform hover:scale-110"
          >
            <Check style={{ width: "2rem", height: "2rem" }} />
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.3 }}
          className="mt-4 flex justify-center text-xs text-muted-foreground"
        >
          <p>Keyboard: Space to flip | ← → to navigate</p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default LearnModePublic;
