/**
 * API Client - Base fetch wrapper for MySkills API
 *
 * Provides typed API communication with the MySkills backend
 */

import type { ApiError, ScanResponse, SearchResponse, TipResponse } from '../types/api.js';

// ============================================================================
// Configuration
// ============================================================================

/**
 * Base URL for MySkills API
 * Can be overridden via MYSKILLS_API_BASE environment variable
 */
export const API_BASE = process.env.MYSKILLS_API_BASE || 'http://localhost:3000';

// ============================================================================
// Error Handling
// ============================================================================

/**
 * API error class
 */
export class ApiRequestError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: any
  ) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

/**
 * Check if response is an error
 */
export function isApiError(response: any): response is ApiError {
  return response && typeof response === 'object' && 'success' in response && response.success === false;
}

// ============================================================================
// Base API Client
// ============================================================================

/**
 * Make an API call to MySkills backend
 *
 * @param endpoint - API endpoint path (e.g., '/api/search')
 * @param options - Fetch options
 * @returns Typed response data
 * @throws ApiRequestError on failure
 */
export async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new ApiRequestError(
      `API Error: ${response.status} ${response.statusText}`,
      response.status
    );
  }

  const data = await response.json();

  // Check for API error responses
  if (isApiError(data)) {
    throw new ApiRequestError(data.error, response.status, data);
  }

  return data as T;
}

/**
 * POST request helper
 */
export async function apiPost<T>(endpoint: string, body: any): Promise<T> {
  return apiCall<T>(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/**
 * GET request helper
 */
export async function apiGet<T>(endpoint: string): Promise<T> {
  return apiCall<T>(endpoint, {
    method: 'GET',
  });
}
