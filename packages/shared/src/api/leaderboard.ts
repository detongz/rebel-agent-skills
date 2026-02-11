/**
 * Leaderboard API - Top skills by creator earnings
 *
 * Fetches leaderboard data from MySkills API
 */

import type { LeaderboardResponse } from '../types/api.js';
import type { LeaderboardEntry } from '../types/skills.js';
import { apiGet } from './client.js';

// ============================================================================
// Types
// ============================================================================

export interface LeaderboardOptions {
  /** Time period filter */
  timeframe?: 'all' | 'week' | 'month';
  /** Maximum results */
  limit?: number;
}

// ============================================================================
// Leaderboard API
// ============================================================================

/**
 * Get leaderboard of top earning skills
 *
 * @param options - Leaderboard options
 * @returns Leaderboard entries sorted by earnings
 */
export async function getLeaderboard(
  options: LeaderboardOptions = {}
): Promise<LeaderboardResponse> {
  const params = new URLSearchParams({
    timeframe: options.timeframe || 'all',
    limit: (options.limit || 10).toString(),
  });

  return apiGet<LeaderboardResponse>(`/api/leaderboard?${params}`);
}

/**
 * Format timeframe for display
 */
export function formatTimeframe(timeframe: string): string {
  switch (timeframe) {
    case 'week':
      return 'This Week';
    case 'month':
      return 'This Month';
    default:
      return 'All Time';
  }
}
