
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import LearningHeatMap from "./LearningHeatMap";
import { Skeleton } from "@/components/ui/skeleton";
import { AuthIcon } from "../ui/auth-button";
import { Flame } from "lucide-react";
import { NeoPanel } from "@/components/ui/neo";

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

  return (
    <div className="space-y-6">
      <NeoPanel>
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
                <AuthIcon></AuthIcon>
              </div>
            </>
          ) : null}
        </CardHeader>
      </NeoPanel>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <NeoPanel>
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
                <p className="text-3xl font-black text-cyan-300">
                  {stats?.totalReviews || 0} reviews
                </p>
                <p className="text-sm md:text-base text-muted-foreground">
                  {stats?.correctReviews || 0} correct, {stats?.incorrectReviews || 0} incorrect
                </p>
                <Progress value={stats?.reviewAccuracy || 0} className="mt-3 rounded-[var(--neo-radius)] border-2 border-[var(--neo-line-strong)] bg-black" />
              </>
            )}
          </CardContent>
        </NeoPanel>
        <NeoPanel>
          <CardHeader>
            <CardTitle>Streak</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-12 w-16" />
            ) : statsError ? (
              <p className="text-sm md:text-base text-destructive">Failed to load stats</p>
            ) : (
              <p className="inline-flex items-center gap-2 text-4xl font-black text-amber-300">
                <Flame className="h-8 w-8" />
                {stats?.weeklyStreak || 0}
              </p>
            )}
          </CardContent>
        </NeoPanel>
        <NeoPanel>
          <CardHeader>
            <CardTitle>Accuracy</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-12 w-16" />
            ) : statsError ? (
              <p className="text-sm md:text-base text-destructive">Failed to load stats</p>
            ) : (
              <p className="text-4xl font-black text-emerald-300">{stats?.reviewAccuracy ? `${stats.reviewAccuracy}%` : '0%'}</p>
            )}
          </CardContent>
        </NeoPanel>
      </div>

      <NeoPanel>
        <CardHeader>
          <CardTitle>Learning Heatmap</CardTitle>
        </CardHeader>
        <CardContent className="h-full">
          <LearningHeatMap />
        </CardContent>
      </NeoPanel>
    </div>
  );
};

export default ActivityStatistics;
