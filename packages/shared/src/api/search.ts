/**
 * Search API - Find skills by query
 *
 * Calls /api/search endpoint to get results from:
 * - Vercel Skills (npx skills)
 * - ClawHub (npx clawhub)
 * - Local database (registered skills)
 */

import type { SearchResponse } from '../types/api.js';
import { apiPost } from './client.js';
import type { Skill } from '../types/skills.js';

// ============================================================================
// Types
// ============================================================================

export interface SearchOptions {
  /** Filter by platform */
  platform?: string;
  /** Minimum security score */
  minScore?: string;
  /** Maximum results */
  limit?: string;
}

export interface SearchParams {
  /** Search query string */
  q: string;
  /** Platform filter */
  platform?: string;
  /** Minimum score filter */
  minScore?: string;
  /** Result limit */
  limit?: number;
}

// ============================================================================
// Search API
// ============================================================================

/**
 * Search for skills by query
 *
 * @param query - Search term(s)
 * @param options - Search filters
 * @returns Search results with skills from all sources
 */
export async function searchSkills(
  query: string,
  options: SearchOptions = {}
): Promise<SearchResponse> {
  const params: SearchParams = {
    q: query,
    platform: options.platform || 'all',
    minScore: options.minScore || '0',
    limit: parseInt(options.limit || '50'),
  };

  const queryParams = new URLSearchParams(params as any);
  return apiPost<SearchResponse>(`/api/search?${queryParams}`, {});
}

/**
 * Format search query for API
 */
export function formatSearchQuery(query: string[]): string {
  return query.join(' ');
}
