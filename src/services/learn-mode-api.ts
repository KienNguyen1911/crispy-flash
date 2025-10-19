import type { Vocabulary } from "@/lib/types";

// Import the base service and apiClient
import { BaseApiService } from "./base-api-service";
import { apiClient } from "@/lib/api";

// Learn Mode Service wrapper class for API calls
class LearnModeApiService extends BaseApiService {
  // Learn Mode API Functions
  async updateVocabularyBatchStatus(
    topicId: string,
    vocabularies: Array<{ id: string; status: Vocabulary["status"] }>
  ) {
    return this.handleApiCall(() =>
      this.apiClient(`/api/vocabulary/batch/status`, {
        method: "PUT",
        body: JSON.stringify({
          topicId: topicId,
          vocabularies: vocabularies.map(({ id, status }) => ({ id, status }))
        })
      })
    );
  }
}

// Create and export a singleton instance
const learnModeApiService = new LearnModeApiService(apiClient);

// Export the service instance
export { learnModeApiService };

// Export individual functions for backward compatibility
export const updateVocabularyBatchStatus = (
  topicId: string,
  vocabularies: Array<{ id: string; status: Vocabulary["status"] }>
) => learnModeApiService.updateVocabularyBatchStatus(topicId, vocabularies);
