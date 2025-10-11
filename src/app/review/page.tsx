'use client';

import { useState } from 'react';
import { ReviewDashboard } from '@/components/srs/ReviewDashboard';
import { ReviewSession } from '@/components/srs/ReviewSession';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Brain } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ReviewPage() {
  const router = useRouter();
  const [isInSession, setIsInSession] = useState(false);

  const handleStartSession = () => {
    setIsInSession(true);
  };

  const handleCompleteSession = () => {
    setIsInSession(false);
  };

  const handleCancelSession = () => {
    setIsInSession(false);
  };

  return (
    <div className="container mx-auto py-6 px-4 max-w-6xl">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-blue-600" />
              <h1 className="text-2xl font-bold">Ôn tập thông minh</h1>
            </div>
          </div>
          {!isInSession && (
            <Button onClick={handleStartSession}>
              Bắt đầu ôn tập
            </Button>
          )}
        </div>
      </div>

      {isInSession ? (
        <ReviewSession
          onComplete={handleCompleteSession}
          onCancel={handleCancelSession}
        />
      ) : (
        <ReviewDashboard />
      )}
    </div>
  );
}