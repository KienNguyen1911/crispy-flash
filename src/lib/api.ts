import { VocabularyWithSrs, DueReviewCount, ReviewFeedbackDto } from '@/types/srs';

// Re-export SRS types for convenience
export type { VocabularyWithSrs, DueReviewCount, ReviewFeedbackDto };

const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

export function apiUrl(path: string): string {
  return `${API_BASE}${path}`;
}

export interface ApiOptions extends RequestInit { }

// Flag và queue để tránh nhiều refresh request chạy đồng thời và xử lý race conditions
let isRefreshing = false;
let failedQueue: { resolve: (value: any) => void; reject: (reason?: any) => void; options: ApiOptions & { url?: string } }[] = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      // Retry with new token
      const headers = { ...prom.options.headers } as Record<string, string>;
      if (token) headers['Authorization'] = `Bearer ${token}`;
      
      fetch(prom.options.url as string, { ...prom.options, headers })
        .then(res => {
          if (!res.ok) throw new Error(`API call failed: ${res.status} ${res.statusText}`);
          return res.json();
        })
        .then(prom.resolve)
        .catch(prom.reject);
    }
  });
  failedQueue = [];
};

export async function apiClient<T = any>(
  path: string,
  options: ApiOptions = {}
): Promise<T> {
  const url = apiUrl(path);
  // Store url in options for queueing
  const fetchOptions: ApiOptions & { url?: string } = { ...options, url };

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
    ...fetchOptions,
    headers,
  });

  // Nếu nhận 401
  if (response.status === 401 && typeof window !== 'undefined') {
    if (isRefreshing) {
      // Nếu đang refresh, đưa request vào queue chờ
      return new Promise<T>((resolve, reject) => {
        failedQueue.push({ resolve, reject, options: fetchOptions });
      });
    }

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
          const { access_token, refresh_token } = await refreshRes.json();
          // Luu token moi
          localStorage.setItem('jwt_token', access_token);
          localStorage.setItem('refresh_token', refresh_token);

          // Xử lý các request đang đợi
          processQueue(null, access_token);
          
          isRefreshing = false;

          // Retry lại request gốc voi token moi
          (headers as Record<string, string>)['Authorization'] = `Bearer ${access_token}`;
          const retryRes = await fetch(url, {
            ...fetchOptions,
            headers,
          });
          if (retryRes.ok) return retryRes.json() as T;
        }
      }
    } catch (refreshError) {
      processQueue(refreshError as Error, null);
    } finally {
      isRefreshing = false;
    }

    // Refresh lỗi -> Logout
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('refresh_token');
    processQueue(new Error('Session expired'), null);
    window.location.href = '/';
    throw new Error('Session expired. Please log in again.');
  }

  if (!response.ok) {
    throw new Error(`API call failed: ${response.status} ${response.statusText}`);
  }

  return response.json() as T;
}
