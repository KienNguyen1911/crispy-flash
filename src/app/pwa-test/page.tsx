import { Metadata } from 'next';
import PWATestClient from './PWATestClient';

export const metadata: Metadata = {
  title: 'PWA Test - Flashcard Learning',
  description: 'Test Progressive Web App capabilities',
};

export default function PWATest() {
  return <PWATestClient />;
}
