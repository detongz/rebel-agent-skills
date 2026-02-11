/**
 * Wallet configuration management
 *
 * Handles loading and saving wallet configuration
 * from ~/.myskills/config.json
 */

import { readFile, writeFile } from 'fs/promises';
import { existsSync, mkdirSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

import type { Config } from '../types/config.js';

// ============================================================================
// Constants
// ============================================================================

const CONFIG_DIR = join(homedir(), '.myskills');
const CONFIG_FILE = join(CONFIG_DIR, 'config.json');

// ============================================================================
// Config Directory Management
// ============================================================================

/**
 * Ensure config directory exists
 */
export async function ensureConfigDir(): Promise<void> {
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true });
  }
}

/**
 * Ensure config directory exists (sync version)
 */
export function ensureConfigDirSync(): void {
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true });
  }
}

// ============================================================================
// Config File Operations
// ============================================================================

/**
 * Load wallet configuration from config file
 * @returns Config object (empty if file doesn't exist or is invalid)
 */
export async function loadConfig(): Promise<Config> {
  if (!existsSync(CONFIG_FILE)) {
    return {};
  }
  try {
    const content = await readFile(CONFIG_FILE, 'utf-8');
    return JSON.parse(content);
  } catch {
    return {};
  }
}

/**
 * Load wallet configuration (sync version)
 * @returns Config object (empty if file doesn't exist or is invalid)
 */
export function loadConfigSync(): Config {
  if (!existsSync(CONFIG_FILE)) {
    return {};
  }
  try {
    const content = require('fs').readFileSync(CONFIG_FILE, 'utf-8');
    return JSON.parse(content);
  } catch {
    return {};
  }
}

/**
 * Save wallet configuration to config file
 * @param config - Config object to save
 */
export async function saveConfig(config: Config): Promise<void> {
  await ensureConfigDir();
  await writeFile(CONFIG_FILE, JSON.stringify(config, null, 2));
}

/**
 * Save wallet configuration (sync version)
 * @param config - Config object to save
 */
export function saveConfigSync(config: Config): void {
  ensureConfigDirSync();
  require('fs').writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

// ============================================================================
// Exports
// ============================================================================

export { CONFIG_DIR, CONFIG_FILE };
