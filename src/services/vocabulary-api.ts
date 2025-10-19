import type { Vocabulary } from '@/lib/types';

// Import the base service and apiClient
import { BaseApiService } from './base-api-service';
import { apiClient } from '@/lib/api';

// Vocabulary Service wrapper class for API calls
class VocabularyApiService extends BaseApiService {

  // Vocabulary API Functions
  async createVocabulary(vocabularyItems: Array<Omit<Vocabulary, 'id' | 'topicId' | 'status'> & { topicId: string }>) {
    return this.handleApiCall(() =>
      this.apiClient('/api/vocabulary', {
        method: 'POST',
        body: JSON.stringify(vocabularyItems),
      })
    );
  }

  async updateVocabulary(vocabId: string, vocabData: Partial<Vocabulary>) {
    return this.handleApiCall(() =>
      this.apiClient(`/api/vocabulary/${vocabId}`, {
        method: 'PATCH',
        body: JSON.stringify(vocabData),
      })
    );
  }

  async deleteVocabulary(vocabId: string) {
    return this.handleApiCall(() =>
      this.apiClient(`/api/vocabulary/${vocabId}`, {
        method: 'DELETE',
      })
    );
  }

  async updateVocabularyStatus(vocabId: string, status: Vocabulary['status']) {
    return this.handleApiCall(() =>
      this.apiClient(`/api/vocabulary/${vocabId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      })
    );
  }
}

// Create and export a singleton instance
const vocabularyApiService = new VocabularyApiService(apiClient);

// Export the service instance
export { vocabularyApiService };

// Export individual functions for backward compatibility
export const createVocabulary = (vocabularyItems: Array<Omit<Vocabulary, 'id' | 'topicId' | 'status'> & { topicId: string }>) => vocabularyApiService.createVocabulary(vocabularyItems);
export const updateVocabulary = (vocabId: string, vocabData: Partial<Vocabulary>) => vocabularyApiService.updateVocabulary(vocabId, vocabData);
export const deleteVocabulary = (vocabId: string) => vocabularyApiService.deleteVocabulary(vocabId);
export const updateVocabularyStatus = (vocabId: string, status: Vocabulary['status']) => vocabularyApiService.updateVocabularyStatus(vocabId, status);