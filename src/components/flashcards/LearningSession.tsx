'use client';

import { useState, useContext, useEffect, useMemo } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { TopicContext } from '@/context/TopicContext';
import { notFound } from 'next/navigation';
import Flashcard from './Flashcard';
import ProgressSummary from './ProgressSummary';
import { Button } from '../ui/button';
import { ArrowLeft, ArrowRight, RotateCw } from 'lucide-react';
import { Progress } from '../ui/progress';
import { Card, CardContent } from '../ui/card';
import Link from 'next/link';
import type { Vocabulary } from '@/lib/types';

export function LearningSession({ initialTopic }: { initialTopic?: any } = {}) {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getTopicById } = useContext(TopicContext);

  const projectId = params.projectId as string;
  const topicId = params.topicId as string;
  
  let topic = getTopicById(projectId, topicId);
  // If TopicContext doesn't have the topic (because we navigated directly to learn),
  // fall back to the server-provided initialTopic prop.
  if (!topic && initialTopic && initialTopic.id === topicId) {
    topic = initialTopic;
  }
  
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
    if (shuffledVocabulary.length > 0 && currentIndex >= shuffledVocabulary.length) {
      setIsFinished(true);
    }
  }, [currentIndex, shuffledVocabulary.length]);

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

  // Previously we had handleMark to update vocabulary status when marking remembered/not-remembered.
  // That logic has been removed per request; navigation and review bookmarking remain UI-only.

  // UI-only handlers for navigation and review bookmarking
  const goToPrevious = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
  };

  const requestReview = () => {
    if (!currentCard) return;
    // UI-only: add to local sessionProgress as 'not_remembered' for now
    setSessionProgress(prev => ({ ...prev, [currentCard.id]: 'not_remembered' }));
    // The user said they'll handle persistence; this is a placeholder hook.

    setCurrentIndex(prev => prev + 1);
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
  
  // ✅ Fixed progress logic
  const totalCards = shuffledVocabulary.length;
  const completedCards = isFinished ? totalCards : currentIndex + 1;
  const progressPercentage = totalCards > 0 ? (completedCards / totalCards) * 100 : 0;
  const currentCardNumber = Math.min(currentIndex + 1, totalCards);

  return (
    <div className="container mx-auto max-w-2xl py-8 px-4 flex flex-col items-center">
      <div className="w-full mb-8">
        <div className="flex justify-between items-center mb-2">
            <h2 className="font-headline text-xl">{topic.title}</h2>
            <span className="text-sm text-muted-foreground">{currentIndex + 1} / {shuffledVocabulary.length}</span>
        </div>
        <Progress value={progressPercentage} />
      </div>
      
      {currentCard && <Flashcard vocabulary={currentCard} />}

      <Card className="w-full mt-8">
        <CardContent className="p-4 flex justify-center items-center gap-4">
          <Button variant="outline" size="icon" onClick={goToPrevious} disabled={currentIndex === 0} aria-label="Back">
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <Button className="flex-1 bg-red-500 hover:bg-red-600 text-white" size="lg" onClick={() => {
            // forget: mark as not remembered and advance
            const card = shuffledVocabulary[currentIndex];
            if (card) {
              setSessionProgress(prev => ({ ...prev, [card.id]: 'not_remembered' }));
              setCurrentIndex(prev => prev + 1);
            }
          }} aria-label="Forget and Next">
            <RotateCw className="mr-2 h-5 w-5" />
            Forget
          </Button>

          <Button variant="outline" size="icon" onClick={() => {
            // remember: mark as remembered and advance
            const card = shuffledVocabulary[currentIndex];
            if (card) {
              setSessionProgress(prev => ({ ...prev, [card.id]: 'remembered' }));
              setCurrentIndex(prev => prev + 1);
            }
          }} aria-label="Remember and Next">
            <ArrowRight className="h-5 w-5" />
          </Button>
        </CardContent>
      </Card>
      
    </div>
  );
}
