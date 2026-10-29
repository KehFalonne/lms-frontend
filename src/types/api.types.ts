export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  meta?: PaginationMeta | null;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ApiError {
  success: false;
  statusCode: number;
  message: string;
  errors?: Record<string, string[]>;
  timestamp: string;
  path: string;
}
/**
 * Common pagination/filter params accepted by list endpoints.
 * The index signature allows arbitrary extra filters to pass through
 * to axios as query string parameters.
 */

export interface PaginatedParams {
  page?: number;
  pageSize?: number;
  search?: string;
  ordering?: string;
  [key: string]: unknown;
}

// Re-export generated schema components for convenient imports
export type { components, paths, operations } from "./api.generated";

/** Extract the type of a specific OpenAPI schema component. */
export type Schema<K extends keyof import("./api.generated").components["schemas"]> =
  import("./api.generated").components["schemas"][K];
