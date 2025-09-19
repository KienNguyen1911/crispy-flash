'use client';

import { useState, useContext, useEffect, useMemo } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { AppDataContext } from '@/context/AppDataContext';
import { notFound } from 'next/navigation';
import Flashcard from './Flashcard';
import ProgressSummary from './ProgressSummary';
import { Button } from '../ui/button';
import { ArrowLeft, ArrowRight, RotateCw, Check, X } from 'lucide-react';
import { Progress } from '../ui/progress';
import { Card, CardContent } from '../ui/card';
import Link from 'next/link';

export function LearningSession() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getTopicById, updateVocabularyStatus } = useContext(AppDataContext);

  const projectId = params.projectId as string;
  const topicId = params.topicId as string;
  
  const topic = getTopicById(projectId, topicId);
  
  const filterNotRemembered = searchParams.get('filter') === 'not_remembered';
  
  const sessionVocabulary = useMemo(() => {
    if (!topic) return [];
    const vocab = filterNotRemembered 
      ? topic.vocabulary.filter(v => v.status === 'not_remembered')
      : topic.vocabulary;
    return [...vocab].sort(() => Math.random() - 0.5); // Shuffle cards
  }, [topic, filterNotRemembered]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionProgress, setSessionProgress] = useState<{ [key: string]: 'remembered' | 'not_remembered' }>({});
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (sessionVocabulary.length > 0 && currentIndex >= sessionVocabulary.length) {
      setIsFinished(true);
    }
  }, [currentIndex, sessionVocabulary.length]);

  if (!topic) {
    return notFound();
  }
  
  if (sessionVocabulary.length === 0) {
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

  const currentCard = sessionVocabulary[currentIndex];

  const handleMark = (status: 'remembered' | 'not_remembered') => {
    if (!currentCard) return;
    updateVocabularyStatus(projectId, topicId, currentCard.id, status);
    setSessionProgress(prev => ({ ...prev, [currentCard.id]: status }));
    goToNext();
  };

  const goToNext = () => {
    setCurrentIndex(prev => prev + 1);
  };
  
  const goToPrev = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
  };
  
  const restartSession = () => {
    setCurrentIndex(0);
    setSessionProgress({});
    setIsFinished(false);
    // Re-shuffle would be good here, but a simple restart is fine
  };

  if (isFinished) {
    return <ProgressSummary sessionProgress={sessionProgress} onRestart={restartSession} />;
  }

  const progressPercentage = (currentIndex / sessionVocabulary.length) * 100;

  return (
    <div className="container mx-auto max-w-2xl py-8 px-4 flex flex-col items-center">
      <div className="w-full mb-8">
        <div className="flex justify-between items-center mb-2">
            <h2 className="font-headline text-xl">{topic.title}</h2>
            <span className="text-sm text-muted-foreground">{currentIndex + 1} / {sessionVocabulary.length}</span>
        </div>
        <Progress value={progressPercentage} />
      </div>
      
      <Flashcard vocabulary={currentCard} />

      <Card className="w-full mt-8">
        <CardContent className="p-4 flex justify-center items-center gap-4">
             <Button variant="outline" size="icon" onClick={goToPrev} disabled={currentIndex === 0}>
                <ArrowLeft className="h-5 w-5" />
            </Button>
            <Button className="flex-1 bg-red-500 hover:bg-red-600" size="lg" onClick={() => handleMark('not_remembered')}>
                <X className="mr-2 h-5 w-5" />
                Didn&apos;t Remember
            </Button>
            <Button className="flex-1 bg-green-500 hover:bg-green-600" size="lg" onClick={() => handleMark('remembered')}>
                <Check className="mr-2 h-5 w-5" />
                Remembered
            </Button>
            <Button variant="outline" size="icon" onClick={goToNext} disabled={currentIndex >= sessionVocabulary.length -1}>
                <ArrowRight className="h-5 w-5" />
            </Button>
        </CardContent>
      </Card>
      
    </div>
  );
}
