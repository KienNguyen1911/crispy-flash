"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
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
import { ChevronLeft, Brain, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { VocabularyWithSrs } from "@/lib/api";

interface ReviewSessionProps {
  projectId?: string;
  onComplete?: () => void;
  onCancel?: () => void;
}

const TIME_LIMIT = 10; // 10 seconds per card

// Helper to shuffle array
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

  // New state for multiple choice & timer
  const [answerOptions, setAnswerOptions] = useState<string[]>([]);
  const [isAnswered, setIsAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);

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

  // Generate answer options when card changes
  useEffect(() => {
    if (!currentVocab || sessionReviews.length < 2) return;

    // Reset answer state when card changes to prevent mobile ghost clicks
    setIsAnswered(false);
    setSelectedAnswer(null);
    setTimeLeft(TIME_LIMIT);

    const distractors = sessionReviews
      .filter((v) => v.id !== currentVocab.id)
      .map((v) => v.meaning);

    const uniqueDistractors = [...new Set(distractors)];
    const shuffledDistractors = shuffleArray(uniqueDistractors).slice(0, 3);

    const options = shuffleArray([
      ...shuffledDistractors,
      currentVocab.meaning,
    ]);
    setAnswerOptions(options);
  }, [currentVocab, sessionReviews]);

  // Timer logic
  useEffect(() => {
    if (!currentVocab || isAnswered) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    if (timeLeft <= 0) {
      clearInterval(timer);
      handleAnswerSelect(null); // Auto-submit when time is up
    }

    return () => clearInterval(timer);
  }, [timeLeft, currentVocab, isAnswered]);

  const moveToNext = useCallback(() => {
    if (currentIndex === sessionReviews.length - 1) {
      onComplete?.();
    } else {
      setCurrentIndex((prev) => prev + 1);
      setIsAnswered(false);
      setSelectedAnswer(null);
      setTimeLeft(TIME_LIMIT);
    }
  }, [currentIndex, sessionReviews.length, onComplete]);

  const handleAnswerSelect = useCallback(
    async (selectedMeaning: string | null) => {
      if (isAnswered) return;

      setIsAnswered(true);
      setIsSubmitting(true);
      setSelectedAnswer(selectedMeaning);

      const timeSpent = TIME_LIMIT - timeLeft;
      const isCorrect = selectedMeaning === currentVocab?.meaning;

      let quality: number;
      if (!isCorrect || timeSpent > 7) {
        quality = 0; // Hard
      } else if (timeSpent > 4) {
        quality = 3; // Medium
      } else {
        quality = 5; // Easy
      }

      const status = isCorrect ? "REMEMBERED" : "NOT_REMEMBERED";

      try {
        if (currentVocab) {
          await submitFeedback(currentVocab.id, { quality, timeSpent, status });
        }
      } catch (error) {
        console.error("Failed to submit review:", error);
      } finally {
        setIsSubmitting(false);
        // Wait a moment to show feedback before moving to the next card
        setTimeout(
          () => {
            moveToNext();
          },
          isCorrect ? 1000 : 2000,
        ); // Longer delay for incorrect answers
      }
    },
    [isAnswered, timeLeft, currentVocab, submitFeedback, moveToNext],
  );

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

  const progress = ((currentIndex + 1) / sessionReviews.length) * 100;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Progress Bar & Timer */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm md:text-base font-medium">
          <span>
            Progress: {currentIndex + 1} / {sessionReviews.length}
          </span>
          <span className="flex items-center">
            <Clock className="h-4 w-4 mr-1.5" />
            {timeLeft}s
          </span>
        </div>
        <Progress
          value={(timeLeft / TIME_LIMIT) * 100}
          className="h-2 transition-all duration-1000 linear"
        />
      </div>

      {/* Main Card */}
      <Card className="relative">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <CardTitle>What is the meaning of this word?</CardTitle>
              <CardDescription>
                Select the correct answer within {TIME_LIMIT} seconds.
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
            <div className="text-5xl font-bold text-primary">
              {currentVocab.word || currentVocab.pronunciation}
            </div>
            {currentVocab.pronunciation && (
              <div className="text-2xl font-semibold text-secondary">
                {currentVocab.pronunciation}
              </div>
            )}
          </div>

          {/* Answer Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {answerOptions.map((option, index) => {
              const isCorrect = option === currentVocab.meaning;
              const isSelected = option === selectedAnswer;

              let buttonVariant:
                | "default"
                | "destructive"
                | "secondary"
                | "outline" = "outline";
              if (isAnswered) {
                if (isCorrect) {
                  // Correct answer is now handled by className
                } else if (isSelected) {
                  buttonVariant = "destructive";
                }
              }

              return (
                <Button
                  key={index}
                  variant={buttonVariant}
                  size="lg"
                  onClick={() => handleAnswerSelect(option)}
                  disabled={isAnswered}
                  className={cn(
                    "h-auto py-4 text-base justify-center text-center whitespace-normal",
                    isAnswered &&
                      isCorrect &&
                      "bg-green-600 text-white hover:bg-green-700",
                    isAnswered && !isCorrect && !isSelected && "opacity-50",
                  )}
                >
                  {option}
                </Button>
              );
            })}
          </div>

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
            <div className="text-sm md:text-base text-muted-foreground">
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
