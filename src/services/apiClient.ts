import { ACTIVE_ENV } from '@/constants/api';

export interface ApiResponse<T = any> {
  data: T | null;
  error?: string | null;
  status: number;
}

/**
 * Scalable Base API Client for Backend & Microservices
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {},
  baseUrl: string = ACTIVE_ENV.API_BASE_URL
): Promise<ApiResponse<T>> {
  try {
    const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers || {}),
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        data: null,
        error: (data && data.message) || `Request failed with status ${response.status}`,
        status: response.status,
      };
    }

    return {
      data,
      status: response.status,
    };
  } catch (error: any) {
    return {
      data: null,
      error: error?.message || 'Network request error',
      status: 0,
    };
  }
}
