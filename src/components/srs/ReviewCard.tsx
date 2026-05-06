"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { VocabularyWithSrs } from "@/types/srs";
import type { ReviewAttemptResult } from "@/types/srs";
import { KanjiWord } from "./KanjiWord";

interface ReviewCardProps {
  vocab: VocabularyWithSrs | null;
  isAnswered: boolean;
  selectedAnswer: string | null;
  lastResult: ReviewAttemptResult | null;
  timeLeft: number;
  answerOptions: string[];
  correctAnswer: string;
  isSubmitting: boolean;
  onAnswerSelect: (answer: string | null) => void;
  onKanjiClick: (word: string, kanji: string) => void;
  currentIndex: number;
  totalCount: number;
}

export function ReviewCard({
  vocab,
  isAnswered,
  selectedAnswer,
  lastResult,
  timeLeft,
  answerOptions,
  correctAnswer,
  isSubmitting,
  onAnswerSelect,
  onKanjiClick,
  currentIndex,
  totalCount
}: ReviewCardProps) {
  if (!vocab) return null;

  const promptType = vocab.promptType || "WORD_TO_MEANING";
  const displayText =
    promptType === "WORD_TO_READING" ? vocab.word : vocab.word;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            {currentIndex + 1} / {totalCount}
          </CardTitle>
          <Badge variant="outline">
            <Clock className="mr-1 h-4 w-4" />
            {timeLeft}s
          </Badge>
        </div>
        <Progress value={(timeLeft / 10) * 100} className="mt-2" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">
            {promptType === "WORD_TO_READING" ? "Reading" : "Meaning"}
          </p>
          <div className="text-4xl font-bold mb-4">
            <KanjiWord word={displayText} onKanjiClick={onKanjiClick} />
          </div>
        </div>

        {vocab.exampleSentence && (
          <div className="bg-muted p-4 rounded-lg text-sm">
            <p className="text-muted-foreground mb-1">Example:</p>
            <p>{vocab.exampleSentence}</p>
          </div>
        )}

        <div className="space-y-2">
          {answerOptions.map((option) => {
            const isCorrectOption = option === correctAnswer;
            const isSelected = option === selectedAnswer;
            const showCorrect = isAnswered && isCorrectOption;
            const showIncorrect = isAnswered && isSelected && !isCorrectOption;

            return (
              <Button
                key={option}
                variant="outline"
                className={cn(
                  "w-full justify-start text-left h-auto py-3 px-4",
                  showCorrect && "border-green-500 bg-green-50",
                  showIncorrect && "border-red-500 bg-red-50",
                  isSelected && !isAnswered && "border-blue-500"
                )}
                onClick={() => !isAnswered && onAnswerSelect(option)}
                disabled={isAnswered || isSubmitting}
              >
                <span className="flex-1">{option}</span>
                {showCorrect && <CheckCircle2 className="h-5 w-5 text-green-500 ml-2" />}
                {showIncorrect && <XCircle className="h-5 w-5 text-red-500 ml-2" />}
              </Button>
            );
          })}
        </div>

        {isAnswered && (
          <div className={cn(
            "p-3 rounded-lg text-sm",
            lastResult === "CORRECT"
              ? "bg-green-50 text-green-800"
              : lastResult === "TIMEOUT"
              ? "bg-yellow-50 text-yellow-800"
              : "bg-red-50 text-red-800"
          )}>
            {lastResult === "CORRECT" && "✓ Correct!"}
            {lastResult === "INCORRECT" && "✗ Incorrect"}
            {lastResult === "TIMEOUT" && "⏱ Time's up!"}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
