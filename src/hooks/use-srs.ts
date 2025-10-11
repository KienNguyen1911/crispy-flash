import useSWR from 'swr';
import { srsApi } from '@/lib/api';
import { VocabularyWithSrs, ReviewFeedbackDto, DueReviewCount } from '@/types/srs';

export function useDueReviews() {
  const { data, error, mutate } = useSWR<VocabularyWithSrs[]>(
    '/api/vocabulary/review/due',
    srsApi.getDueReviews,
    {
      refreshInterval: 60000, // Refresh every minute
      revalidateOnFocus: false,
    }
  );
  console.log('useDueReviews', data);

  return {
    dueReviews: data || [],
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}

export function useDueReviewCount() {
  const { data, error, mutate } = useSWR<DueReviewCount>(
    '/api/vocabulary/review/due/count',
    srsApi.getDueReviewCount,
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