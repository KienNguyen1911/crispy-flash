import { Suspense } from 'react';
import CallbackHandler from './CallbackHandler';

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CallbackHandler />
    </Suspense>
  );
}