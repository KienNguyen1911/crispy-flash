
'use client';

import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

function CheckoutResultContent() {
  const searchParams = useSearchParams();
  const provider = searchParams.get('provider');
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');

  useEffect(() => {
    if (!provider) {
        setStatus('failed');
        return;
    }

    const verifyPayment = async () => {
        try {
            const queryString = searchParams.toString();
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payment/verify?${queryString}`);
            
            if (!response.ok) {
                throw new Error('Verification request failed');
            }
            
            const data = await response.json();

            if (data.status === 'SUCCESS') {
                setStatus('success');
            } else {
                setStatus('failed');
            }
        } catch (error) {
            console.error('Payment verification error:', error);
            setStatus('failed');
        }
    };

    verifyPayment();
  }, [provider, searchParams]);

  return (
    <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4">
            {status === 'loading' ? (
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
            ) : status === 'success' ? (
                <div className="bg-green-100 p-3 rounded-full">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
            ) : (
                <div className="bg-red-100 p-3 rounded-full">
                    <XCircle className="w-8 h-8 text-red-600" />
                </div>
            )}
          </div>
          <CardTitle className="text-2xl">
            {status === 'loading' 
                ? 'Verifying Payment...' 
                : status === 'success' 
                    ? 'Payment Successful!' 
                    : 'Payment Failed'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {status === 'loading' 
                ? 'Please wait while we confirm your transaction.' 
                : status === 'success'
                    ? 'Thank you for your purchase. Your account has been upgraded.'
                    : 'We could not verify your payment. Please try again or contact support.'}
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
            {status === 'success' && (
                <Button asChild className="w-full">
                    <Link href="/dashboard">Go to Dashboard</Link>
                </Button>
            )}
            {status === 'failed' && (
                <Button asChild variant="outline" className="w-full">
                    <Link href="/checkout">Try Again</Link>
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
