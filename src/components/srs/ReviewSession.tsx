'use client';

import { useState, useEffect } from 'react';
import { useDueReviews, useReviewSession } from '@/hooks/use-srs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ChevronRight, 
  ChevronLeft, 
  RotateCcw, 
  Check, 
  X, 
  Clock,
  Brain,
  Volume2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { VocabularyWithSrs } from '@/lib/api';

interface ReviewSessionProps {
  onComplete?: () => void;
  onCancel?: () => void;
}

const QUALITY_LEVELS = [
  { value: 0, label: 'Khó', color: 'destructive', description: 'Không nhớ hoặc rất khó nhớ' },
  { value: 3, label: 'Trung bình', color: 'warning', description: 'Nhớ với effort trung bình' },
  { value: 5, label: 'Dễ', color: 'success', description: 'Nhớ dễ dàng' },
];

export function ReviewSession({ onComplete, onCancel }: ReviewSessionProps) {
  const { dueReviews, isLoading } = useDueReviews();
  const { submitFeedback } = useReviewSession();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [sessionReviews, setSessionReviews] = useState<VocabularyWithSrs[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date>(new Date());

  useEffect(() => {
    if (dueReviews.length > 0 && sessionReviews.length === 0) {
      setSessionReviews(dueReviews);
      setSessionStartTime(new Date());
    }
  }, [dueReviews, sessionReviews.length]);

  if (isLoading) {
    return <ReviewSessionSkeleton />;
  }

  if (sessionReviews.length === 0) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <Brain className="h-12 w-12 mx-auto text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold">Không có từ nào cần ôn tập</h3>
              <p className="text-sm text-muted-foreground">
                Hãy quay lại sau khi học thêm từ mới!
              </p>
            </div>
            <Button onClick={onCancel}>Quay lại</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentVocab = sessionReviews[currentIndex];
  const progress = ((currentIndex + 1) / sessionReviews.length) * 100;
  const isLastCard = currentIndex === sessionReviews.length - 1;

  const handleQualitySelect = async (quality: number) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const timeSpent = Math.round((new Date().getTime() - sessionStartTime.getTime()) / 1000);
      
      // Chuyển đổi quality thành status cho backend (3 level mới)
      let status: 'UNKNOWN' | 'REMEMBERED' | 'NOT_REMEMBERED';
      if (quality === 0) {
        status = 'NOT_REMEMBERED'; // Khó - không nhớ
      } else if (quality === 3) {
        status = 'UNKNOWN'; // Trung bình - không chắc chắn
      } else {
        status = 'REMEMBERED'; // Dễ - nhớ rõ
      }

      submitFeedback(currentVocab.id, {
        quality,
        timeSpent,
        status,
      });

      // Move to next card or complete session
      if (isLastCard) {
        onComplete?.();
      } else {
        setCurrentIndex(currentIndex + 1);
        setShowAnswer(false);
        setSessionStartTime(new Date());
      }
    } catch (error) {
      console.error('Failed to submit review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (!showAnswer) {
      setShowAnswer(true);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowAnswer(false);
      setSessionStartTime(new Date());
    }
  };

  const playAudio = () => {
    // Phát âm tiếng Nhật với Kanji/Kana ưu tiên
    if ('speechSynthesis' in window) {
      const textToSpeak = currentVocab.kanji || currentVocab.kana || currentVocab.word;
      if (textToSpeak) {
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.lang = 'ja-JP';
        speechSynthesis.speak(utterance);
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Tiến độ ôn tập</span>
          <span>{currentIndex + 1} / {sessionReviews.length}</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Main Card */}
      <Card className="relative">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <CardTitle>Ôn tập từ vựng</CardTitle>
              <CardDescription>
                {showAnswer ? 'Đánh giá mức độ nhớ của bạn' : 'Hãy cố gắng nhớ nghĩa của từ'}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                <Clock className="h-3 w-3 mr-1" />
                {currentVocab.interval} ngày
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Word Display */}
          <div className="text-center space-y-4">
            {/* Hiển thị Kanji/Kana ưu tiên */}
            {(currentVocab.kanji || currentVocab.kana) && (
              <div className="text-5xl font-bold text-primary">
                {currentVocab.kanji || currentVocab.kana}
              </div>
            )}
            {/* Hiển thị từ gốc nếu khác với Kanji/Kana */}
            <div className={`font-semibold text-secondary ${
              (currentVocab.kana) ? 'text-2xl' : 'text-4xl'
            }`}>
              {currentVocab.kana}
            </div>
            {currentVocab.pronunciation && (
              <div className="text-lg text-muted-foreground">
                {currentVocab.pronunciation}
              </div>
            )}
            {/* <Button
              variant="ghost"
              size="sm"
              onClick={playAudio}
              className="mx-auto"
            >
              <Volume2 className="h-4 w-4 mr-2" />
              Phát âm
            </Button> */}
          </div>

          {/* Answer Section */}
          {showAnswer && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="border-t pt-4">
                <div className="text-center space-y-2">
                  <div className="text-2xl font-semibold text-green-600">
                    {currentVocab.meaning}
                  </div>
                  {currentVocab.example && (
                    <div className="text-sm text-muted-foreground italic">
                      Ví dụ: {currentVocab.example}
                    </div>
                  )}
                </div>
              </div>

              {/* Quality Selection */}
              <div className="space-y-3">
                <div className="text-sm font-medium text-center">
                  Bạn nhớ từ này như thế nào?
                </div>
                <div className="grid md:grid-cols-3 gap-2 sm:grid-cols-1">
                  {QUALITY_LEVELS.map((level) => (
                    <Button
                      key={level.value}
                      variant={level.color as any}
                      size="sm"
                      onClick={() => handleQualitySelect(level.value)}
                      disabled={isSubmitting}
                      className={cn(
                        'py-8',
                        level.color === 'destructive' && 'bg-red-500 hover:bg-red-600',
                        level.color === 'warning' && 'bg-yellow-500 hover:bg-yellow-600',
                        level.color === 'secondary' && 'bg-gray-500 hover:bg-gray-600',
                        level.color === 'success' && 'bg-green-500 hover:bg-green-600'
                      )}
                    >
                      <div className="text-center">
                        <div className="font-medium">{level.label}</div>
                        <div className="text-xs opacity-90">{level.description}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentIndex === 0 || isSubmitting}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Trước
            </Button>

            {!showAnswer ? (
              <Button onClick={handleNext}>
                Hiện đáp án
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                onClick={() => setShowAnswer(false)}
                disabled={isSubmitting}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Ẩn đáp án
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Session Info */}
      <div className="text-center text-sm text-muted-foreground">
        Lần ôn tập trước: {currentVocab.lastReviewDate 
          ? new Date(currentVocab.lastReviewDate).toLocaleDateString('vi-VN')
          : 'Chưa ôn tập lần nào'
        }
      </div>
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