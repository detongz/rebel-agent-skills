/**
 * API Route: /api/sync-github
 *
 * POST: Sync GitHub stats (stars, forks) for skills
 * Fetches latest data from GitHub API and updates the database
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  parseRepoUrl,
  fetchRepoInfo,
  updateSkillGitHubStats,
  syncAllSkillsGitHubStats,
} from '@/lib/repos';

/**
 * POST /api/sync-github
 * Body:
 * - skillId: (optional) Sync specific skill by ID
 * - repoUrl: (optional) Sync specific repository URL
 * - all: (optional) Boolean, sync all skills if true
 * - token: (optional) GitHub personal access token for higher rate limits
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { skillId, repoUrl, all, token } = body;

    // Sync all skills
    if (all === true) {
      const result = await syncAllSkillsGitHubStats(token);
      return NextResponse.json({
        success: true,
        data: {
          updated: result.updated,
          failed: result.failed,
        },
        message: `Synced ${result.updated} skills, ${result.failed} failed`,
      });
    }

    // Sync specific skill/repo
    if (skillId || repoUrl) {
      let urlToSync = repoUrl;

      // If skillId is provided, get repo URL from database
      if (skillId && !repoUrl) {
        const db = (await import('@/lib/db')).default;
        const skill = db.prepare('SELECT repository FROM skills WHERE skill_id = ?').get(skillId) as { repository: string } | undefined;

        if (!skill?.repository) {
          return NextResponse.json(
            { success: false, error: 'Skill not found or has no repository URL' },
            { status: 404 }
          );
        }

        urlToSync = skill.repository;
      }

      if (!urlToSync) {
        return NextResponse.json(
          { success: false, error: 'Repository URL is required' },
          { status: 400 }
        );
      }

      const parsed = parseRepoUrl(urlToSync);
      if (!parsed) {
        return NextResponse.json(
          { success: false, error: 'Invalid GitHub repository URL' },
          { status: 400 }
        );
      }

      const repoInfo = await fetchRepoInfo(parsed.owner, parsed.repo, token);
      if (!repoInfo) {
        return NextResponse.json(
          { success: false, error: 'Failed to fetch repository information' },
          { status: 400 }
        );
      }

      // Update database if skillId was provided
      if (skillId) {
        await updateSkillGitHubStats(skillId, repoInfo);
      }

      return NextResponse.json({
        success: true,
        data: {
          stars: repoInfo.stargazers_count,
          forks: repoInfo.forks_count,
          repository: `${parsed.owner}/${parsed.repo}`,
        },
      });
    }

    return NextResponse.json(
      { success: false, error: 'Must provide skillId, repoUrl, or all=true' },
      { status: 400 }
    );
  } catch (error) {
    console.error('GitHub sync error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to sync GitHub stats',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/sync-github
 * Query params:
 * - skillId: Get sync status for specific skill
 *
 * Returns the sync status and last updated time
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const skillId = searchParams.get('skillId');

    const db = (await import('@/lib/db')).default;

    if (skillId) {
      const skill = db.prepare(`
        SELECT
          skill_id,
          name,
          repository,
          github_stars,
          github_forks,
          stats_updated_at
        FROM skills
        WHERE skill_id = ?
      `).get(skillId) as {
        skill_id: string;
        name: string;
        repository: string;
        github_stars: number;
        github_forks: number;
        stats_updated_at: string;
      } | undefined;

      if (!skill) {
        return NextResponse.json(
          { success: false, error: 'Skill not found' },
          { status: 404 }
        );
      }

      // Parse repository URL to show owner/repo
      const parsed = skill.repository ? parseRepoUrl(skill.repository) : null;

      return NextResponse.json({
        success: true,
        data: {
          skill_id: skill.skill_id,
          name: skill.name,
          repository: skill.repository,
          repo_owner: parsed?.owner || null,
          repo_name: parsed?.repo || null,
          github_stars: skill.github_stars || 0,
          github_forks: skill.github_forks || 0,
          stats_updated_at: skill.stats_updated_at,
          needs_sync: !skill.stats_updated_at ||
            new Date(skill.stats_updated_at) < new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      });
    }

    // Get overall sync status
    const stats = db.prepare(`
      SELECT
        COUNT(*) as total,
        COUNT(github_stars) as with_stars,
        COUNT(CASE WHEN stats_updated_at IS NOT NULL
          AND datetime(stats_updated_at) > datetime('now', '-1 day')
        THEN 1 END) as recently_synced
      FROM skills
      WHERE repository IS NOT NULL AND repository != ''
    `).get() as {
      total: number;
      with_stars: number;
      recently_synced: number;
    };

    return NextResponse.json({
      success: true,
      data: {
        total_skills_with_repos: stats.total,
        skills_with_stars: stats.with_stars,
        skills_recently_synced: stats.recently_synced,
        sync_percentage: stats.total > 0 ? Math.round((stats.recently_synced / stats.total) * 100) : 0,
      },
    });
  } catch (error) {
    console.error('GitHub status check error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get sync status',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
