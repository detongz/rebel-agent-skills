/**
 * Skill-related types for MySkills Protocol
 *
 * Shared types for skills, agents, and marketplace data
 * across CLI, MCP Server, and OpenClaw Plugin.
 */

import type { Address } from 'viem';

/**
 * Core Skill interface
 */
export interface Skill {
  /** Unique skill identifier (keccak256 hash) */
  id: string;
  /** Display name */
  name: string;
  /** GitHub repository (owner/repo format) */
  repo?: string;
  /** Creator wallet address */
  creator: Address;
  /** Platform hosting the skill */
  platform?: 'claude-code' | 'coze' | 'manus' | 'minimbp' | 'myskills';
  /** Short description */
  description?: string;
  /** Security score (0-100) */
  securityScore?: number;
  /** Total tips received in ASKL */
  totalTips?: number;
  /** Total stars earned */
  totalStars?: number;
  /** Total earnings in ASKL */
  totalEarnings?: number;
  /** Number of tips received */
  tipsReceived?: number;
  /** Skill category */
  category?: string;
  /** Repository URL */
  repository?: string;
  /** Creation timestamp */
  createdAt: number | Date;
  /** Installation timestamp */
  installedAt?: number;
}

/**
 * Skill metadata from SKILL.md or API
 */
export interface SkillMetadata {
  /** Skill name */
  name: string;
  /** Description of what the skill does */
  description?: string;
  /** Version string */
  version?: string;
  /** Author/handler name */
  author?: string;
  /** Local file system path */
  path?: string;
}

/**
 * Extended skill info with payment details
 */
export interface SkillInfo {
  /** Skill ID */
  id: string;
  /** Skill name */
  name: string;
  /** Creator address */
  creator: Address;
  /** Payment address (may differ from creator) */
  payment_address?: Address;
  /** Total tips received */
  totalTips: string;
  /** Number of tips */
  tipCount: number;
}

/**
 * Skill result from search/marketplace
 */
export interface SkillResult {
  /** Skill name */
  name: string;
  /** Description */
  description: string;
  /** Platform */
  platform: string;
  /** Data source */
  source: 'vercel' | 'clawhub' | 'local';
  /** Security score */
  securityScore?: number;
  /** Install command */
  installCommand: string;
  /** Repository URL */
  repository?: string;
  /** GitHub stars */
  stars?: number;
}

/**
 * Leaderboard entry
 */
export interface LeaderboardEntry {
  /** Skill ID */
  id: string;
  /** Skill name */
  name: string;
  /** Creator address */
  creator: Address;
  /** Category */
  category?: string;
  /** Security score */
  securityScore?: number;
  /** Total earnings */
  totalEarnings?: number;
  /** Tips received */
  tipsReceived?: number;
}

/**
 * Balance information for an address
 */
export interface BalanceInfo {
  /** MON token balance */
  mon: string;
  /** ASKL token balance */
  askl: string;
}
