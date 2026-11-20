/**
 * Common App & Domain Types
 */

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role?: 'user' | 'admin' | 'advertiser';
  createdAt?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
