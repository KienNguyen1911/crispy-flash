import { Metadata } from 'next';
import CheckoutClient from './CheckoutClient';

export const metadata: Metadata = {
  title: 'Checkout - Flashcard Learning',
  description: 'Choose your subscription plan and complete your purchase',
};

export default function CheckoutPage() {
  return <CheckoutClient />;
}
