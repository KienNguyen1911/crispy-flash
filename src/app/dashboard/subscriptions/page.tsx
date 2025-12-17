
'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { useAuth } from '@/context/AuthContext';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const fetcher = (url: string, token: string) => 
    fetch(url, { headers: { Authorization: `Bearer ${token}` } }).then((res) => res.json());

export default function AdminSubscriptionsPage() {
  const { token, isAuthenticated } = useAuth();
  const [page, setPage] = useState(1);
  const { data, isLoading, mutate } = useSWR(
    token ? [`${process.env.NEXT_PUBLIC_API_URL}/admin/payment/orders?page=${page}&limit=10`, token] : null,
    ([url, t]) => fetcher(url, t)
  );

  const [grantPlan, setGrantPlan] = useState('PRO_MONTHLY');
  const [grantDuration, setGrantDuration] = useState(1);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [grantOpen, setGrantOpen] = useState(false);

  const handleGrant = async () => {
    if (!selectedUser || !token) return;

    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/payment/grant/${selectedUser}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                plan: grantPlan,
                durationMonths: Number(grantDuration),
            }),
        });

        if (res.ok) {
            toast.success('Subscription granted successfully');
            setGrantOpen(false);
            mutate(); // Refresh list
        } else {
            toast.error('Failed to grant subscription');
        }
    } catch (error) {
        toast.error('Error occurred');
    }
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Subscription Management</h1>
        <div className="flex gap-2">
            <Button onClick={() => {
                setSelectedUser(null);
                setGrantOpen(true);
            }}>
                Grant Subscription
            </Button>
            <Button variant="outline" onClick={() => mutate()}>Refresh</Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Currency</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
                <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                        <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                    </TableCell>
                </TableRow>
            ) : data?.data?.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                        No orders found.
                    </TableCell>
                </TableRow>
            ) : data?.data?.map((order: any) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id.slice(0, 8)}...</TableCell>
                <TableCell>
                    <div className="flex flex-col">
                        <span className="font-medium">{order.user.name}</span>
                        <span className="text-xs text-muted-foreground">{order.user.email}</span>
                    </div>
                </TableCell>
                <TableCell>{order.amount.toLocaleString()}</TableCell>
                <TableCell>{order.currency}</TableCell>
                <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                        ${order.status === 'SUCCESS' ? 'bg-green-100 text-green-800' : 
                          order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                        {order.status.toLowerCase()}
                    </span>
                </TableCell>
                <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                                setSelectedUser(order.userId);
                                setGrantOpen(true);
                            }}>
                                Grant Subscription
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(order.id)}>
                                Copy Order ID
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-end gap-2 mt-4">
        <Button variant="outline" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
        <Button variant="outline" onClick={() => setPage(p => p + 1)} disabled={!data || data.data.length < 10}>Next</Button>
      </div>

      <Dialog open={grantOpen} onOpenChange={setGrantOpen}>
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>Grant Subscription</DialogTitle>
                <DialogDescription>
                    Manually add subscription time to user.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="userId" className="text-right">User ID</Label>
                    <Input 
                        id="userId" 
                        value={selectedUser || ''} 
                        onChange={(e) => setSelectedUser(e.target.value)} 
                        className="col-span-3"
                        placeholder="User ID (UUID)"
                    />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="plan" className="text-right">Plan</Label>
                    <Select value={grantPlan} onValueChange={setGrantPlan}>
                        <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select plan" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="PRO_MONTHLY">Pro Monthly</SelectItem>
                            <SelectItem value="PRO_YEARLY">Pro Yearly</SelectItem>
                            <SelectItem value="LIFETIME">Lifetime</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="duration" className="text-right">Months</Label>
                    <Input id="duration" type="number" value={grantDuration} onChange={(e) => setGrantDuration(Number(e.target.value))} className="col-span-3" />
                </div>
            </div>
            <DialogFooter>
                <Button type="submit" onClick={handleGrant}>Save changes</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
