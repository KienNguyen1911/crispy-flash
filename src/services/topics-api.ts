import type { Topic } from "@/lib/types";

// Import the base service and apiClient
import { BaseApiService } from "./base-api-service";
import { apiClient } from "@/lib/api";

// Topics Service wrapper class for API calls
class TopicsApiService extends BaseApiService {
  // Topics API Functions
  async getTopicById(topicId: string): Promise<Topic> {
    return this.handleApiCall(() => this.apiClient(`/api/topics/${topicId}`));
  }

  async createTopic(topicData: {
    title: string;
    description: string;
    projectId: string;
  }) {
    return this.handleApiCall(() =>
      this.apiClient("/api/topics", {
        method: "POST",
        body: JSON.stringify(topicData),
      }),
    );
  }

  async updateTopic(
    topicId: string,
    topicData: Partial<{ title: string; description: string }>,
  ) {
    return this.handleApiCall(() =>
      this.apiClient(`/api/topics/${topicId}`, {
        method: "PATCH",
        body: JSON.stringify(topicData),
      }),
    );
  }

  async deleteTopic(topicId: string) {
    return this.handleApiCall(() =>
      this.apiClient(`/api/topics/${topicId}`, {
        method: "DELETE",
      }),
    );
  }

  async generateContent(
    topicId: string,
    language: "english" | "vietnamese",
    difficulty: "easy" | "medium" | "hard",
  ) {
    return this.handleApiCall(() =>
      this.apiClient(`/api/topics/${topicId}/generate-content`, {
        method: "POST",
        body: JSON.stringify({ language, difficulty }),
      }),
    );
  }

  async moveTopic(topicId: string, targetProjectId: string) {
    return this.handleApiCall(() =>
      this.apiClient(`/api/topics/${topicId}/move`, {
        method: "POST",
        body: JSON.stringify({ targetProjectId }),
      }),
    );
  }

  async getGenerationStatus(topicId: string, jobId: string) {
    return this.handleApiCall(() =>
      this.apiClient(
        `/api/topics/${topicId}/generation-status/${jobId}`,
        {
          method: "GET",
        },
      ),
    );
  }
}

// Create and export a singleton instance
const topicsApiService = new TopicsApiService(apiClient);

// Export the service instance
export { topicsApiService };

// Export individual functions for backward compatibility
export const getTopicById = (topicId: string) =>
  topicsApiService.getTopicById(topicId);
export const createTopic = (topicData: {
  title: string;
  description: string;
  projectId: string;
}) => topicsApiService.createTopic(topicData);
export const updateTopic = (
  topicId: string,
  topicData: Partial<{ title: string; description: string }>,
) => topicsApiService.updateTopic(topicId, topicData);
export const deleteTopic = (topicId: string) =>
  topicsApiService.deleteTopic(topicId);
export const generateContent = (
  topicId: string,
  language: "english" | "vietnamese",
  difficulty: "easy" | "medium" | "hard",
) => topicsApiService.generateContent(topicId, language, difficulty);
export const moveTopic = (topicId: string, targetProjectId: string) =>
  topicsApiService.moveTopic(topicId, targetProjectId);

export const getGenerationStatus = (topicId: string, jobId: string) =>
  topicsApiService.getGenerationStatus(topicId, jobId);
