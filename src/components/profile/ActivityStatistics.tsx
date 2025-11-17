
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import LearningHeatMap from "./LearningHeatMap";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Moon, Sun, User } from "lucide-react";
import { useTheme } from "next-themes";
import { AuthIcon } from "../ui/auth-button";

interface UserInfo {
  id: string;
  email: string;
  name: string;
  avatar: string;
  subscription: {
    status: string;
    expiryDate: string | null;
  };
  memberSince: string;
}

interface UserLearningStats {
  totalReviews: number;
  correctReviews: number;
  incorrectReviews: number;
  reviewAccuracy: number;
  dailyReviewCounts: Array<{
    date: string;
    count: number;
  }>;
  weeklyStreak: number;
}

interface ActivityStatisticsProps {
  userInfo: {
    user: UserInfo | null;
    loading: boolean;
    error: string | null;
  };
  learningStats: {
    stats: UserLearningStats | null;
    loading: boolean;
    error: string | null;
  };
}

const ActivityStatistics: React.FC<ActivityStatisticsProps> = ({ userInfo, learningStats }) => {
  const { user, loading: userLoading, error: userError } = userInfo;
  const { stats, loading: statsLoading, error: statsError } = learningStats;
  const { theme, setTheme } = useTheme();
  
  // Mock data for vocabulary progress (will be replaced when we have vocabulary API)
  const rememberedWords = 150;
  const totalWords = 200;
  const progress = (rememberedWords / totalWords) * 100;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center space-x-4">
          {userLoading ? (
            <>
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-40" />
              </div>
            </>
          ) : userError ? (
            <div className="text-sm md:text-base text-destructive">Failed to load user info</div>
          ) : user ? (
            <>
              <Avatar className="h-16 w-16">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>{user.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <CardTitle className="text-2xl">{user.name}</CardTitle>
                <p className="text-muted-foreground">{user.email}</p>
                <p className="text-sm md:text-base font-medium text-primary">
                  {user.subscription.status} - Expires on {user.subscription.expiryDate}
                </p>
              </div>
              <div className="flex gap-2 flex-col">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="h-10 w-10"
                >
                  {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>

                <AuthIcon></AuthIcon>
              </div>
            </>
          ) : null}
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Review Count</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : statsError ? (
              <p className="text-sm md:text-base text-destructive">Failed to load stats</p>
            ) : (
              <>
                <p className="text-2xl font-bold">
                  {stats?.totalReviews || 0} reviews
                </p>
                <p className="text-sm md:text-base text-muted-foreground">
                  {stats?.correctReviews || 0} correct, {stats?.incorrectReviews || 0} incorrect
                </p>
                <Progress value={stats?.reviewAccuracy || 0} className="mt-2" />
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Streak</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-12 w-16" />
            ) : statsError ? (
              <p className="text-sm md:text-base text-destructive">Failed to load stats</p>
            ) : (
              <p className="text-4xl font-bold">🔥 {stats?.weeklyStreak || 0}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Accuracy</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-12 w-16" />
            ) : statsError ? (
              <p className="text-sm md:text-base text-destructive">Failed to load stats</p>
            ) : (
              <p className="text-4xl font-bold">{stats?.reviewAccuracy ? `${stats.reviewAccuracy}%` : '0%'}</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Learning Heatmap</CardTitle>
        </CardHeader>
        <CardContent className="h-full">
          <LearningHeatMap />
        </CardContent>
      </Card>
    </div>
  );
};

export default ActivityStatistics;