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
  RotateCcw
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
    JSON.parse(JSON.stringify(initialVocab))
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [showWordFirst, setShowWordFirst] = useState(true); // Thêm state này
  const [showPronunciation, setShowPronunciation] = useState(true); // Thêm state cho pronunciation

  const currentVocab = useMemo(
    () => vocabularies[currentIndex],
    [vocabularies, currentIndex]
  );

  const saveProgress = async (showToast = true) => {
    try {
      await updateVocabularyBatchStatus(topicId, vocabularies.map(({ id, status }) => ({ id, status })));
      if (showToast) {
        toast.success("Progress saved!");
      }
      // Cập nhật lại topic để lấy dữ liệu mới nhất
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
    setIsFlipped(false); // Reset flip state khi đổi chế độ
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
      <div className="fixed inset-0 bg-gradient-to-br from-background to-slate-100 dark:to-slate-900 z-50 flex flex-col items-center justify-center text-foreground">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Check className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Session Complete!</h2>
          <p className="text-muted-foreground mb-6">
            You have reviewed all the flashcards.
          </p>
          <div className="flex gap-4">
            <Button onClick={handleRestart} variant="outline">
              <RotateCcw className="mr-2 h-4 w-4" />
              Restart
            </Button>
            <Button onClick={handleClose}>Close</Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-background to-amber-700 dark:to-violet-800 z-50 flex flex-col items-center justify-center text-foreground">
      <Button
        onClick={handleClose}
        className="absolute top-4 right-4"
        variant="ghost"
        size="icon"
      >
        <X className="h-6 w-6" />
      </Button>

      <div className="w-full max-w-md px-4" style={{ perspective: 1000 }}>
        {/* Di chuyển số lượng lên phía trên card */}
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
          {/* Front of the card - điều chỉnh theo chế độ */}
          <div
            className="absolute w-full h-full bg-card rounded-lg shadow-lg flex flex-col items-center justify-center p-6"
            style={{ backfaceVisibility: "hidden" }}
          >
            {showWordFirst ? (
              // Hiển thị word first
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
                    playAudio(currentVocab.word || currentVocab.pronunciation || "");
                  }}
                >
                  <Volume2 className="h-6 w-6" />
                </Button>
              </>
            ) : (
              // Hiển thị meaning first
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

          {/* Back of the card - điều chỉnh theo chế độ */}
          <div
            className="absolute w-full h-full bg-card rounded-lg shadow-lg flex flex-col items-center justify-center p-6"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)"
            }}
          >
            {showWordFirst ? (
              // Mặt sau khi hiển thị word first
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
              // Mặt sau khi hiển thị meaning first
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
                    playAudio(currentVocab.word || currentVocab.pronunciation || "");
                  }}
                >
                  <Volume2 className="h-6 w-6" />
                </Button>
              </>
            )}
          </div>
        </motion.div>

        <div className="flex justify-between items-center mt-6">
          <Button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            variant="outline"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Prev
          </Button>
          {/* Di chuyển button toggle xuống dưới cùng */}
          <Button
            onClick={toggleShowMode}
            variant="outline"
            size="lg"
          >
            {showWordFirst ? "Meaning First" : "Word First"}
          </Button>
          <Button onClick={handleNext} variant="outline">
            {currentIndex === vocabularies.length - 1 ? "Finish" : "Next"}
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        {/* Thêm dòng nút toggle pronunciation */}
        <div className="flex justify-center mt-4">
          <Button
            onClick={togglePronunciation}
            variant={showPronunciation ? "default" : "outline"}
            size="sm"
          >
            {showPronunciation ? "Hide" : "Show"} Pronunciation
          </Button>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4">
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
            className="w-full bg-green-600 hover:bg-green-700"
          >
            Remember
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LearnMode;