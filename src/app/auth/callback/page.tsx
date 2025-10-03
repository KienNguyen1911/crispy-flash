'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function AuthCallback() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setAuthToken } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    console.log('Token:', token);
    if (token) {
      setAuthToken(token);
      router.push('/');
    } else {
      // Handle cases where token is not present
      router.push('/?error=Authentication-failed');
    }
  }, [searchParams, router, setAuthToken]);

  return <div>Loading...</div>;
}