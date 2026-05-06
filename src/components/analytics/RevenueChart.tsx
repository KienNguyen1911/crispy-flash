'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

interface RevenueChartProps {
  data: any[];
  currencyFormatter: Intl.NumberFormat;
}

export default function RevenueChart({ data, currencyFormatter }: RevenueChartProps) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis
          dataKey="date"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => {
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
          formatter={(value: number) => currencyFormatter.format(value)}
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
  );
}
