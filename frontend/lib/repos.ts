/**
 * lib/repos.ts - GitHub Repository Integration
 *
 * Fetches repository metadata from GitHub API including stars, forks, etc.
 * Used for determining skill popularity (hot skills)
 */

export interface GitHubRepoInfo {
  id: number;
  name: string;
  full_name: string;
  stargazers_count: number;  // Stars count for hot skills ranking
  forks_count: number;
  watchers_count: number;
  open_issues_count: number;
  description: string | null;
  homepage: string | null;
  license: { key: string; name: string; } | null;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  language: string | null;
  topics: string[];
}

export interface ParsedRepoUrl {
  owner: string;
  repo: string;
}

/**
 * Parse GitHub repository URL to extract owner and repo name
 * Supports: https://github.com/owner/repo, git@github.com:owner/repo.git
 */
export function parseRepoUrl(url: string): ParsedRepoUrl | null {
  if (!url) return null;

  // Handle https://github.com/owner/repo format
  const httpsMatch = url.match(/github\.com\/([^\/]+)\/([^\/\.]+)/);
  if (httpsMatch) {
    return { owner: httpsMatch[1], repo: httpsMatch[2] };
  }

  // Handle git@github.com:owner/repo.git format
  const sshMatch = url.match(/github\.com[:\/]([^\/]+)\/([^\/\.]+)/);
  if (sshMatch) {
    return { owner: sshMatch[1], repo: sshMatch[2] };
  }

  return null;
}

/**
 * Fetch repository metadata from GitHub API
 */
export async function fetchRepoInfo(
  owner: string,
  repo: string,
  token?: string
): Promise<GitHubRepoInfo | null> {
  try {
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'MySkills-Protocol',
    };

    // Add GitHub token if available (for higher rate limits)
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}`,
      { headers }
    );

    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`Repository not found: ${owner}/${repo}`);
        return null;
      }
      if (response.status === 403) {
        console.warn('GitHub API rate limit exceeded. Consider adding a token.');
        return null;
      }
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const repoInfo = (await response.json()) as GitHubRepoInfo;
    return repoInfo;
  } catch (error) {
    console.error(`Failed to fetch repo info for ${owner}/${repo}:`, error);
    return null;
  }
}

/**
 * Fetch multiple repositories in batch (with rate limiting)
 */
export async function fetchMultipleRepos(
  repos: Array<{ owner: string; repo: string }>,
  token?: string,
  delayMs: number = 1000
): Promise<Map<string, GitHubRepoInfo>> {
  const results = new Map<string, GitHubRepoInfo>();

  for (const { owner, repo } of repos) {
    const key = `${owner}/${repo}`;
    const info = await fetchRepoInfo(owner, repo, token);
    if (info) {
      results.set(key, info);
    }

    // Rate limiting delay between requests
    if (repos.indexOf({ owner, repo } as any) < repos.length - 1) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  return results;
}

/**
 * Update skill GitHub stats in database
 */
export async function updateSkillGitHubStats(
  skillId: string,
  repoInfo: GitHubRepoInfo
): Promise<void> {
  const db = await import('./db').then(m => m.default);

  try {
    db.prepare(`
      UPDATE skills
      SET
        github_stars = ?,
        github_forks = ?,
        updated_at = datetime('now'),
        stats_updated_at = datetime('now')
      WHERE skill_id = ?
    `).run(
      repoInfo.stargazers_count,
      repoInfo.forks_count,
      skillId
    );

    console.log(`✅ Updated GitHub stats for skill ${skillId}: ${repoInfo.stargazers_count} stars`);
  } catch (error) {
    console.error(`Failed to update GitHub stats for ${skillId}:`, error);
  }
}

/**
 * Submit/refresh a skill's repository information
 */
export async function submitRepo(
  repoUrl: string,
  skillId?: string,
  token?: string
): Promise<{ success: boolean; stars?: number; error?: string }> {
  const parsed = parseRepoUrl(repoUrl);
  if (!parsed) {
    return { success: false, error: 'Invalid GitHub repository URL' };
  }

  const repoInfo = await fetchRepoInfo(parsed.owner, parsed.repo, token);
  if (!repoInfo) {
    return { success: false, error: 'Failed to fetch repository information' };
  }

  // If skillId is provided, update the database
  if (skillId) {
    await updateSkillGitHubStats(skillId, repoInfo);
  }

  return {
    success: true,
    stars: repoInfo.stargazers_count,
  };
}

/**
 * Batch update GitHub stats for all skills that have a repository URL
 */
export async function syncAllSkillsGitHubStats(
  token?: string
): Promise<{ updated: number; failed: number }> {
  const db = await import('./db').then(m => m.default);

  // Get all skills with repository URLs
  const skills = db.prepare(`
    SELECT skill_id, repository
    FROM skills
    WHERE repository IS NOT NULL
      AND repository != ''
      AND (stats_updated_at IS NULL
           OR datetime(stats_updated_at) < datetime('now', '-1 day'))
  `).all() as Array<{ skill_id: string; repository: string }>;

  let updated = 0;
  let failed = 0;

  for (const skill of skills) {
    const parsed = parseRepoUrl(skill.repository);
    if (!parsed) {
      failed++;
      continue;
    }

    const repoInfo = await fetchRepoInfo(parsed.owner, parsed.repo, token);
    if (repoInfo) {
      await updateSkillGitHubStats(skill.skill_id, repoInfo);
      updated++;
    } else {
      failed++;
    }

    // Rate limiting delay
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  return { updated, failed };
}
