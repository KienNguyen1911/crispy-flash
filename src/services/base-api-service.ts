// Import the apiClient from lib/api
import { apiClient } from '@/lib/api';

/**
 * Base API Service class providing common functionality for all API services.
 * Uses the Template Method pattern to provide consistent error handling and logging.
 */
export abstract class BaseApiService {
  protected apiClient: typeof apiClient;

  constructor(apiClientFn: typeof apiClient) {
    this.apiClient = apiClientFn;
  }

  /**
   * Generic method for handling API calls with error handling.
   * This is the template method that provides consistent behavior across all services.
   */
  protected async handleApiCall<T>(
    apiCall: () => Promise<T>,
    serviceName: string = 'API'
  ): Promise<T> {
    try {
      return await apiCall();
    } catch (error) {
      console.error(`${serviceName} call failed:`, error);
      throw error;
    }
  }

  /**
   * Hook method that can be overridden by subclasses for custom error handling
   */
  protected handleError(error: any, serviceName: string): void {
    // Default error handling - can be overridden by subclasses
    console.error(`${serviceName} error:`, error);
  }

  /**
   * Hook method that can be overridden by subclasses for custom success handling
   */
  protected handleSuccess(result: any, serviceName: string): void {
    // Default success handling - can be overridden by subclasses if needed
  }
}