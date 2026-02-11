/**
 * API response types for MySkills Protocol
 *
 * Shared types for API communication between CLI, MCP Server,
 * OpenClaw Plugin, and Frontend API routes.
 */

import type { Skill, LeaderboardEntry } from './skills.js';

/**
 * Search API response
 */
export interface SearchResponse {
  /** Whether request succeeded */
  success: boolean;
  /** Array of matching skills */
  data: Skill[];
  /** Total results count */
  count: number;
  /** Original query */
  query: string;
  /** Source breakdown */
  sources?: {
    /** Results from ClawHub */
    clawhub: number;
    /** Results from Vercel Skills */
    vercel: number;
  };
}

/**
 * Scan result status
 */
export type ScanStatus = 'safe' | 'warning' | 'danger';

/**
 * Security scan result
 */
export interface ScanResult {
  /** Scan ID */
  id: string;
  /** Target URL */
  url: string;
  /** Overall score (0-100) */
  score: number;
  /** Status classification */
  status: ScanStatus;
  /** Number of vulnerabilities found */
  vulnerabilities: number;
  /** Warning messages */
  warnings: string[];
  /** Detailed analysis */
  details: {
    /** Code analysis results */
    codeAnalysis: {
      score: number;
      findings: string[];
    };
    /** Dependency check results */
    dependencyCheck: {
      score: number;
      warnings: string[];
    };
  };
  /** Scan timestamp */
  createdAt: string;
}

/**
 * Scan API response
 */
export interface ScanResponse {
  /** Whether scan succeeded */
  success: boolean;
  /** Scan result data */
  data: ScanResult;
  /** Whether result was cached */
  cached?: boolean;
  /** Full scan availability info */
  fullScan?: {
    available: boolean;
    message: string;
    estimatedCost: string;
    features: string[];
  };
}

/**
 * Tip transaction response
 */
export interface TipResponse {
  /** Whether tip succeeded */
  success: boolean;
  /** Transaction data */
  data?: {
    tx_hash: string;
    skill_id: string;
    from_address: string;
    to_address: string;
    amount: string;
    creator_received: string;
    platform_fee: string;
    message?: string;
    block_number: number;
    timestamp: string;
  };
  /** Error message if failed */
  error?: string;
}

/**
 * Leaderboard response
 */
export interface LeaderboardResponse {
  success: boolean;
  data: LeaderboardEntry[];
  count: number;
}

/**
 * Publish/prepare response
 */
export interface PrepareResponse {
  payment_required: boolean;
  amount: string;
  currency: string;
  network: string;
  x402_facilitator: string;
  subscription_active?: boolean;
}

/**
 * API error response
 */
export interface ApiError {
  success: false;
  error: string;
  message?: string;
}
