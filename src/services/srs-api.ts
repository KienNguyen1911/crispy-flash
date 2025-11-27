import { VocabularyWithSrs, DueReviewCount, ReviewFeedbackDto } from '@/types/srs';

// Re-export SRS types for convenience
export type { VocabularyWithSrs, DueReviewCount, ReviewFeedbackDto };

// Import the base service and apiClient
import { BaseApiService } from './base-api-service';
import { apiClient } from '@/lib/api';

// SRS Service wrapper class for API calls
class SrsApiService extends BaseApiService {

  // SRS API Functions
  async getDueReviews(projectId?: string): Promise<VocabularyWithSrs[]> {
    const url = projectId 
      ? `/api/vocabulary/review/due?projectId=${projectId}`
      : '/api/vocabulary/review/due';
    return this.handleApiCall(() => this.apiClient<VocabularyWithSrs[]>(url));
  }

  async getDueReviewCount(projectId?: string): Promise<DueReviewCount> {
    const url = projectId 
      ? `/api/vocabulary/review/due/count?projectId=${projectId}`
      : '/api/vocabulary/review/due/count';
    return this.handleApiCall(() => this.apiClient<DueReviewCount>(url));
  }

  async submitReviewFeedback(vocabId: string, feedback: ReviewFeedbackDto): Promise<VocabularyWithSrs> {
    return this.handleApiCall(() =>
      this.apiClient<VocabularyWithSrs>(`/api/vocabulary/review/${vocabId}`, {
        method: 'POST',
        body: JSON.stringify(feedback),
      })
    );
  }

  async initializeSrsData(vocabId: string): Promise<VocabularyWithSrs> {
    return this.handleApiCall(() =>
      this.apiClient<VocabularyWithSrs>(`/api/vocabulary/${vocabId}/srs/initialize`, {
        method: 'POST',
      })
    );
  }
}

// Create and export a singleton instance
const srsApiService = new SrsApiService(apiClient);

// Export the service instance
export { srsApiService };

// Export individual functions for backward compatibility
export const srsApi = {
  getDueReviews: (projectId?: string) => srsApiService.getDueReviews(projectId),
  getDueReviewCount: (projectId?: string) => srsApiService.getDueReviewCount(projectId),
  submitReviewFeedback: (vocabId: string, feedback: ReviewFeedbackDto) => srsApiService.submitReviewFeedback(vocabId, feedback),
  initializeSrsData: (vocabId: string) => srsApiService.initializeSrsData(vocabId),
};