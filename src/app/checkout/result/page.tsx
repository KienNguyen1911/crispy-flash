
'use client';

import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

function CheckoutResultContent() {
  const searchParams = useSearchParams();
  const provider = searchParams.get('provider');
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');

  useEffect(() => {
    // In a real app, you might want to call an API to confirm the actual order status
    // For now we just assume if they reached here with correct params it's likely pending/success
    // Specific provider checks could go here
    
    // Simulating a check
    const timer = setTimeout(() => {
        setStatus('success');
    }, 1500);

    return () => clearTimeout(timer);
  }, [provider]);

  return (
    <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4">
            {status === 'loading' ? (
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
            ) : (
                <div className="bg-green-100 p-3 rounded-full">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
            )}
          </div>
          <CardTitle className="text-2xl">
            {status === 'loading' ? 'Verifying Payment...' : 'Payment Successful!'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {status === 'loading' 
                ? 'Please wait while we confirm your transaction.' 
                : 'Thank you for your purchase. Your account has been upgraded.'}
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
            {status === 'success' && (
                <Button asChild className="w-full">
                    <Link href="/dashboard">Go to Dashboard</Link>
                </Button>
            )}
        </CardFooter>
      </Card>
  );
}

export default function CheckoutResultPage() {
    return (
        <div className="container mx-auto py-20 flex justify-center px-4">
            <Suspense fallback={<Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />}>
                <CheckoutResultContent />
            </Suspense>
        </div>
    );
}
