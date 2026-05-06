import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import AdminSubscriptionsPage from './subscriptions-client';

interface Order {
  id: string;
  userId: string;
  user: { name: string; email: string };
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
}

async function fetchOrders(token: string, page: number = 1) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/admin/payment/orders?page=${page}&limit=10`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || [];
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    return [];
  }
}

export default async function AdminSubscriptionsPageServer() {
  const session = await getServerSession();
  
  if (!session?.user) {
    redirect('/auth/signin');
  }

  const token = (session as any).accessToken;
  if (!token) {
    redirect('/auth/signin');
  }

  const initialOrders = await fetchOrders(token);

  return <AdminSubscriptionsPage initialOrders={initialOrders} />;
}
