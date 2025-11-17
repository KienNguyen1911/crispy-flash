
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
  const currentYear = today.getFullYear();

  // Show from start of current year to today
  // Use local date to avoid timezone issues
  const from = `${currentYear}-01-01`;
  const to = today.toISOString().split('T')[0];

  // Dark theme: Use brighter, more visible colors
  // Light theme: Use green gradient
  const colors = theme === 'dark' 
    ? ["#a7f3d0", "#6ee7b7", "#34d399", "#10b981" ] // Bright emerald/teal for dark theme
    : ["#a1d99b", "#74c476", "#41ab5d", "#238b45"]; // Green gradient for light theme

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
    <div className="w-full overflow-hidden">
      {/* Scrollable container for heatmap */}
      <div 
        style={{ 
          height: '280px',
          overflowX: 'auto',
          overflowY: 'auto',
          borderRadius: '8px',
          background: theme === 'dark' ? '#0f172a' : '#f8f9fa',
          padding: '16px 0 0',
          margin: '0px 0',
          width: '100%',
        }}
        className="scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800"
      >
        <div style={{ minWidth: '1000px', height: '100%' }}>
          <ResponsiveCalendar
            data={data as HeatmapData[]}
            from={from}
            to={to}
            emptyColor={theme === 'dark' ? "#1f2937" : "#eeeeee"}
            colors={colors}
            margin={{ top: 20, right: 20, bottom: 50, left: 60 }}
            monthBorderColor={theme === 'dark' ? "#374151" : "#e5e7eb"}
            monthBorderWidth={3}
            dayBorderWidth={1}
            dayBorderColor={theme === 'dark' ? "#000" : "#ffffff"}
            // @ts-ignore
            tooltip={({ day, value }) => (
              <div
                style={{
                  background: theme === 'dark' ? '#1f2937' : '#ffffff',
                  color: theme === 'dark' ? '#ffffff' : '#000000',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`,
                  fontSize: '12px',
                  fontWeight: '500',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  minWidth: '150px'
                }}
              >
                {day}: {value}
              </div>
            )}
            legends={[
              {
                anchor: 'bottom-right',
                direction: 'row',
                translateY: 40,
                itemCount: 4,
                itemWidth: 50,
                itemHeight: 40,
                itemsSpacing: 16,
                itemDirection: 'right-to-left',
                symbolSize: 16,
                // @ts-ignore
                itemTextColor: theme === 'dark' ? '#e5e7eb' : '#374151',
              }
            ]}
          />
        </div>
      </div>
      
      {/* Scroll hint for mobile */}
      <div className="text-xs text-muted-foreground text-center mt-2 md:hidden">
        Scroll horizontally to see more
      </div>
    </div>
  );
};

export default LearningHeatMap;