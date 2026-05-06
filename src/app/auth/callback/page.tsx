import CallbackHandler from './CallbackHandler';

export const metadata = {
  title: 'Authentication Callback',
  description: 'Processing your authentication...',
};

export const dynamic = 'force-dynamic';

export default function AuthCallbackPage() {
  return <CallbackHandler />;
}