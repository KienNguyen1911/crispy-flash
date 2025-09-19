'use client';

import { useState, useContext, useEffect, useMemo } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { AppDataContext } from '@/context/AppDataContext';
import { notFound } from 'next/navigation';
import Flashcard from './Flashcard';
import ProgressSummary from './ProgressSummary';
import { Button } from '../ui/button';
import { ArrowLeft, ArrowRight, Check, X } from 'lucide-react';
import { Progress } from '../ui/progress';
import { Card, CardContent } from '../ui/card';
import Link from 'next/link';
import type { Vocabulary } from '@/lib/types';

export function LearningSession() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getTopicById, updateVocabularyStatus } = useContext(AppDataContext);

  const projectId = params.projectId as string;
  const topicId = params.topicId as string;
  
  const topic = getTopicById(projectId, topicId);
  
  const filterNotRemembered = searchParams.get('filter') === 'not_remembered';
  
  const initialVocabulary = useMemo(() => {
    if (!topic) return [];
    return filterNotRemembered 
      ? topic.vocabulary.filter(v => v.status === 'not_remembered')
      : topic.vocabulary;
  }, [topic, filterNotRemembered]);

  const [shuffledVocabulary, setShuffledVocabulary] = useState<Vocabulary[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionProgress, setSessionProgress] = useState<{ [key: string]: 'remembered' | 'not_remembered' }>({});
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Shuffle vocabulary only on the client side
    setShuffledVocabulary([...initialVocabulary].sort(() => Math.random() - 0.5));
    // Reset state for a new session (e.g., when filter changes)
    setCurrentIndex(0);
    setSessionProgress({});
    setIsFinished(false);
  }, [initialVocabulary]);
  
  useEffect(() => {
    if (isClient && shuffledVocabulary.length > 0 && currentIndex >= shuffledVocabulary.length) {
      setIsFinished(true);
    }
  }, [currentIndex, shuffledVocabulary.length, isClient]);

  if (!isClient) {
    return null; // Render nothing on the server to avoid hydration mismatch
  }

  if (!topic) {
    return notFound();
  }
  
  if (shuffledVocabulary.length === 0 && isClient) {
    return (
        <div className="container mx-auto max-w-2xl py-8 px-4 text-center">
            <h1 className="text-2xl font-bold font-headline mb-4">Session Complete!</h1>
            <p className="text-muted-foreground mb-6">
                {filterNotRemembered ? "You've reviewed all your 'not remembered' words." : "There are no words in this topic to learn."}
            </p>
            <Button asChild>
                <Link href={`/projects/${projectId}/topics/${topicId}`}>Back to Topic</Link>
            </Button>
        </div>
    )
  }

  const currentCard = shuffledVocabulary[currentIndex];

  const handleMark = (status: 'remembered' | 'not_remembered') => {
    if (!currentCard) return;

    // Record progress for the current card
    setSessionProgress(prev => ({ ...prev, [currentCard.id]: status }));
    updateVocabularyStatus(projectId, topicId, currentCard.id, status);

    // Check if this is the last card
    if (currentIndex === shuffledVocabulary.length - 1) {
      setIsFinished(true);
    } else {
      goToNext();
    }
  };

  const goToNext = () => {
    setCurrentIndex(prev => prev + 1);
  };
  
  const restartSession = () => {
    setShuffledVocabulary([...initialVocabulary].sort(() => Math.random() - 0.5));
    setCurrentIndex(0);
    setSessionProgress({});
    setIsFinished(false);
  };

  if (isFinished) {
    return <ProgressSummary sessionProgress={sessionProgress} onRestart={restartSession} />;
  }

  const progressPercentage = (currentIndex / shuffledVocabulary.length) * 100;

  return (
    <div className="container mx-auto max-w-2xl py-8 px-4 flex flex-col items-center">
      <div className="w-full mb-8">
        <div className="flex justify-between items-center mb-2">
            <h2 className="font-headline text-xl">{topic.title}</h2>
            <span className="text-sm text-muted-foreground">{Math.min(currentIndex + 1, shuffledVocabulary.length)} / {shuffledVocabulary.length}</span>
        </div>
        <Progress value={progressPercentage} />
      </div>
      
      <Flashcard vocabulary={currentCard} />

      <Card className="w-full mt-8">
        <CardContent className="p-4 flex justify-center items-center gap-4">
            <Button className="flex-1 bg-red-500 hover:bg-red-600" size="lg" onClick={() => handleMark('not_remembered')}>
                <X className="mr-2 h-5 w-5" />
                Didn&apos;t Remember
            </Button>
            <Button className="flex-1 bg-green-500 hover:bg-green-600" size="lg" onClick={() => handleMark('remembered')}>
                <Check className="mr-2 h-5 w-5" />
                Remembered
            </Button>
        </CardContent>
      </Card>
      
    </div>
  );
}
