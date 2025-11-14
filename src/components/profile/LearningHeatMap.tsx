
"use client";

import { ResponsiveCalendar } from "@nivo/calendar";
import { useTheme } from "next-themes";
import { useUserHeatmapData } from "@/hooks/use-analytics";
import { Skeleton } from "@/components/ui/skeleton";
import { HeatmapData } from "@/lib/types";

/**
 * Learning Heatmap Component
 * 
 * Data format for ResponsiveCalendar (from @nivo/calendar):
 * Array of objects with:
 * - date: string (YYYY-MM-DD format)
 * - count: number (number of reviews on that date)
 * - level: 0|1|2|3|4 (activity level for color intensity)
 * 
 * Level mapping (based on review count):
 * - level 0: 0 reviews (no activity)
 * - level 1: 1-4 reviews (low activity) 
 * - level 2: 5-9 reviews (medium activity)
 * - level 3: 10-14 reviews (high activity)
 * - level 4: 15+ reviews (very high activity)
 * 
 * Example:
 * [
 *   { day: "2025-10-01", value: 0, level: 0 },
 *   { day: "2025-10-02", value: 3, level: 1 },
 *   { day: "2025-10-03", value: 8, level: 2 },
 *   { day: "2025-10-04", value: 12, level: 3 },
 *   { day: "2025-10-05", value: 20, level: 4 }
 * ]
 */
const LearningHeatMap: React.FC = () => {
  const { theme } = useTheme();
  const { data, loading, error } = useUserHeatmapData();

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const quarterStartMonth = Math.floor(currentMonth / 3) * 3;

  const from = new Date(currentYear, quarterStartMonth, 1).toISOString().split('T')[0];
  const to = new Date(currentYear, quarterStartMonth + 3, 0).toISOString().split('T')[0];

  const colors = theme === 'dark' 
    ? ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))"]
    : ["#a1d99b", "#74c476", "#41ab5d", "#238b45"];

  if (loading) {
    return <Skeleton className="h-[200px] w-full" />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[200px] text-sm md:text-base text-muted-foreground">
        Failed to load heatmap data
      </div>
    );
  }

  return (
    <div style={{ height: '200px' }}>
      <ResponsiveCalendar
        data={data as HeatmapData[]}
        from={from}
        to={to}
        emptyColor={theme === 'dark' ? "hsl(var(--muted))" : "#eeeeee"}
        colors={colors}
        margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        monthBorderColor={theme === 'dark' ? "hsl(var(--background))" : "#ffffff"}
        dayBorderWidth={2}
        dayBorderColor={theme === 'dark' ? "hsl(var(--background))" : "#ffffff"}
        legends={[
          {
            anchor: 'bottom-right',
            direction: 'row',
            translateY: 36,
            itemCount: 4,
            itemWidth: 42,
            itemHeight: 36,
            itemsSpacing: 14,
            itemDirection: 'right-to-left',
            symbolSize: 20,
            // @ts-ignore
            itemTextColor: theme === 'dark' ? '#ffffff' : '#000000'
          }
        ]}
      />
    </div>
  );
};

export default LearningHeatMap;