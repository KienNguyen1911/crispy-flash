import { HeatmapData } from '@/lib/types';

// Import the base service and apiClient
import { BaseApiService } from './base-api-service';
import { apiClient } from '@/lib/api';

// Analytics Service wrapper class for API calls
class AnalyticsApiService extends BaseApiService {

  // Analytics API Functions
  async getProjectProgress(fetcher: Function, projectId: string) {
    return this.handleApiCall(() => fetcher(`/api/analytics/project/${projectId}`));
  }

  async getUserLearningStats(fetcher: Function) {
    return this.handleApiCall(() => fetcher(`/api/analytics/user`));
  }

  async getUserHeatmapData(): Promise<HeatmapData[]> {
    return this.handleApiCall(() => this.apiClient<HeatmapData[]>('/api/analytics/user/heatmap', {
      cache: 'no-store',
    }));
  }

  async getUserInfo() {
    return this.handleApiCall(() => this.apiClient('/api/users/me'));
  }
}

// Create and export a singleton instance
const analyticsApiService = new AnalyticsApiService(apiClient);

// Export the service instance
export { analyticsApiService };

// Export individual functions for backward compatibility
export const getProjectProgress = (fetcher: Function, projectId: string) => analyticsApiService.getProjectProgress(fetcher, projectId);
export const getUserLearningStats = (fetcher: Function) => analyticsApiService.getUserLearningStats(fetcher);
export const getUserHeatmapData = () => analyticsApiService.getUserHeatmapData();
export const getUserInfo = () => analyticsApiService.getUserInfo();