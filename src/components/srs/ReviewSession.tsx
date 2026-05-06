"use client";

import { useState, useEffect, useMemo, useCallback, useReducer } from "react";
import { useDueReviews, useReviewSession } from "@/hooks/use-srs";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, Brain, Clock } from "lucide-react";
import { VocabularyWithSrs } from "@/types/srs";
import type { ReviewAttemptResult } from "@/types/srs";
import { KanjiDrawer } from "@/components/vocabularies/KanjiDrawer";
import { ReviewCard } from "./ReviewCard";

interface ReviewSessionProps {
  projectId?: string;
  onComplete?: (summary: BatchReviewSummary) => void;
  onCancel?: () => void;
}

export interface BatchReviewSummary {
  reviewedCount: number;
  correctCount: number;
  incorrectCount: number;
  timeoutCount: number;
}

const TIME_LIMIT = 10; // 10 seconds per card

interface CardState {
  isAnswered: boolean;
  selectedAnswer: string | null;
  timeLeft: number;
  lastResult: ReviewAttemptResult | null;
}

type CardAction =
  | { type: 'RESET' }
  | { type: 'SET_ANSWERED'; payload: { selectedAnswer: string | null; lastResult: ReviewAttemptResult } }
  | { type: 'TICK_TIME' }
  | { type: 'SET_TIME_LEFT'; payload: number };

const cardReducer = (state: CardState, action: CardAction): CardState => {
  switch (action.type) {
    case 'RESET':
      return { isAnswered: false, selectedAnswer: null, timeLeft: TIME_LIMIT, lastResult: null };
    case 'SET_ANSWERED':
      return { ...state, isAnswered: true, selectedAnswer: action.payload.selectedAnswer, lastResult: action.payload.lastResult };
    case 'TICK_TIME':
      return { ...state, timeLeft: Math.max(0, state.timeLeft - 1) };
    case 'SET_TIME_LEFT':
      return { ...state, timeLeft: action.payload };
    default:
      return state;
  }
};

