'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function CallbackHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setAuthTokens } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    const refreshToken = searchParams.get('refreshToken');
    if (token && refreshToken) {
      setAuthTokens(token, refreshToken); // Lưu vao localStorage qua AuthContext
      router.replace('/'); // replace để token không còn trong browser history
    } else {
      router.replace('/?error=Authentication-failed');
    }
  }, [searchParams, router, setAuthTokens]);

  return <div>Loading...</div>;
}