/**
 * Local Registry - Manage ~/.myskills/registry.json
 *
 * Handles local skill registry storage for offline access
 */

import { readFile, writeFile } from 'fs/promises';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

import type { LocalRegistry, Config } from '../types/config.js';
import type { Skill } from '../types/skills.js';

// ============================================================================
// Constants
// ============================================================================

const REGISTRY_DIR = join(homedir(), '.myskills');
const REGISTRY_FILE = join(REGISTRY_DIR, 'registry.json');

// ============================================================================
// Directory Management
// ============================================================================

/**
 * Ensure registry directory exists
 */
export function ensureRegistryDir(): void {
  if (!existsSync(REGISTRY_DIR)) {
    mkdirSync(REGISTRY_DIR, { recursive: true });
  }
}

// ============================================================================
// Registry File Operations
// ============================================================================

/**
 * Load local registry from file
 * @returns Registry object (with empty skills array if file doesn't exist)
 */
export async function loadRegistry(): Promise<LocalRegistry> {
  if (!existsSync(REGISTRY_FILE)) {
    return { skills: [] };
  }
  try {
    const content = await readFile(REGISTRY_FILE, 'utf-8');
    return JSON.parse(content);
  } catch {
    return { skills: [] };
  }
}

/**
 * Load local registry (sync version)
 */
export function loadRegistrySync(): LocalRegistry {
  if (!existsSync(REGISTRY_FILE)) {
    return { skills: [] };
  }
  try {
    const content = require('fs').readFileSync(REGISTRY_FILE, 'utf-8');
    return JSON.parse(content);
  } catch {
    return { skills: [] };
  }
}

/**
 * Save registry to file
 * @param registry - Registry object to save
 */
export async function saveRegistry(registry: LocalRegistry): Promise<void> {
  ensureRegistryDir();
  await writeFile(REGISTRY_FILE, JSON.stringify(registry, null, 2));
}

/**
 * Save registry (sync version)
 */
export function saveRegistrySync(registry: LocalRegistry): void {
  ensureRegistryDir();
  require('fs').writeFileSync(REGISTRY_FILE, JSON.stringify(registry, null, 2));
}

// ============================================================================
// Skill Operations
// ============================================================================

/**
 * Add a skill to the local registry
 */
export async function addSkill(skill: Skill): Promise<void> {
  const registry = await loadRegistry();
  registry.skills.push(skill);
  await saveRegistry(registry);
}

/**
 * Find a skill by ID or name in local registry
 */
export async function findSkill(identifier: string): Promise<Skill | null> {
  const registry = await loadRegistry();
  return (
    registry.skills.find(
      s => s.id === identifier || s.name === identifier
    ) || null
  );
}

/**
 * Check if a skill already exists in registry
 */
export async function skillExists(repo: string): Promise<boolean> {
  const registry = await loadRegistry();
  return registry.skills.some(s => s.repo === repo);
}

/**
 * Get all skills from local registry
 */
export async function getAllSkills(): Promise<Skill[]> {
  const registry = await loadRegistry();
  return registry.skills;
}

/**
 * Remove a skill from registry by ID
 */
export async function removeSkill(skillId: string): Promise<boolean> {
  const registry = await loadRegistry();
  const initialLength = registry.skills.length;
  registry.skills = registry.skills.filter(s => s.id !== skillId);

  if (registry.skills.length < initialLength) {
    await saveRegistry(registry);
    return true;
  }
  return false;
}

// ============================================================================
// Exports
// ============================================================================

export { REGISTRY_DIR, REGISTRY_FILE };
