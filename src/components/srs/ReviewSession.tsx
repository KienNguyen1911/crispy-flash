"use client";

import { useState, useEffect, useMemo, useCallback, useReducer } from "react";
import { useDueReviews, useReviewSession } from "@/hooks/use-srs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, Brain, Clock, CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { VocabularyWithSrs } from "@/types/srs";
import type { ReviewAttemptResult } from "@/types/srs";
import { KanjiDrawer } from "@/components/vocabularies/KanjiDrawer";

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

  const renderContextSentence = (sentence: string, word: string) => {
    const index = sentence.indexOf(word);
    if (index === -1) {
      return <span>{sentence}</span>;
    }

    const before = sentence.slice(0, index);
    const target = sentence.slice(index, index + word.length);
    const after = sentence.slice(index + word.length);

    return (
      <span>
        {before}
        <span className="rounded bg-primary/15 px-1 text-primary">{target}</span>
        {after}
      </span>
    );
  };

  const handleKanjiClick = (word: string, kanji: string) => {
    setSelectedWordForKanji(word);
    setSelectedKanjiChar(kanji);
    setIsKanjiDrawerOpen(true);
  };

  const renderKanjiWord = (word: string) => {
    // Extract individual kanji characters
    const kanjiRegex = /[\u4e00-\u9faf]/g;
    const kanjis = word.match(kanjiRegex);
    
    if (!kanjis || kanjis.length === 0) {
      return <span>{word}</span>;
    }

    const chars = word.split('');
    const parts = chars.map((char) => {
      if (/[\u4e00-\u9faf]/.test(char)) {
        // This is a kanji character - make it clickable
        return (
          <span
            key={`${word}-${char}-kanji`}
            className="cursor-pointer hover:text-blue-500 hover:scale-110 transition-all inline-block mx-0.5"
            onClick={() => handleKanjiClick(word, char)}
          >
            {char}
          </span>
        );
      } else {
        // This is not a kanji (hiragana, katakana, etc.)
        return <span key={`${word}-${char}-char`}>{char}</span>;
      }
    });

    return <span className="inline-flex items-center">{parts}</span>;
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

      {/* Main Card */}
      <Card className="relative">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <CardTitle>{currentVocab.promptQuestion || "What is the meaning of this word?"}</CardTitle>
              <CardDescription>
                {cardState.isAnswered
                  ? "Review the answer and continue when you're ready."
                  : `Select the correct answer within ${TIME_LIMIT} seconds.`}
              </CardDescription>
            </div>
            <Badge variant="outline">
              <Clock className="h-3 w-3 mr-1" />
              {currentVocab.interval} days
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Word Display */}
          <div className="text-center space-y-2 min-h-[100px] flex flex-col justify-center">
            {promptType === "WORD_TO_READING" && currentVocab.promptContext && currentVocab.word && (
              <div className="mx-auto max-w-xl text-base text-muted-foreground leading-7">
                {renderContextSentence(currentVocab.promptContext, currentVocab.word)}
              </div>
            )}
            <div className="text-5xl font-bold text-primary">
              {cardState.isAnswered && currentVocab.word && /[\u4e00-\u9faf]/.test(currentVocab.word)
                ? renderKanjiWord(currentVocab.word)
                : (currentVocab.word || currentVocab.pronunciation)}
            </div>
            {cardState.isAnswered && currentVocab.pronunciation && (
              <div className="text-2xl font-semibold text-secondary">
                {currentVocab.pronunciation}
              </div>
            )}
            {cardState.isAnswered && currentVocab.word && /[\u4e00-\u9faf]/.test(currentVocab.word) && (
              <div className="text-sm text-muted-foreground mt-2">
                Click on kanji to see details
              </div>
            )}
          </div>

          {/* Answer Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {answerOptions.map((option) => {
              const isCorrect = option === correctAnswer;
              const isSelected = option === cardState.selectedAnswer;

              let buttonVariant:
                | "default"
                | "destructive"
                | "secondary"
                | "outline" = "outline";
              if (cardState.isAnswered) {
                if (isCorrect) {
                  // Correct answer is now handled by className
                } else if (isSelected) {
                  buttonVariant = "destructive";
                }
              }

              return (
                <Button
                  key={option}
                  variant={buttonVariant}
                  size="lg"
                  onClick={() => handleAnswerSelect(option)}
                  disabled={cardState.isAnswered}
                  className={cn(
                    "h-auto py-4 text-base justify-center text-center whitespace-normal",
                    cardState.isAnswered &&
                      isCorrect &&
                      "bg-green-600 text-white hover:bg-green-700",
                    cardState.isAnswered && !isCorrect && !isSelected && "opacity-50",
                  )}
                >
                  {option}
                </Button>
              );
            })}
          </div>

          {cardState.isAnswered && (
            <div
              className={cn(
                "rounded-lg border px-4 py-3 space-y-3",
                cardState.lastResult === "CORRECT"
                  ? "border-green-500/40 bg-green-500/10"
                  : "border-amber-500/40 bg-amber-500/10",
              )}
            >
              <div className="flex items-center gap-2 font-semibold">
                {cardState.lastResult === "CORRECT" ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-amber-500" />
                )}
                <span>
                  {cardState.lastResult === "CORRECT"
                    ? "Correct"
                    : cardState.lastResult === "TIMEOUT"
                      ? "Time is up"
                      : "Incorrect"}
                </span>
              </div>
              <div className="text-sm md:text-base space-y-1">
                <div>
                  <span className="text-muted-foreground">Correct answer: </span>
                  <span className="font-semibold">{correctAnswer}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Meaning: </span>
                  <span>{currentVocab.meaning}</span>
                </div>
                {promptType === "WORD_TO_MEANING" && currentVocab.pronunciation && (
                  <div>
                    <span className="text-muted-foreground">Reading: </span>
                    <span>{currentVocab.pronunciation}</span>
                  </div>
                )}
              </div>
              <Button
                onClick={() => moveToNext(batchSummary)}
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Navigation & Info */}
          <div className="flex justify-between items-center pt-4 border-t">
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Stop
            </Button>
            <div className="text-sm md:text-base text-muted-foreground" suppressHydrationWarning>
              Last Review:{" "}
              {currentVocab.lastReviewDate
                ? new Date(currentVocab.lastReviewDate).toLocaleDateString(
                    "vi-VN",
                  )
                : "No review"}
            </div>
          </div>
        </CardContent>
      </Card>
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
