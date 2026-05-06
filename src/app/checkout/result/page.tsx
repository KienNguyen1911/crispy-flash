import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Payment Result',
  description: 'View your payment verification result.',
};

async function verifyPayment(searchParams: Record<string, string>) {
  try {
    const queryString = new URLSearchParams(searchParams).toString();
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/payment/verify?${queryString}`, {
      cache: 'no-store',
    });
    
    if (!response.ok) return 'failed';
    
    const data = await response.json();
    return data.status === 'SUCCESS' ? 'success' : 'failed';
  } catch (error) {
    console.error('Payment verification error:', error);
    return 'failed';
  }
}

export default async function CheckoutResultPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const status = await verifyPayment(params);

  return (
    <div className="container mx-auto py-20 flex justify-center px-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4">
            {status === 'success' ? (
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
            {status === 'success' ? 'Payment Successful!' : 'Payment Failed'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {status === 'success'
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
    </div>
  );
}
