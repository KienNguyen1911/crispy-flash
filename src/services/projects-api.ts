import type { Project } from '@/lib/types';

// Import the base service and apiClient
import { BaseApiService } from './base-api-service';
import { apiClient } from '@/lib/api';

// Projects Service wrapper class for API calls
class ProjectsApiService extends BaseApiService {

  // Projects API Functions
  async getProjects(): Promise<Project[]> {
    return this.handleApiCall(() => this.apiClient('/api/projects'));
  }

  async createProject(projectData: { title: string; description: string }) {
    return this.handleApiCall(() =>
      this.apiClient('/api/projects', {
        method: 'POST',
        body: JSON.stringify(projectData),
      })
    );
  }

  async updateProject(projectId: string, projectData: { title?: string; description?: string }) {
    return this.handleApiCall(() =>
      this.apiClient(`/api/projects/${projectId}`, {
        method: 'PATCH',
        body: JSON.stringify(projectData),
      })
    );
  }

  async deleteProject(projectId: string) {
    return this.handleApiCall(() =>
      this.apiClient(`/api/projects/${projectId}`, {
        method: 'DELETE',
      })
    );
  }
}

// Create and export a singleton instance
const projectsApiService = new ProjectsApiService(apiClient);

// Export the service instance
export { projectsApiService };

// Export individual functions for backward compatibility
export const getProjects = () => projectsApiService.getProjects();
export const createProject = (projectData: { title: string; description: string }) => projectsApiService.createProject(projectData);
export const updateProject = (projectId: string, projectData: { title?: string; description?: string }) => projectsApiService.updateProject(projectId, projectData);
export const deleteProject = (projectId: string) => projectsApiService.deleteProject(projectId);