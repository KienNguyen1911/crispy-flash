'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Check, CreditCard, Wallet, Building2 } from 'lucide-react';
// Assuming shadcn components exist, if not we fall back to standard tailwind
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

const plans = [
  {
    id: 'pro-monthly',
    name: 'Pro Monthly',
    price: 49000,
    currency: 'VND',
    description: 'Perfect for short-term learning',
    features: ['Unlimited AI Generation', 'Advanced SRS', 'Priority Support'],
  },
  {
    id: 'pro-yearly',
    name: 'Pro Yearly',
    price: 399000,
    currency: 'VND',
    description: 'Best value for serious learners',
    features: ['All Pro features', 'Save 30%', 'Offline Mode'],
    popular: true,
  },
  {
    id: 'lifetime',
    name: 'Lifetime',
    price: 1299000,
    currency: 'VND',
    description: 'One-time payment, forever access',
    features: ['All future updates', 'No recurring fees', 'VIP Badge'],
  },
];

export default function CheckoutPage() {
  const { token, isAuthenticated } = useAuth();
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState(plans[1]);
  const [paymentMethod, setPaymentMethod] = useState('STRIPE');
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (!isAuthenticated || !token) {
      toast.error('Please login to continue');
      router.push('/login');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payment/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // Ensure session has accessToken
        },
        body: JSON.stringify({
            amount: selectedPlan.price,
            provider: paymentMethod, // STRIPE, MOMO, VNPAY
            currency: selectedPlan.currency,
            description: `Payment for ${selectedPlan.name}`,
        }),
      });

      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error('Failed to create payment link');
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-center mb-10">Choose Your Plan</h1>
      
      <div className="grid md:grid-cols-3 gap-8 mb-12">
        {plans.map((plan) => (
          <Card 
            key={plan.id} 
            className={`relative cursor-pointer transition-all ${selectedPlan.id === plan.id ? 'border-primary ring-2 ring-primary/20' : 'hover:border-primary/50'}`}
            onClick={() => setSelectedPlan(plan)}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold">
                Most Popular
              </div>
            )}
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-4">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(plan.price)}
                {plan.id !== 'lifetime' && <span className="text-sm font-normal text-muted-foreground">/{plan.id.includes('monthly') ? 'mo' : 'yr'}</span>}
              </div>
              <ul className="space-y-2">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center text-sm">
                    <Check className="w-4 h-4 mr-2 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
            <CardTitle>Payment Method</CardTitle>
            <CardDescription>Select a secure payment method</CardDescription>
        </CardHeader>
        <CardContent>
            <RadioGroup defaultValue="STRIPE" onValueChange={setPaymentMethod} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <RadioGroupItem value="STRIPE" id="stripe" className="peer sr-only" />
                    <Label
                        htmlFor="stripe"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                        <CreditCard className="mb-3 h-6 w-6" />
                        International Card (Stripe)
                    </Label>
                </div>
                <div>
                    <RadioGroupItem value="MOMO" id="momo" className="peer sr-only" />
                    <Label
                        htmlFor="momo"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                        <Wallet className="mb-3 h-6 w-6" />
                        MoMo Wallet
                    </Label>
                </div>
                <div>
                    <RadioGroupItem value="VNPAY" id="vnpay" className="peer sr-only" />
                    <Label
                        htmlFor="vnpay"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                        <Building2 className="mb-3 h-6 w-6" />
                        VNPay (Bank)
                    </Label>
                </div>
            </RadioGroup>
        </CardContent>
        <CardFooter>
            <Button className="w-full" size="lg" onClick={handleCheckout} disabled={loading}>
                {loading ? 'Processing...' : `Pay ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedPlan.price)}`}
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