function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export function ReviewSession({ projectId, onComplete, onCancel }: ReviewSessionProps) {
  const { dueReviews, isLoading } = useDueReviews(projectId);
  const { submitFeedback } = useReviewSession();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionReviews, setSessionReviews] = useState<VocabularyWithSrs[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cardState, dispatchCard] = useReducer(cardReducer, {
    isAnswered: false,
    selectedAnswer: null,
    timeLeft: TIME_LIMIT,
    lastResult: null,
  });
  const [batchSummary, setBatchSummary] = useState<BatchReviewSummary>({
    reviewedCount: 0,
    correctCount: 0,
    incorrectCount: 0,
    timeoutCount: 0,
  });

  const [isKanjiDrawerOpen, setIsKanjiDrawerOpen] = useState(false);
  const [selectedWordForKanji, setSelectedWordForKanji] = useState<string | null>(null);
  const [selectedKanjiChar, setSelectedKanjiChar] = useState<string | null>(null);

  useEffect(() => {
    if (dueReviews.length > 0 && sessionReviews.length === 0) {
      // Shuffle reviews to make sessions less predictable
      setSessionReviews(shuffleArray(dueReviews));
    }
  }, [dueReviews, sessionReviews.length]);

  const currentVocab = useMemo(() => {
    if (sessionReviews.length > 0) {
      return sessionReviews[currentIndex];
    }
    return null;
  }, [sessionReviews, currentIndex]);

  useEffect(() => {
    if (!currentVocab) return;
    dispatchCard({ type: 'RESET' });
  }, [currentVocab, sessionReviews]);

  const moveToNext = useCallback((finalSummary?: BatchReviewSummary) => {
    if (currentIndex === sessionReviews.length - 1) {
      onComplete?.(finalSummary || batchSummary);
    } else {
      setCurrentIndex((prev) => prev + 1);
      dispatchCard({ type: 'RESET' });
    }
  }, [batchSummary, currentIndex, sessionReviews.length, onComplete]);

  const promptType = currentVocab?.promptType || "WORD_TO_MEANING";
  const correctAnswer = currentVocab?.correctAnswer ||
    (promptType === "WORD_TO_READING" ? currentVocab?.pronunciation : currentVocab?.meaning) ||
    "";
  const answerOptions =
    currentVocab?.answerOptions && currentVocab.answerOptions.length > 0
      ? currentVocab.answerOptions
      : shuffleArray([currentVocab?.meaning || ""]);

  const handleAnswerSelect = useCallback(
    async (selectedOption: string | null, forcedResult?: ReviewAttemptResult) => {
      if (cardState.isAnswered) return;

      const timeSpent = TIME_LIMIT - cardState.timeLeft;
      const responseTimeMs = Math.max(timeSpent, 0) * 1000;
      const isCorrect = selectedOption === correctAnswer;
      const result: ReviewAttemptResult =
        forcedResult || (isCorrect ? "CORRECT" : "INCORRECT");
      
      dispatchCard({ type: 'SET_ANSWERED', payload: { selectedAnswer: selectedOption, lastResult: result } });
      setIsSubmitting(true);

      let quality: number;
      if (result !== "CORRECT" || timeSpent > 7) {
        quality = 0; // Hard
      } else if (timeSpent > 4) {
        quality = 3; // Medium
      } else {
        quality = 5; // Easy
      }

      const status = isCorrect ? "REMEMBERED" : "NOT_REMEMBERED";
      const nextBatchSummary = {
        reviewedCount: batchSummary.reviewedCount + 1,
        correctCount: batchSummary.correctCount + (result === "CORRECT" ? 1 : 0),
        incorrectCount:
          batchSummary.incorrectCount + (result === "INCORRECT" ? 1 : 0),
        timeoutCount: batchSummary.timeoutCount + (result === "TIMEOUT" ? 1 : 0),
      };
      setBatchSummary(nextBatchSummary);

      try {
        if (currentVocab) {
          await submitFeedback(currentVocab.id, {
            quality,
            status,
            promptType,
            result,
            responseTimeMs,
          });
        }
      } catch (error) {
        console.error("Failed to submit review:", error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [cardState.isAnswered, cardState.timeLeft, currentVocab, submitFeedback, batchSummary, correctAnswer, promptType],
  );

  useEffect(() => {
    if (!currentVocab || cardState.isAnswered) return;

    const timer = setInterval(() => {
      dispatchCard({ type: 'TICK_TIME' });
    }, 1000);

    if (cardState.timeLeft <= 0) {
      clearInterval(timer);
      handleAnswerSelect(null, "TIMEOUT");
    }

    return () => clearInterval(timer);
  }, [cardState.timeLeft, cardState.isAnswered, currentVocab, handleAnswerSelect]);

  const handleKanjiClick = (word: string, kanji: string) => {
    setSelectedWordForKanji(word);
    setSelectedKanjiChar(kanji);
    setIsKanjiDrawerOpen(true);
  };

  if (isLoading) {
    return <ReviewSessionSkeleton />;
  }

  if (!currentVocab) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <Brain className="h-12 w-12 mx-auto text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold">No words to review</h3>
              <p className="text-sm md:text-base text-muted-foreground">
                Come back after learning more words!
              </p>
            </div>
            <Button onClick={onCancel}>Go Back</Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  return (
    <>
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Progress Bar & Timer */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm md:text-base font-medium">
            <span>
              Progress: {currentIndex + 1} / {sessionReviews.length}
            </span>
            <span className="flex items-center">
              <Clock className="h-4 w-4 mr-1.5" />
              {cardState.timeLeft}s
            </span>
          </div>
          <Progress
            value={(cardState.timeLeft / TIME_LIMIT) * 100}
            className="h-2"
          />
        </div>

        <ReviewCard
          vocab={currentVocab}
          isAnswered={cardState.isAnswered}
          selectedAnswer={cardState.selectedAnswer}
          lastResult={cardState.lastResult}
          timeLeft={cardState.timeLeft}
          answerOptions={answerOptions}
          correctAnswer={correctAnswer}
          isSubmitting={isSubmitting}
          onAnswerSelect={handleAnswerSelect}
          onKanjiClick={handleKanjiClick}
          currentIndex={currentIndex}
          totalCount={sessionReviews.length}
        />
      </div>

      <KanjiDrawer
        word={selectedWordForKanji}
        isOpen={isKanjiDrawerOpen}
        onOpenChange={setIsKanjiDrawerOpen}
        initialKanji={selectedKanjiChar}
      />
    </>
  );
}

function ReviewSessionSkeleton() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between">
          <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="h-2 bg-gray-200 rounded animate-pulse" />
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <div className="h-12 w-48 mx-auto bg-gray-200 rounded animate-pulse" />
            <div className="h-8 w-32 mx-auto bg-gray-200 rounded animate-pulse" />
            <div className="h-8 w-24 mx-auto bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="flex justify-between">
            <div className="h-10 w-20 bg-gray-200 rounded animate-pulse" />
            <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
