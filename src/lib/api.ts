const API_BASE = 'http://localhost:3000/api';

export function apiUrl(path: string): string {
  return `${API_BASE}${path}`;
}