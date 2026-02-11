/**
 * GitHub Client - Fetch repository metadata and clone repos
 *
 * Provides GitHub API integration and git operations
 */

import { exec } from 'child_process';
import { promisify } from 'util';

import { getGitHubApiUrl, getGitHubCloneUrl, type GitHubRepo } from './parser.js';

const execAsync = promisify(exec);

// ============================================================================
// Types
// ============================================================================

/**
 * Repository metadata from GitHub API
 */
export interface GitHubRepoMetadata {
  /** Repository name */
  name: string;
  /** Repository description */
  description: string;
  /** Primary language */
  language?: string;
  /** Star count */
  stargazersCount?: number;
  /** Default branch name */
  defaultBranch?: string;
}

// ============================================================================
// GitHub API
// ============================================================================

/**
 * Fetch repository metadata from GitHub API
 *
 * @param owner - Repository owner
 * @param repo - Repository name
 * @returns Repository metadata with fallback to repo name
 */
export async function fetchRepoMetadata(
  owner: string,
  repo: string
): Promise<GitHubRepoMetadata> {
  try {
    // Try to fetch from GitHub API (no auth needed for public repos)
    const response = await fetch(getGitHubApiUrl(owner, repo));

    if (response.ok) {
      const data: any = await response.json();
      return {
        name: data.name || repo,
        description: data.description || '',
        language: data.language,
        stargazersCount: data.stargazers_count,
        defaultBranch: data.default_branch,
      };
    }
  } catch {
    // Continue to fallback
  }

  // Fallback: use repo name
  return {
    name: repo,
    description: '',
  };
}

/**
 * Fetch repo metadata from parsed GitHub URL
 */
export async function fetchRepoMetadataFromUrl(url: string): Promise<GitHubRepoMetadata | null> {
  const { parseGitHubUrl } = require('./parser.js');
  const parsed = parseGitHubUrl(url);

  if (!parsed) {
    return null;
  }

  return fetchRepoMetadata(parsed.owner, parsed.repo);
}

// ============================================================================
// Git Operations
// ============================================================================

/**
 * Clone a GitHub repository to a local directory
 *
 * @param repo - Repository identifier (owner/repo) or parsed repo object
 * @param targetDir - Directory to clone into
 * @param timeout - Timeout in milliseconds (default: 60000 = 1 minute)
 * @returns Path to cloned repository
 */
export async function cloneGitHubRepo(
  repo: GitHubRepo | string,
  targetDir: string,
  timeout = 60000
): Promise<string> {
  const ownerRepo = typeof repo === 'string'
    ? repo
    : `${repo.owner}/${repo.repo}`;

  const url = typeof repo === 'string'
    ? getGitHubCloneUrl(...(ownerRepo.split('/') as [string, string]))
    : getGitHubCloneUrl(repo.owner, repo.repo);

  await execAsync(`git clone --depth 1 ${url} ${targetDir}`, { timeout });
  return targetDir;
}

/**
 * Check if a directory is a git repository
 */
export async function isGitRepo(dirPath: string): Promise<boolean> {
  try {
    await execAsync('git rev-parse --git-dir', { cwd: dirPath, timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get default branch name of a git repository
 */
export async function getGitBranch(dirPath: string): Promise<string | null> {
  try {
    const { stdout } = await execAsync('git rev-parse --abbrev-ref HEAD', {
      cwd: dirPath,
      timeout: 5000,
    });
    return stdout.trim() || null;
  } catch {
    return null;
  }
}
