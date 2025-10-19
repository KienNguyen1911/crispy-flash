import { VocabularyWithSrs, DueReviewCount, ReviewFeedbackDto } from '@/types/srs';

// Re-export SRS types for convenience
export type { VocabularyWithSrs, DueReviewCount, ReviewFeedbackDto };

// Import the base service and apiClient
import { BaseApiService } from './base-api-service';
import { apiClient } from '@/lib/api';

// SRS Service wrapper class for API calls
class SrsApiService extends BaseApiService {

  // SRS API Functions
  async getDueReviews(): Promise<VocabularyWithSrs[]> {
    return this.handleApiCall(() => this.apiClient<VocabularyWithSrs[]>('/api/vocabulary/review/due'));
  }

  async getDueReviewCount(): Promise<DueReviewCount> {
    return this.handleApiCall(() => this.apiClient<DueReviewCount>('/api/vocabulary/review/due/count'));
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
  getDueReviews: () => srsApiService.getDueReviews(),
  getDueReviewCount: () => srsApiService.getDueReviewCount(),
  submitReviewFeedback: (vocabId: string, feedback: ReviewFeedbackDto) => srsApiService.submitReviewFeedback(vocabId, feedback),
  initializeSrsData: (vocabId: string) => srsApiService.initializeSrsData(vocabId),
};