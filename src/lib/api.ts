import { VocabularyWithSrs, DueReviewCount, ReviewFeedbackDto } from '@/types/srs';

// Re-export SRS types for convenience
export type { VocabularyWithSrs, DueReviewCount, ReviewFeedbackDto };

const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

export function apiUrl(path: string): string {
  return `${API_BASE}${path}`;
}

export interface ApiOptions extends RequestInit {
  // token?: string; // We don't need to pass the token manually anymore
}

export async function apiClient<T = any>(
  path: string,
  options: ApiOptions = {}
): Promise<T> {
  const url = apiUrl(path);
  const { ...fetchOptions } = options;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  };

  // --- MAIN CHANGE IS HERE ---
  // Only run on the client-side
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }
  }
  // --- END OF CHANGE ---

  const response = await fetch(url, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    // Add logic to handle expired tokens
    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        console.error('API Client - Unauthorized. Token may be expired. Logging out.');
        localStorage.removeItem('jwt_token');
        window.location.href = '/'; // Or an error page
      }
    }
    throw new Error(`API call failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
