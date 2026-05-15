
'use client';

import { useParams } from 'next/navigation';
import useSWR from 'swr';
import { useAuthFetcher } from '@/hooks/useAuthFetcher';
import { getProjectProgress, getUserLearningStats } from '@/services/analytics-api';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { BarChart3, BookOpenCheck, Target, Terminal } from 'lucide-react';
import PageLoader from '@/components/ui/PageLoader';
import { NeoHeader, NeoPage, NeoPanel, NeoStat } from '@/components/ui/neo';

type ProjectProgressData = {
  totalVocabularies: number;
  learnedVocabularies: number;
  learningProgress: number;
  srsProgress: number;
};

type UserLearningStatsData = {
  totalReviews: number;
  correctReviews: number;
  reviewAccuracy: number;
  dailyReviewCounts?: Array<{ date: string; count: number }>;
};

const AnalyticsPage = () => {
  const params = useParams();
  const projectId = params.projectId as string;
  const fetcher = useAuthFetcher();

  const { data: progressData, error: progressError } = useSWR<ProjectProgressData>(
    projectId ? `project-progress-${projectId}` : null,
    () => getProjectProgress(fetcher, projectId) as Promise<ProjectProgressData>
  );

  const { data: statsData, error: statsError } = useSWR<UserLearningStatsData>(
    'user-learning-stats',
    () => getUserLearningStats(fetcher) as Promise<UserLearningStatsData>
  );

  if (progressError || statsError) {
    return (
      <Alert variant="destructive">
        <Terminal className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load analytics data. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  if (!progressData || !statsData) {
    return <PageLoader />;
  }

  const {
    totalVocabularies,
    learnedVocabularies,
    learningProgress,
    srsProgress,
  } = progressData;

  const {
    totalReviews,
    correctReviews,
    reviewAccuracy,
    dailyReviewCounts,
  } = statsData;

  return (
    <NeoPage className="max-w-6xl">
      <NeoHeader
        eyebrow="Learning metrics"
        title="Project Analytics"
        description="Track vocabulary progress, SRS mastery, and recent review activity for this project."
        className="mb-8"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <NeoPanel className="space-y-4 p-5">
          <NeoStat
            label="Vocabularies Learned"
            value={`${learnedVocabularies} / ${totalVocabularies}`}
            tone="primary"
            icon={<BookOpenCheck className="h-5 w-5" />}
          />
          <Progress value={learningProgress} className="h-2 border-2 border-[var(--neo-line)] shadow-[var(--neo-shadow-sm)]" />
        </NeoPanel>
        <NeoPanel className="space-y-4 p-5">
          <NeoStat
            label="Overall SRS Mastery"
            value={`${srsProgress.toFixed(2)}%`}
            tone="success"
            icon={<Target className="h-5 w-5" />}
          />
          <Progress value={srsProgress} className="h-2 border-2 border-[var(--neo-line)] shadow-[var(--neo-shadow-sm)]" />
        </NeoPanel>
        <NeoPanel className="space-y-4 p-5">
          <NeoStat
            label={`${correctReviews} / ${totalReviews} Correct`}
            value={`${reviewAccuracy.toFixed(2)}%`}
            tone="warning"
            icon={<BarChart3 className="h-5 w-5" />}
          />
          <Progress value={reviewAccuracy} className="h-2 border-2 border-[var(--neo-line)] shadow-[var(--neo-shadow-sm)]" />
        </NeoPanel>
      </div>

      <div className="mb-8">
        <NeoPanel className="p-5">
          <div className="mb-5">
            <h2 className="text-2xl font-black text-white">Daily Review Activity</h2>
            <p className="mt-1 text-sm font-medium text-muted-foreground">
              Recent review volume by day.
            </p>
          </div>
            {dailyReviewCounts && dailyReviewCounts.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dailyReviewCounts}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--neo-surface-raised)',
                      border: '2px solid var(--neo-line)',
                      borderRadius: 'var(--neo-radius)',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="count" fill="var(--neo-primary)" name="Reviews" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-center text-muted-foreground">
                <p>
                  No daily review activity data to display.
                  <br />
                  Start reviewing to see your progress.
                </p>
              </div>
            )}
        </NeoPanel>
      </div>

      {/* <div>
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {recentActivity.map((activity, index) => (
                <li key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{activity.word}</p>
                    <p className="text-sm md:text-base text-muted-foreground">
                      {activity.correct ? 'Correct' : 'Incorrect'} - {new Date(activity.reviewedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className={`text-sm md:text-base font-medium ${activity.correct ? 'text-green-500' : 'text-red-500'}`}>
                    Easiness: {activity.easinessFactor.toFixed(2)}
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div> */}
    </NeoPage>
  );
};

export default AnalyticsPage;
