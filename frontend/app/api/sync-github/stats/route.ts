// app/api/sync-github/stats/route.ts - 同步 GitHub 统计数据
import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

// 从 GitHub 仓库 URL 提取 owner/repo
function extractRepoFromUrl(url: string): { owner: string; repo: string } | null {
  if (!url) return null;

  // 支持多种格式
  const patterns = [
    /github\.com\/([^\/]+)\/([^\/\.]+)/,
    /github\.com\/([^\/]+)\/([^\/]+)\.git/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return { owner: match[1], repo: match[2].replace(/\.git$/, '') };
    }
  }

  return null;
}

// 调用 GitHub API 获取仓库信息
async function fetchGitHubStats(owner: string, repo: string): Promise<{ stars: number; forks: number } | null> {
  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        // 可选：添加 GitHub token 提高 rate limit
        // 'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
        'User-Agent': 'Agent-Reward-Hub',
      },
      // 缓存 5 分钟
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      console.error(`GitHub API error: ${res.status} ${res.statusText}`);
      return null;
    }

    const data = await res.json();
    return {
      stars: data.stargazers_count || 0,
      forks: data.forks_count || 0,
    };
  } catch (error) {
    console.error('Failed to fetch GitHub stats:', error);
    return null;
  }
}

// GET - 同步所有 Skills 的 GitHub 统计数据
export async function GET(request: NextRequest) {
  try {
    // 获取所有有 repository 的 Skills
    const skills = db.prepare(`
      SELECT id, name, repository, github_stars, github_forks
      FROM skills
      WHERE repository IS NOT NULL AND repository != ''
      AND status = 'active'
    `).all() as any[];

    const results = {
      success: 0,
      failed: 0,
      skipped: 0,
      updates: [] as any[],
    };

    for (const skill of skills) {
      const repoInfo = extractRepoFromUrl(skill.repository);

      if (!repoInfo) {
        results.skipped++;
        results.updates.push({
          id: skill.id,
          name: skill.name,
          status: 'skipped',
          reason: 'Invalid GitHub URL',
        });
        continue;
      }

      const stats = await fetchGitHubStats(repoInfo.owner, repoInfo.repo);

      if (!stats) {
        results.failed++;
        results.updates.push({
          id: skill.id,
          name: skill.name,
          status: 'failed',
          reason: 'GitHub API error',
        });
        continue;
      }

      // 检查是否有变化
      const hasChanges = stats.stars !== skill.github_stars || stats.forks !== skill.github_forks;

      if (!hasChanges) {
        results.skipped++;
        results.updates.push({
          id: skill.id,
          name: skill.name,
          status: 'unchanged',
          stars: stats.stars,
          forks: stats.forks,
        });
        continue;
      }

      // 更新数据库
      db.prepare(`
        UPDATE skills
        SET github_stars = ?,
            github_forks = ?,
            stats_updated_at = datetime('now'),
            updated_at = datetime('now')
        WHERE id = ?
      `).run(stats.stars, stats.forks, skill.id);

      results.success++;
      results.updates.push({
        id: skill.id,
        name: skill.name,
        status: 'updated',
        oldStars: skill.github_stars,
        newStars: stats.stars,
        oldForks: skill.github_forks,
        newForks: stats.forks,
      });
    }

    return NextResponse.json({
      success: true,
      summary: {
        total: skills.length,
        updated: results.success,
        skipped: results.skipped,
        failed: results.failed,
      },
      updates: results.updates,
    });
  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to sync GitHub stats' },
      { status: 500 }
    );
  }
}
