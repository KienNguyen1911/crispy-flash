'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Suspense } from 'react';

function CallbackContent() {
  const { get } = useSearchParams();
  const { push } = useRouter();
  const { setAuthTokens } = useAuth();
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    
    const token = get('token');
    const refreshToken = get('refreshToken');
    
    hasProcessed.current = true;
    
    if (token && refreshToken) {
      setAuthTokens(token, refreshToken);
      push('/');
    } else {
      push('/?error=Authentication-failed');
    }
  }, [searchParams, setAuthTokens, push]);

  return <div>Loading...</div>;
}

export default function CallbackHandler() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <CallbackContent />
    </Suspense>
  );
}