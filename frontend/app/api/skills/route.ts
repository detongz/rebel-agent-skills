import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { parseRepoUrl, fetchRepoInfo, updateSkillGitHubStats } from '@/lib/repos';
import { getGitHubToken } from '@/lib/github-token';
import { importSkillsFromGitHubRepo } from '@/lib/github-skill-import';

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
  data_source: string | null;
};

const SYNC_COOLDOWN_MS = 5 * 60 * 1000;
const SYNC_STALE_MS = 6 * 60 * 60 * 1000;
const SYNC_BATCH_SIZE = 8;
const GITHUB_TIMEOUT_MS = 4000;
const BOOTSTRAP_COOLDOWN_MS = 30 * 60 * 1000;

const DEFAULT_IMPORT_REPOS = [
  'https://github.com/detongz/rebel-agent-skills',
  'https://github.com/vercel-labs/skills',
  'https://github.com/anthropics/claude-code',
];

let isSyncing = false;
let lastSyncStartedAt = 0;
let isBootstrapping = false;
let lastBootstrapStartedAt = 0;

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
      const token = getGitHubToken();
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
  category: string | null,
  query: string | null,
  page: number,
  pageSize: number,
  sort: SortOption
): { rows: SkillRow[]; total: number } {
  const where: string[] = [
    "status = 'active'",
    "repository IS NOT NULL",
    "repository != ''",
    "repository LIKE 'https://github.com/%'",
    "(" +
      "data_source = 'github' " +
      "OR (" +
        "(data_source IS NULL OR data_source = 'unknown') " +
        "AND (npm_package IS NULL OR npm_package = '')" +
      ")" +
    ")",
  ];
  const params: Array<string | number> = [];

  if (creator) {
    where.push('creator_address = ?');
    params.push(creator);
  }

  if (category) {
    where.push('(tags LIKE ? OR name LIKE ? OR description LIKE ?)');
    const fuzzy = `%${category}%`;
    params.push(fuzzy, fuzzy, fuzzy);
  }

  if (query) {
    where.push('(name LIKE ? OR description LIKE ? OR tags LIKE ?)');
    const fuzzy = `%${query}%`;
    params.push(fuzzy, fuzzy, fuzzy);
  }

  const countSql = `
    SELECT COUNT(*) as total
    FROM skills
    WHERE ${where.join(' AND ')}
  `;
  const countRow = db.prepare(countSql).get(...params) as { total?: number } | undefined;
  const total = Number(countRow?.total || 0);

  const offset = (page - 1) * pageSize;
  const dataParams = [...params, pageSize, offset];

  const sql = `
    SELECT
      id, skill_id, name, description, platform, version,
      creator_address, payment_address, repository, homepage, npm_package,
      download_count, github_stars, github_forks, total_tips,
      tip_count, platform_likes, logo_url, tags, status,
      created_at, updated_at, stats_updated_at, data_source
    FROM skills
    WHERE ${where.join(' AND ')}
    ORDER BY ${getOrderByClause(sort)}
    LIMIT ? OFFSET ?
  `;

  const rows = db.prepare(sql).all(...dataParams) as SkillRow[];
  return { rows, total };
}

function resolveBootstrapRepos(): string[] {
  const fromEnv = (process.env.GITHUB_IMPORT_REPOS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return Array.from(new Set(fromEnv.length > 0 ? fromEnv : DEFAULT_IMPORT_REPOS));
}

async function bootstrapImportIfNeeded(): Promise<{
  attempted: boolean;
  imported: number;
  updated: number;
  failed: number;
}> {
  const now = Date.now();
  if (isBootstrapping) return { attempted: false, imported: 0, updated: 0, failed: 0 };
  if (now - lastBootstrapStartedAt < BOOTSTRAP_COOLDOWN_MS) {
    return { attempted: false, imported: 0, updated: 0, failed: 0 };
  }

  isBootstrapping = true;
  lastBootstrapStartedAt = now;
  let imported = 0;
  let updated = 0;
  let failed = 0;

  try {
    const token = getGitHubToken();
    const repos = resolveBootstrapRepos();

    for (const repo of repos) {
      try {
        const result = await importSkillsFromGitHubRepo(repo, { token });
        imported += result.imported;
        updated += result.updated;
      } catch (error) {
        failed += 1;
        console.error('Bootstrap import failed for repo:', repo, error);
      }
    }
    return { attempted: true, imported, updated, failed };
  } finally {
    isBootstrapping = false;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const creator = searchParams.get('creator');
    const category = searchParams.get('category');
    const query = (searchParams.get('q') || '').trim() || null;
    const sort = toSortOption(searchParams.get('sort'));

    const rawPage = parseInt(searchParams.get('page') || '1', 10);
    const page = Number.isFinite(rawPage) ? Math.max(rawPage, 1) : 1;
    const rawPageSize = parseInt(searchParams.get('pageSize') || searchParams.get('limit') || '12', 10);
    const pageSize = Number.isFinite(rawPageSize) ? Math.min(Math.max(rawPageSize, 1), 100) : 12;

    let { rows: cachedSkills, total } = querySkillsFromCache(creator, category, query, page, pageSize, sort);

    if (total > 0) {
      const refreshTriggered = triggerBackgroundGitHubRefresh(cachedSkills);

      return NextResponse.json(
        {
          success: true,
          data: cachedSkills,
          skills: cachedSkills,
          count: total,
          sort,
          q: query,
          source: 'github-cache',
          pagination: {
            page,
            pageSize,
            total,
            totalPages: Math.max(Math.ceil(total / pageSize), 1),
            hasNext: page * pageSize < total,
            hasPrev: page > 1,
          },
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

    const bootstrap = await bootstrapImportIfNeeded();
    if (bootstrap.attempted) {
      const queried = querySkillsFromCache(creator, category, query, page, pageSize, sort);
      cachedSkills = queried.rows;
      total = queried.total;
      if (cachedSkills.length > 0) {
        const refreshTriggered = triggerBackgroundGitHubRefresh(cachedSkills);
        return NextResponse.json(
          {
            success: true,
            data: cachedSkills,
            skills: cachedSkills,
            count: total,
            sort,
            q: query,
            source: 'github-cache',
            bootstrap,
            pagination: {
              page,
              pageSize,
              total,
              totalPages: Math.max(Math.ceil(total / pageSize), 1),
              hasNext: page * pageSize < total,
              hasPrev: page > 1,
            },
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
    }

    return NextResponse.json(
      {
        success: true,
        data: [],
        skills: [],
        count: total,
        sort,
        q: query,
        source: 'github-cache',
        bootstrap,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.max(Math.ceil(total / pageSize), 1),
          hasNext: false,
          hasPrev: page > 1,
        },
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
