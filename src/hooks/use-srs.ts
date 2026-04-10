import useSWR from 'swr';
import { srsApi } from '@/services/srs-api';
import {
  DailyReviewHistoryItem,
  DailyReviewSummary,
  DueReviewCount,
  ReviewFeedbackDto,
  VocabularyWithSrs,
  WeakWordItem,
} from '@/types/srs';

export function useDueReviews(projectId?: string) {
  const { data, error, mutate } = useSWR<VocabularyWithSrs[]>(
    projectId ? `/api/vocabulary/review/due?projectId=${projectId}` : '/api/vocabulary/review/due',
    () => srsApi.getDueReviews(projectId),
    {
      refreshInterval: 60000, // Refresh every minute
      revalidateOnFocus: false,
    }
  );

  return {
    dueReviews: data || [],
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}

export function useDueReviewCount(projectId?: string) {
  const { data, error, mutate } = useSWR<DueReviewCount>(
    projectId ? `/api/vocabulary/review/due/count?projectId=${projectId}` : '/api/vocabulary/review/due/count',
    () => srsApi.getDueReviewCount(projectId),
    {
      refreshInterval: 60000, // Refresh every minute
      revalidateOnFocus: false,
    }
  );

  return {
    count: data?.count || 0,
    dueToday: data?.dueToday || 0,
    overdue: data?.overdue || 0,
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}

export function useReviewSession() {
  const submitFeedback = async (vocabId: string, feedback: ReviewFeedbackDto) => {
    try {
      const result = await srsApi.submitReviewFeedback(vocabId, feedback);
      return result;
    } catch (error) {
      console.error('Failed to submit review feedback:', error);
      throw error;
    }
  };

  const initializeSrs = async (vocabId: string) => {
    try {
      const result = await srsApi.initializeSrsData(vocabId);
      return result;
    } catch (error) {
      console.error('Failed to initialize SRS data:', error);
      throw error;
    }
  };

  return {
    submitFeedback,
    initializeSrs,
  };
}

export function useDailyReviewSummary(projectId?: string, date?: string) {
  const key = projectId
    ? `/api/vocabulary/review/daily-summary?projectId=${projectId}${date ? `&date=${date}` : ''}`
    : null;

  const { data, error, mutate } = useSWR<DailyReviewSummary>(
    key,
    () => srsApi.getDailyReviewSummary(projectId as string, date),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    summary: data,
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}

export function useDailyReviewHistory(projectId?: string, date?: string) {
  const key = projectId
    ? `/api/vocabulary/review/history/daily?projectId=${projectId}${date ? `&date=${date}` : ''}`
    : null;

  const { data, error, mutate } = useSWR<DailyReviewHistoryItem[]>(
    key,
    () => srsApi.getDailyReviewHistory(projectId as string, date),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    items: data || [],
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}

export function useWeakWords(projectId?: string, limit = 20) {
  const key = projectId
    ? `/api/vocabulary/review/weak?projectId=${projectId}&limit=${limit}`
    : null;

  const { data, error, mutate } = useSWR<WeakWordItem[]>(
    key,
    () => srsApi.getWeakWords(projectId as string, limit),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    weakWords: data || [],
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}
