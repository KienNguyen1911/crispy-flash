import { VocabularyWithSrs, DueReviewCount, ReviewFeedbackDto } from '@/types/srs';

// Re-export SRS types for convenience
export type { VocabularyWithSrs, DueReviewCount, ReviewFeedbackDto };

const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

export function apiUrl(path: string): string {
  return `${API_BASE}${path}`;
}

export interface ApiOptions extends RequestInit { }

// Flag để tránh nhiều refresh request chạy đồng thời
let isRefreshing = false;

export async function apiClient<T = any>(
  path: string,
  options: ApiOptions = {}
): Promise<T> {
  const url = apiUrl(path);

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Nếu nhận 401 và chưa đang trong quá trình refresh
  if (response.status === 401 && !isRefreshing && typeof window !== 'undefined') {
    isRefreshing = true;
    try {
      const storedRefreshToken = localStorage.getItem('refresh_token');
      if (storedRefreshToken) {
        const refreshRes = await fetch(apiUrl('/api/auth/refresh'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken: storedRefreshToken })
        });

        if (refreshRes.ok) {
          isRefreshing = false;
          const { access_token, refresh_token } = await refreshRes.json();
          // Luu token moi
          localStorage.setItem('jwt_token', access_token);
          localStorage.setItem('refresh_token', refresh_token);

          // Retry lại request gốc voi token moi
          (headers as Record<string, string>)['Authorization'] = `Bearer ${access_token}`;
          const retryRes = await fetch(url, {
            ...options,
            headers,
          });
          if (retryRes.ok) return retryRes.json() as T;
        }
      }
    } catch {
      // Refresh request thất bại
    } finally {
      isRefreshing = false;
    }

    // Refresh không thành công — redirect về trang chủ để login lại
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('refresh_token');
    window.location.href = '/';
    throw new Error('Session expired. Please log in again.');
  }

  if (!response.ok) {
    throw new Error(`API call failed: ${response.status} ${response.statusText}`);
  }

  return response.json() as T;
}
