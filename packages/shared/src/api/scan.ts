/**
 * Scan API - Security scanning for skill repositories
 *
 * Calls /api/scan endpoint for:
 * - Free tier: Basic code pattern detection
 * - Paid tier: VirusTotal API integration (TODO)
 */

import type { ScanResponse, ScanResult } from '../types/api.js';
import { apiPost } from './client.js';

// ============================================================================
// Types
// ============================================================================

export interface ScanOptions {
  /** Run full/deep scan */
  full?: boolean;
  /** Output format */
  output?: 'text' | 'json';
}

// ============================================================================
// Scan API
// ============================================================================

/**
 * Scan a repository or skill URL for security issues
 *
 * @param url - Repository or skill URL to scan
 * @param options - Scan options
 * @returns Scan results with score and findings
 */
export async function scanSkill(
  url: string,
  options: ScanOptions = {}
): Promise<ScanResponse> {
  return apiPost<ScanResponse>('/api/scan', {
    url,
    full: options.full || false,
    output: options.output || 'text',
  });
}

/**
 * Check if skill is safe based on scan score
 */
export function isSkillSafe(score: number): boolean {
  return score >= 80;
}

/**
 * Check if skill score is warning level
 */
export function isSkillWarning(score: number): boolean {
  return score >= 50 && score < 80;
}

/**
 * Get status from scan score
 */
export function getScanStatus(score: number): ScanResult['status'] {
  if (score >= 80) return 'safe';
  if (score >= 50) return 'warning';
  return 'danger';
}
