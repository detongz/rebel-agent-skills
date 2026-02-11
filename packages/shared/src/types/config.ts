/**
 * Configuration types for MySkills Protocol
 *
 * Shared types for wallet configuration, platform settings,
 * and network configuration across CLI, MCP Server, and OpenClaw Plugin.
 */

import type { Skill } from './skills.js';

/**
 * Wallet configuration stored in ~/.myskills/config.json
 */
export interface Config {
  /** Private key for signing transactions (encrypted in production) */
  privateKey?: string;
  /** Derived wallet address */
  address?: string;
}

/**
 * Network configuration
 */
export interface NetworkConfig {
  /** Chain ID (10143 for testnet, 143 for mainnet) */
  id: number;
  /** Network display name */
  name: string;
  /** RPC endpoints */
  rpcUrls: {
    default: { http: string[] };
  };
  /** Block explorer URLs */
  blockExplorers?: {
    default: { name: string; url: string };
  };
  /** Native token configuration */
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  /** Whether this is a testnet */
  testnet?: boolean;
}

/**
 * Local registry configuration
 */
export interface LocalRegistry {
  /** Array of registered skills */
  skills: Skill[];
}

/**
 * Contract addresses configuration
 */
export interface ContractAddresses {
  /** ASKL Token contract address */
  mySkillsContract: `0x${string}`;
  /** Bounty Hub contract address */
  bountyHubContract: `0x${string}`;
}

// Re-export skill-related types
export type { Skill, SkillMetadata, SkillInfo } from './skills.js';
export type { SearchResponse, ScanResult, TipResponse } from './api.js';
