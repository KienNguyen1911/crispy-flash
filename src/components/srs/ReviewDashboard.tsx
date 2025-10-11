'use client';

import { useDueReviews, useDueReviewCount } from '@/hooks/use-srs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export function ReviewDashboard() {
  const { dueReviews, isLoading, isError } = useDueReviews();
  const { count, dueToday, overdue, isLoading: countLoading } = useDueReviewCount();

  if (isLoading || countLoading) {
    return <ReviewDashboardSkeleton />;
  }

  if (isError) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <span>Có lỗi xảy ra khi tải dữ liệu ôn tập</span>
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
            <CardTitle className="text-sm font-medium">Tổng số cần ôn tập</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{count}</div>
            <p className="text-xs text-muted-foreground">
              {overdue > 0 && `${overdue} từ quá hạn`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ôn tập hôm nay</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dueToday}</div>
            <p className="text-xs text-muted-foreground">
              Cần ôn tập trong hôm nay
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Từ quá hạn</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{overdue}</div>
            <p className="text-xs text-muted-foreground">
              Cần ôn tập ngay lập tức
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Action Card */}
      <Card>
        <CardHeader>
          <CardTitle>Ôn tập thông minh</CardTitle>
          <CardDescription>
            Hệ thống SRS sẽ giúp bạn nhớ từ vựng lâu hơn với thuật toán SuperMemo 2
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">
                {hasDueReviews ? 'Bạn có từ cần ôn tập' : 'Không có từ nào cần ôn tập'}
              </p>
              <p className="text-xs text-muted-foreground">
                {hasDueReviews 
                  ? `Bắt đầu ôn tập ${count} từ ngay bây giờ`
                  : 'Hãy học thêm từ mới để có từ cần ôn tập'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Due Reviews List */}
      {hasDueReviews && (
        <Card>
          <CardHeader>
            <CardTitle>Danh sách từ cần ôn tập</CardTitle>
            <CardDescription>
              Các từ sắp đến hạn hoặc đã quá hạn ôn tập
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dueReviews.slice(0, 5).map((vocab) => (
                <div key={vocab.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <div className="font-medium">{vocab.word}</div>
                    <div className="text-sm text-muted-foreground">{vocab.meaning}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={vocab.interval > 21 ? 'default' : 'secondary'}>
                      {vocab.interval > 21 ? 'Lâu dài' : 'Ngắn hạn'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(vocab.nextReviewDate), 'dd/MM', { locale: vi })}
                    </span>
                  </div>
                </div>
              ))}
              {dueReviews.length > 5 && (
                <div className="text-center text-sm text-muted-foreground">
                  Và {dueReviews.length - 5} từ khác...
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