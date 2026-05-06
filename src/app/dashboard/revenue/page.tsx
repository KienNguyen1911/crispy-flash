'use client';

import { useState } from "react";
import dynamic from "next/dynamic";
import { DateRange } from "react-day-picker";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";
import { Loader2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { apiClient } from "@/lib/api";

const RevenueChart = dynamic(() => import('@/components/analytics/RevenueChart'), { ssr: false });

interface RevenueStats {
  date: string;
  amount: number;
}

const currencyFormatter = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });

export default function RevenuePage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(subMonths(new Date(), 0)),
    to: endOfMonth(new Date()),
  });
  const [stats, setStats] = useState<RevenueStats[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [providerStats, setProviderStats] = useState<{ provider: string; amount: number }[]>([]);
  const [loading, setLoading] = useState(false);

  const handleDateChange = async (newDateRange: DateRange | undefined) => {
    setDateRange(newDateRange);
    if (!newDateRange?.from || !newDateRange?.to) return;

    setLoading(true);
    try {
      const fromStr = format(newDateRange.from, "yyyy-MM-dd");
      const toStr = format(newDateRange.to, "yyyy-MM-dd");
      
      const daysDiff = (newDateRange.to.getTime() - newDateRange.from.getTime()) / (1000 * 3600 * 24);
      const groupBy = daysDiff > 60 ? 'month' : 'day';

      const [statsData, totalData, providerData] = await Promise.all([
          apiClient<RevenueStats[]>(`/revenue/stats?from=${fromStr}&to=${toStr}&groupBy=${groupBy}`),
          apiClient<{ total: number }>(`/revenue/total?from=${fromStr}&to=${toStr}`),
          apiClient<{ provider: string; amount: number }[]>(`/revenue/by-provider?from=${fromStr}&to=${toStr}`)
      ]);

      setStats(statsData);
      setTotalRevenue(totalData.total);
      setProviderStats(providerData);
    } catch (error) {
      console.error("Failed to fetch revenue data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Revenue</h1>
        <DatePickerWithRange date={dateRange} setDate={handleDateChange} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 
                currencyFormatter.format(totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              {dateRange?.from && dateRange?.to ? 
                `${format(dateRange.from, 'MMM d, yyyy')} - ${format(dateRange.to, 'MMM d, yyyy')}` : 
                "Selected period"}
            </p>
          </CardContent>
        </Card>
        {providerStats.map((stat) => (
          <Card key={stat.provider}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.provider === 'UNKNOWN' ? 'Others' : stat.provider}
              </CardTitle>
              {stat.provider === 'STRIPE' && (
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
              )}
              {stat.provider === 'MOMO' && (
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-pink-500"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
              )}
              {stat.provider === 'VNPAY' && (
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-blue-500"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 
                currencyFormatter.format(stat.amount)}
              </div>
              <p className="text-xs text-muted-foreground">
                Revenue from {stat.provider}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Overview</CardTitle>
        </CardHeader>
        <CardContent className="pl-2">
            {loading ? (
                <div className="flex h-[350px] items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            ) : (
              <div suppressHydrationWarning>
                <RevenueChart data={stats} currencyFormatter={currencyFormatter} />
              </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
