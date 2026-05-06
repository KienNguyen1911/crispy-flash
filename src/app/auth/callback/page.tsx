import { Suspense } from 'react';
import CallbackHandler from './CallbackHandler';

export const metadata = {
  title: 'Authentication Callback',
  description: 'Processing your authentication...',
};

function LoadingFallback() {
  return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CallbackHandler />
    </Suspense>
  );
}