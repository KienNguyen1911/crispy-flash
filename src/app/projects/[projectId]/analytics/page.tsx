
'use client';

import { useParams } from 'next/navigation';
import useSWR from 'swr';
import { useAuthFetcher } from '@/hooks/useAuthFetcher';
import { getProjectProgress, getUserLearningStats } from '@/services/analytics-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import PageLoader from '@/components/ui/PageLoader';

const AnalyticsPage = () => {
  const params = useParams();
  const projectId = params.projectId as string;
  const fetcher = useAuthFetcher();

  const { data: progressData, error: progressError } = useSWR(
    projectId ? `project-progress-${projectId}` : null,
    () => getProjectProgress(fetcher, projectId)
  );

  const { data: statsData, error: statsError } = useSWR(
    'user-learning-stats',
    () => getUserLearningStats(fetcher)
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
    recentActivity,
  } = progressData;

  const {
    totalReviews,
    correctReviews,
    incorrectReviews,
    reviewAccuracy,
    dailyReviewCounts,
  } = statsData;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Project Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Learning Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{learnedVocabularies} / {totalVocabularies}</p>
            <p className="text-sm text-muted-foreground">Vocabularies Learned</p>
            <Progress value={learningProgress} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>SRS Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{srsProgress.toFixed(2)}%</p>
            <p className="text-sm text-muted-foreground">Overall SRS Mastery</p>
            <Progress value={srsProgress} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Review Accuracy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{reviewAccuracy.toFixed(2)}%</p>
            <p className="text-sm text-muted-foreground">{correctReviews} / {totalReviews} Correct</p>
            <Progress value={reviewAccuracy} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Daily Review Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {dailyReviewCounts && dailyReviewCounts.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dailyReviewCounts}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#8884d8" name="Reviews" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-center text-muted-foreground">
                <p>
                  Không có dữ liệu hoạt động đánh giá hàng ngày để hiển thị.
                  <br />
                  Hãy bắt đầu ôn tập để xem tiến trình của bạn!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div>
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
                    <p className="text-sm text-muted-foreground">
                      {activity.correct ? 'Correct' : 'Incorrect'} - {new Date(activity.reviewedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className={`text-sm font-medium ${activity.correct ? 'text-green-500' : 'text-red-500'}`}>
                    Easiness: {activity.easinessFactor.toFixed(2)}
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsPage;