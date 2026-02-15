import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSeedSkills } from '@/lib/seed-skills';
import { parseRepoUrl, fetchRepoInfo, updateSkillGitHubStats } from '@/lib/repos';

type SortOption = 'tips' | 'stars' | 'likes' | 'date' | 'name' | 'latest' | 'newest' | 'downloads';

type SkillRow = {
  id: number;
  skill_id: string;
  name: string;
  description: string;
  platform: string;
  version: string;
  creator_address: string;
  payment_address: string;
  repository: string | null;
  homepage: string | null;
  npm_package: string | null;
  download_count: number;
  github_stars: number;
  github_forks: number;
  total_tips: string;
  tip_count: number;
  platform_likes: number;
  logo_url: string | null;
  tags: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  stats_updated_at: string | null;
};

const SYNC_COOLDOWN_MS = 5 * 60 * 1000;
const SYNC_STALE_MS = 6 * 60 * 60 * 1000;
const SYNC_BATCH_SIZE = 8;
const GITHUB_TIMEOUT_MS = 4000;

let isSyncing = false;
let lastSyncStartedAt = 0;

function toSortOption(value: string | null): SortOption {
  const sort = (value || 'tips').toLowerCase();
  if (
    sort === 'tips' ||
    sort === 'stars' ||
    sort === 'likes' ||
    sort === 'date' ||
    sort === 'name' ||
    sort === 'latest' ||
    sort === 'newest' ||
    sort === 'downloads'
  ) {
    return sort;
  }
  return 'tips';
}

function getOrderByClause(sort: SortOption): string {
  switch (sort) {
    case 'stars':
      return 'github_stars DESC';
    case 'likes':
      return 'platform_likes DESC';
    case 'downloads':
      return 'download_count DESC';
    case 'date':
    case 'latest':
    case 'newest':
      return 'datetime(created_at) DESC';
    case 'name':
      return 'name ASC';
    case 'tips':
    default:
      return 'CAST(total_tips AS REAL) DESC';
  }
}

function shouldRefresh(statsUpdatedAt: string | null): boolean {
  if (!statsUpdatedAt) return true;
  const last = new Date(statsUpdatedAt).getTime();
  if (!Number.isFinite(last)) return true;
  return Date.now() - last > SYNC_STALE_MS;
}

async function fetchRepoInfoWithTimeout(owner: string, repo: string, token?: string) {
  const timeout = new Promise<null>((resolve) => {
    setTimeout(() => resolve(null), GITHUB_TIMEOUT_MS);
  });

  return Promise.race([fetchRepoInfo(owner, repo, token), timeout]);
}

function triggerBackgroundGitHubRefresh(skills: SkillRow[]): boolean {
  const now = Date.now();
  if (isSyncing) return false;
  if (now - lastSyncStartedAt < SYNC_COOLDOWN_MS) return false;

  const candidates = skills
    .filter((s) => s.repository && shouldRefresh(s.stats_updated_at))
    .slice(0, SYNC_BATCH_SIZE);

  if (candidates.length === 0) return false;

  isSyncing = true;
  lastSyncStartedAt = now;

  void (async () => {
    try {
      const token = process.env.GITHUB_TOKEN;
      for (const skill of candidates) {
        if (!skill.repository) continue;
        const parsed = parseRepoUrl(skill.repository);
        if (!parsed) continue;

        const repoInfo = await fetchRepoInfoWithTimeout(parsed.owner, parsed.repo, token);
        if (repoInfo) {
          await updateSkillGitHubStats(skill.skill_id, repoInfo);
        }
      }
    } catch (error) {
      console.error('Background GitHub refresh failed:', error);
    } finally {
      isSyncing = false;
    }
  })();

  return true;
}

function querySkillsFromCache(
  creator: string | null,
  platform: string | null,
  category: string | null,
  limit: number,
  sort: SortOption
): SkillRow[] {
  const where: string[] = ["status = 'active'"];
  const params: Array<string | number> = [];

  if (creator) {
    where.push('creator_address = ?');
    params.push(creator);
  }

  if (platform && platform !== 'all') {
    where.push('platform = ?');
    params.push(platform);
  }

  if (category) {
    where.push('(tags LIKE ? OR name LIKE ? OR description LIKE ?)');
    const fuzzy = `%${category}%`;
    params.push(fuzzy, fuzzy, fuzzy);
  }

  params.push(limit);

  const sql = `
    SELECT
      id, skill_id, name, description, platform, version,
      creator_address, payment_address, repository, homepage, npm_package,
      download_count, github_stars, github_forks, total_tips,
      tip_count, platform_likes, logo_url, tags, status,
      created_at, updated_at, stats_updated_at
    FROM skills
    WHERE ${where.join(' AND ')}
    ORDER BY ${getOrderByClause(sort)}
    LIMIT ?
  `;

  return db.prepare(sql).all(...params) as SkillRow[];
}

function mapSeedToApiShape(seed: Record<string, unknown>) {
  return {
    ...seed,
    tags: Array.isArray(seed.tags)
      ? seed.tags.map((tag) => String(tag)).join(',')
      : seed.tags,
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const creator = searchParams.get('creator');
    const category = searchParams.get('category');
    const platform = searchParams.get('platform');
    const sort = toSortOption(searchParams.get('sort'));

    const rawLimit = parseInt(searchParams.get('limit') || '50', 10);
    const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(rawLimit, 1), 100) : 50;

    const cachedSkills = querySkillsFromCache(creator, platform, category, limit, sort);

    if (cachedSkills.length > 0) {
      const refreshTriggered = triggerBackgroundGitHubRefresh(cachedSkills);

      return NextResponse.json(
        {
          success: true,
          data: cachedSkills,
          skills: cachedSkills,
          count: cachedSkills.length,
          sort,
          source: 'sqlite-cache',
          background_sync: {
            triggered: refreshTriggered,
            syncing: isSyncing,
          },
        },
        {
          status: 200,
          headers: {
            'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=120',
          },
        }
      );
    }

    const seed = getSeedSkills().slice(0, limit).map(mapSeedToApiShape);

    return NextResponse.json(
      {
        success: true,
        data: seed,
        skills: seed,
        count: seed.length,
        sort,
        source: 'seed-fallback',
        background_sync: {
          triggered: false,
          syncing: isSyncing,
        },
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=120',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching skills:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch skills',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
