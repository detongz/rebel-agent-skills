/**
 * GitHub Parser - Parse GitHub URLs and read skill metadata
 *
 * Handles GitHub repository URL parsing and SKILL.md metadata reading
 */

import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

import type { SkillMetadata } from '../types/skills.js';

const execAsync = promisify(exec);

// ============================================================================
// GitHub URL Parsing
// ============================================================================

/**
 * Result from parsing a GitHub URL
 */
export interface GitHubRepo {
  /** Repository owner */
  owner: string;
  /** Repository name */
  repo: string;
}

/**
 * Parse a GitHub URL to extract owner and repo
 *
 * @param url - GitHub URL (supports multiple formats)
 * @returns Parsed owner/repo or null if invalid
 *
 * Supported formats:
 * - https://github.com/owner/repo
 * - https://github.com/owner/repo.git
 * - github.com/owner/repo
 * - owner/repo
 */
export function parseGitHubUrl(url: string): GitHubRepo | null {
  // Handle github:owner/repo format
  if (url.startsWith('github:')) {
    const parts = url.slice(7).split('/');
    if (parts.length === 2) {
      return { owner: parts[0], repo: parts[1] };
    }
  }

  // Handle gh:owner/repo format
  if (url.startsWith('gh:')) {
    const parts = url.slice(3).split('/');
    if (parts.length === 2) {
      return { owner: parts[0], repo: parts[1] };
    }
  }

  // Handle owner/repo format
  if (url.match(/^[^/]+\/[^/]+$/)) {
    const parts = url.split('/');
    return { owner: parts[0], repo: parts[1] };
  }

  // Handle https://github.com/owner/repo format
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match) return null;

  return {
    owner: match[1],
    repo: match[2].replace('.git', ''),
  };
}

/**
 * Format GitHub API URL for a repository
 */
export function getGitHubApiUrl(owner: string, repo: string): string {
  return `https://api.github.com/repos/${owner}/${repo}`;
}

/**
 * Format GitHub clone URL for a repository
 */
export function getGitHubCloneUrl(owner: string, repo: string): string {
  return `https://github.com/${owner}/${repo}.git`;
}

// ============================================================================
// SKILL.md Metadata Parsing
// ============================================================================

/**
 * Read and parse SKILL.md file metadata
 *
 * @param skillPath - Path to skill directory
 * @returns Parsed metadata or null if file doesn't exist
 *
 * SKILL.md format (supports both styles):
 * ```markdown
 * # Skill Name
 *
 * **Description:** Skill description
 * **Version:** 1.0.0
 * **Author:** Author Name
 *
 * Or:
 * > **Description:** Skill description
 * > **Version:** 1.0.0
 * > **Author:** Author Name
 * ```
 */
export async function readSkillMetadata(skillPath: string): Promise<SkillMetadata | null> {
  const skillFile = join(skillPath, 'SKILL.md');

  if (!existsSync(skillFile)) {
    return null;
  }

  try {
    const content = await readFile(skillFile, 'utf-8');

    // Parse metadata from SKILL.md
    const nameMatch = content.match(/^#\s+(.+)$/m);
    const descMatch = content.match(/^>?\s*\*\*(?:Description|描述):\*\*\s*(.+)$/m);
    const versionMatch = content.match(/^>?\s*\*\*(?:Version|版本):\*\*\s*(.+)$/m);
    const authorMatch = content.match(/^>?\s*\*\*(?:Author|作者):\*\*\s*(.+)$/m);

    return {
      name: nameMatch?.[1]?.trim() || 'Unknown',
      description: descMatch?.[1]?.trim(),
      version: versionMatch?.[1]?.trim() || '1.0.0',
      author: authorMatch?.[1]?.trim(),
      path: skillPath,
    };
  } catch {
    return null;
  }
}

/**
 * Find skill directory with SKILL.md
 *
 * @param basePath - Base path to search from
 * @returns Path to skill directory or null
 *
 * Checks these locations in order:
 * - basePath/SKILL.md
 * - basePath/skill/SKILL.md
 * - basePath/skills/SKILL.md
 * - basePath/.skills/SKILL.md
 * - Any subdirectory with SKILL.md
 */
export async function findSkillDir(basePath: string): Promise<string | null> {
  const possiblePaths = [
    basePath,
    join(basePath, 'skill'),
    join(basePath, 'skills'),
    join(basePath, '.skills'),
  ];

  for (const path of possiblePaths) {
    if (existsSync(path)) {
      const { isDirectorySync } = require('fs');
      if (isDirectorySync(path)) {
        // Check if SKILL.md exists
        if (existsSync(join(path, 'SKILL.md'))) {
          return path;
        }
        // Check if any subdirectory has SKILL.md
        try {
          const { readdirSync } = require('fs');
          const entries = readdirSync(path);
          for (const entry of entries) {
            const subPath = join(path, entry);
            if (isDirectorySync(subPath) && existsSync(join(subPath, 'SKILL.md'))) {
              return subPath;
            }
          }
        } catch {
          // Continue
        }
      }
    }
  }

  return null;
}
