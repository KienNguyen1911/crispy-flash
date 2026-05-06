'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { redirect } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Suspense } from 'react';

function CallbackContent() {
  const searchParams = useSearchParams();
  const { setAuthTokens } = useAuth();
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    
    const token = searchParams.get('token');
    const refreshToken = searchParams.get('refreshToken');
    
    hasProcessed.current = true;
    
    if (token && refreshToken) {
      setAuthTokens(token, refreshToken);
      redirect('/');
    } else {
      redirect('/?error=Authentication-failed');
    }
  }, [searchParams, setAuthTokens]);

  return <div>Loading...</div>;
}

export default function CallbackHandler() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <CallbackContent />
    </Suspense>
  );
}