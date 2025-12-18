"use client";

import { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import { addDays, startOfMonth, endOfMonth, subMonths, format } from "date-fns";
import { Loader2 } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { useAuth } from "@/context/AuthContext";
import { apiClient } from "@/lib/api";

interface RevenueStats {
  date: string;
  amount: number;
}

export default function RevenuePage() {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(subMonths(new Date(), 0)),
    to: endOfMonth(new Date()),
  });
  const [providerStats, setProviderStats] = useState<{ provider: string; amount: number }[]>([]);
  const [stats, setStats] = useState<RevenueStats[]>([]);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!dateRange?.from || !dateRange?.to) return;

      setLoading(true);
      try {
        const fromStr = format(dateRange.from, "yyyy-MM-dd");
        const toStr = format(dateRange.to, "yyyy-MM-dd");
        
        const daysDiff = (dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 3600 * 24);
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
    }

    fetchData();
  }, [dateRange]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Revenue</h1>
        <DatePickerWithRange date={dateRange} setDate={setDateRange} />
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
                new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalRevenue)}
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
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-pink-500"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg> // Placeholder for Momo
              )}
              {stat.provider === 'VNPAY' && (
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-blue-500"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg> // Placeholder for VNPay
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 
                new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stat.amount)}
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
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={stats}>
                  <XAxis
                    dataKey="date"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => {
                        // If grouping by month (YYYY-MM), format as MMM YYYY
                        // If day (YYYY-MM-DD), format as d/M
                        if (value.length === 7) return value; 
                        return new Date(value).toLocaleDateString("en-US", { day: 'numeric', month: 'numeric'});
                    }}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value / 1000}k`}
                  />
                  <Tooltip 
                    contentStyle={{
                        backgroundColor: "hsl(var(--popover))",
                        borderColor: "hsl(var(--border))",
                        color: "hsl(var(--popover-foreground))",
                        borderRadius: "var(--radius)",
                    }}
                    itemStyle={{ color: "hsl(var(--popover-foreground))" }}
                    labelStyle={{ color: "hsl(var(--muted-foreground))" }}
                    cursor={{ fill: "hsl(var(--muted)/0.2)" }}
                    formatter={(value: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)}
                    labelFormatter={(label) => label}
                  />
                  <Bar
                    dataKey="amount"
                    fill="currentColor"
                    radius={[4, 4, 0, 0]}
                    className="fill-primary"
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
