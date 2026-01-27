/**
 * Shared utility type definitions for the AOSC CW Website
 * 
 * This file contains only general-purpose utility types that are used
 * across multiple features. Feature-specific types should be placed in
 * their respective feature/domain folders.
 */

/**
 * Stats card data for dashboard
 */
export interface StatsCard {
  title: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}

/**
 * Pagination state
 */
export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

/**
 * API response wrapper for error handling
 */
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

/**
 * Date range filter
 */
export interface DateRange {
  from: Date | string;
  to: Date | string;
}
