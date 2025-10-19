import type { Vocabulary } from '@/lib/types';

// Import the base service and apiClient
import { BaseApiService } from './base-api-service';
import { apiClient } from '@/lib/api';

// Topics Vocabularies Service wrapper class for API calls
class TopicsVocabulariesApiService extends BaseApiService {

  // Topics Vocabularies API Functions
  async deleteVocabularies(topicId: string, ids: string[]) {
    return this.handleApiCall(() =>
      this.apiClient(`/api/topics/${topicId}/vocabularies`, {
        method: 'DELETE',
        body: JSON.stringify({ ids }),
      })
    );
  }

  async updateVocabularies(topicId: string, vocabularies: Vocabulary[]) {
    return this.handleApiCall(() =>
      this.apiClient(`/api/topics/${topicId}/vocabularies`, {
        method: 'PUT',
        body: JSON.stringify({ vocabularies }),
      })
    );
  }


  async updateTopicHeader(projectId: string, topicId: string, data: { title: string; description: string }) {
    return this.handleApiCall(() =>
      this.apiClient(`/api/projects/${projectId}/topics/${topicId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      })
    );
  }
}

// Create and export a singleton instance
const topicsVocabulariesApiService = new TopicsVocabulariesApiService(apiClient);

// Export the service instance
export { topicsVocabulariesApiService };

// Export individual functions for backward compatibility
export const deleteVocabularies = (topicId: string, ids: string[]) => topicsVocabulariesApiService.deleteVocabularies(topicId, ids);
export const updateVocabularies = (topicId: string, vocabularies: Vocabulary[]) => topicsVocabulariesApiService.updateVocabularies(topicId, vocabularies);
export const updateTopicHeader = (projectId: string, topicId: string, data: { title: string; description: string }) => topicsVocabulariesApiService.updateTopicHeader(projectId, topicId, data);