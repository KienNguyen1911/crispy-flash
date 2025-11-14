"use client";

import { useDueReviews, useDueReviewCount } from "@/hooks/use-srs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, AlertCircle, CheckCircle } from "lucide-react";
import { format } from "date-fns";

export function ReviewDashboard() {
  const { dueReviews, isLoading, isError } = useDueReviews();
  const {
    count,
    dueToday,
    overdue,
    isLoading: countLoading,
  } = useDueReviewCount();

  if (isLoading || countLoading) {
    return <ReviewDashboardSkeleton />;
  }

  if (isError) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <span>Error loading review data</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasDueReviews = count > 0;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm md:text-base font-medium">Total Reviews</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{count}</div>
            <p className="text-xs text-muted-foreground">
              {overdue > 0 && `${overdue} overdue`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm md:text-base font-medium">Review Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dueToday}</div>
            <p className="text-xs text-muted-foreground">
              Due for review today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm md:text-base font-medium">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{overdue}</div>
            <p className="text-xs text-muted-foreground">
              Need immediate review
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Action Card */}
      <Card>
        <CardHeader>
          <CardTitle>Smart Review</CardTitle>
          <CardDescription>
            The SRS system helps you remember vocabulary longer with SuperMemo 2
            algorithm
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm md:text-base font-medium">
                {hasDueReviews
                  ? "You have words to review"
                  : "No words to review"}
              </p>
              <p className="text-xs text-muted-foreground">
                {hasDueReviews
                  ? `Start reviewing ${count} words now`
                  : "Learn more words to have reviews"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Due Reviews List */}
      {hasDueReviews && (
        <Card>
          <CardHeader>
            <CardTitle>Review List</CardTitle>
            <CardDescription>Words due or overdue for review</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dueReviews.slice(0, 5).map((vocab) => (
                <div
                  key={vocab.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  {/* 👈 Thay đổi ở đây: Thêm 'min-w-0' để đảm bảo flex item này có thể xuống dòng */}
                  <div className="space-y-1 min-w-0">
                    <div className="font-medium">{vocab.word}</div>

                    {/* 👈 Thêm 'text-wrap' để nghĩa tự động xuống dòng */}
                    <div className="text-sm md:text-base text-muted-foreground text-wrap">
                      {vocab.meaning}
                    </div>
                  </div>

                  {/* 👈 Thêm 'flex-shrink-0' để nhóm Badge & Ngày tháng không bị co lại */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge
                      variant={vocab.interval > 21 ? "default" : "secondary"}
                    >
                      {vocab.interval > 21 ? "Long-term" : "Short-term"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(vocab.nextReviewDate), "MM/dd")}
                    </span>
                  </div>
                </div>
              ))}
              {dueReviews.length > 5 && (
                <div className="text-center text-sm md:text-base text-muted-foreground">
                  And {dueReviews.length - 5} more words...
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ReviewDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-2" />
          <div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-40 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
