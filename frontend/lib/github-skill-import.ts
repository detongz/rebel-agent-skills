import crypto from 'crypto';
import db from '@/lib/db';

type ParsedRepo = {
  owner: string;
  repo: string;
  skillsPath?: string;
};

type SkillFrontmatter = {
  name?: string;
  description?: string;
  metadata?: Record<string, string>;
};

type ParsedSkill = {
  name: string;
  description: string;
  platform: string;
  version: string;
  tags: string[];
};

type GitHubRepoInfo = {
  default_branch?: string;
  stargazers_count?: number;
  forks_count?: number;
  html_url?: string;
};

type GitHubTreeResponse = {
  tree: Array<{ path: string; type: string; sha?: string; size?: number }>;
  truncated?: boolean;
};

type GitHubContent = {
  type: 'file' | 'dir';
  name: string;
  path: string;
  sha?: string;
  content?: string;
};

type ImportOptions = {
  token?: string;
  offset?: number;
  limit?: number;
};

type ImportedSkill = {
  skill_id: string;
  name: string;
  repository: string;
  platform: string;
  github_stars: number;
};

type ImportResult = {
  repo: string;
  imported: number;
  updated: number;
  scanned_paths: number;
  skills: ImportedSkill[];
  next_offset?: number;
  completed?: boolean;
};

const API_BASE = 'https://api.github.com';
const REQUEST_TIMEOUT_MS = 8000;

function isSkillsDirectorySkill(path: string): boolean {
  if (!path.endsWith('/SKILL.md') && path !== 'skills/SKILL.md') return false;
  return path.startsWith('skills/') || path.includes('/skills/');
}

function parseGitHubRepo(input: string): ParsedRepo | null {
  const trimmed = input.trim().replace(/\.git$/, '');
  const directMatch = /^([\w.-]+)\/([\w.-]+)(?:\/(.+))?$/.exec(trimmed);
  if (directMatch) {
    return {
      owner: directMatch[1],
      repo: directMatch[2],
      skillsPath: normalizeSkillsPath(directMatch[3]),
    };
  }

  try {
    const url = new URL(trimmed);
    if (url.hostname !== 'github.com') return null;
    const parts = url.pathname.replace(/^\/+/, '').split('/').filter(Boolean);
    if (parts.length < 2) return null;

    const owner = parts[0];
    const repo = parts[1];
    let skillsPath: string | undefined;

    if ((parts[2] === 'tree' || parts[2] === 'blob') && parts.length >= 4) {
      const pathParts = parts.slice(4);
      if (parts[2] === 'blob' && pathParts[pathParts.length - 1]?.toLowerCase() === 'skill.md') {
        pathParts.pop();
      }
      skillsPath = normalizeSkillsPath(pathParts.join('/'));
    }

    return { owner, repo, skillsPath };
  } catch {
    return null;
  }
}

function normalizeSkillsPath(path?: string): string | undefined {
  if (!path) return undefined;
  const normalized = path.replace(/^\/+|\/+$/g, '');
  return normalized || undefined;
}

function parseFrontmatter(content: string): SkillFrontmatter {
  const lines = content.split('\n');
  if (lines[0]?.trim() !== '---') return {};

  const frontmatterLines: string[] = [];
  for (let i = 1; i < lines.length; i += 1) {
    if (lines[i].trim() === '---') break;
    frontmatterLines.push(lines[i]);
  }

  return parseYaml(frontmatterLines.join('\n'));
}

function parseYaml(source: string): SkillFrontmatter {
  const result: SkillFrontmatter = {};
  const metadata: Record<string, string> = {};
  let inMetadata = false;

  for (const rawLine of source.split('\n')) {
    if (!rawLine.trim() || rawLine.trim().startsWith('#')) continue;

    const indent = (rawLine.match(/^(\s*)/)?.[1].length ?? 0);
    const line = rawLine.trim();
    const sep = line.indexOf(':');
    if (sep === -1) continue;

    const key = line.slice(0, sep).trim();
    const value = stripQuotes(line.slice(sep + 1).trim());

    if (indent === 0) {
      inMetadata = key === 'metadata' && value === '';
      if (key === 'name') result.name = value;
      if (key === 'description') result.description = value;
    } else if (inMetadata) {
      metadata[key] = value;
    }
  }

  if (Object.keys(metadata).length > 0) {
    result.metadata = metadata;
  }

  return result;
}

function stripQuotes(value: string): string {
  return value.replace(/^["']|["']$/g, '').trim();
}

function parseTags(input?: string): string[] {
  if (!input) return [];
  return input.split(',').map((item) => item.trim()).filter(Boolean);
}

function toParsedSkill(frontmatter: SkillFrontmatter): ParsedSkill | null {
  if (!frontmatter.name || !frontmatter.description) return null;

  return {
    name: frontmatter.name,
    description: frontmatter.description,
    platform: frontmatter.metadata?.platform || 'claude-code',
    version: frontmatter.metadata?.version || '1.0.0',
    tags: parseTags(frontmatter.metadata?.tags),
  };
}

function buildSkillId(owner: string, repo: string, path: string, name: string): string {
  const raw = `${owner}/${repo}:${path}:${name}`;
  return `0x${crypto.createHash('sha256').update(raw).digest('hex')}`;
}

async function getJson<T>(url: string, token?: string): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'agent-skills',
    };
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(url, { headers, signal: controller.signal });
    if (!res.ok) {
      throw new Error(`GitHub API ${res.status} for ${url}`);
    }
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

async function tryGetJson<T>(url: string, token?: string): Promise<T | null> {
  try {
    return await getJson<T>(url, token);
  } catch {
    return null;
  }
}

async function fetchBlobContent(owner: string, repo: string, sha: string, token?: string): Promise<string | null> {
  const blob = await tryGetJson<{ content?: string; encoding?: string }>(
    `${API_BASE}/repos/${owner}/${repo}/git/blobs/${sha}`,
    token
  );
  if (!blob?.content) return null;
  if (blob.encoding === 'base64') {
    return Buffer.from(blob.content, 'base64').toString('utf-8');
  }
  return blob.content;
}

async function fetchSkillFile(
  owner: string,
  repo: string,
  path: string,
  token?: string,
  blobSha?: string
): Promise<ParsedSkill | null> {
  const file = await tryGetJson<GitHubContent>(
    `${API_BASE}/repos/${owner}/${repo}/contents/${path}`,
    token
  );
  if (!file || file.type !== 'file') return null;

  let content = file.content ? Buffer.from(file.content, 'base64').toString('utf-8') : null;
  if (!content) {
    const sha = blobSha || file.sha;
    if (sha) {
      content = await fetchBlobContent(owner, repo, sha, token);
    }
  }
  if (!content) return null;
  return toParsedSkill(parseFrontmatter(content));
}

function resolveSkillsPrefix(input?: string): string | null {
  const normalized = normalizeSkillsPath(input);
  if (!normalized) return null;
  return normalized.endsWith('/') ? normalized : `${normalized}/`;
}

function upsertSkill(
  owner: string,
  repo: string,
  repoUrl: string,
  stars: number,
  forks: number,
  item: { path: string; skill: ParsedSkill }
): ImportedSkill {
  const skillId = buildSkillId(owner, repo, item.path, item.skill.name);
  const creator = process.env.DEFAULT_CREATOR_ADDRESS || '0x0000000000000000000000000000000000000000';
  const payment = process.env.DEFAULT_PAYMENT_ADDRESS || creator;
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

  db.prepare(`
    INSERT INTO skills (
      skill_id, name, description, platform, version,
      creator_address, payment_address, repository, homepage,
      download_count, github_stars, github_forks, total_tips, tip_count,
      platform_likes, logo_url, tags, status, created_at, updated_at, stats_updated_at, data_source
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, '0', 0, 0, NULL, ?, 'active', ?, ?, ?, 'github')
    ON CONFLICT(skill_id) DO UPDATE SET
      name=excluded.name,
      description=excluded.description,
      platform=excluded.platform,
      version=excluded.version,
      repository=excluded.repository,
      github_stars=excluded.github_stars,
      github_forks=excluded.github_forks,
      tags=excluded.tags,
      updated_at=excluded.updated_at,
      stats_updated_at=excluded.stats_updated_at,
      data_source='github'
  `).run(
    skillId,
    item.skill.name,
    item.skill.description,
    item.skill.platform,
    item.skill.version,
    creator,
    payment,
    repoUrl,
    null,
    stars,
    forks,
    item.skill.tags.length ? JSON.stringify(item.skill.tags) : null,
    now,
    now,
    now
  );

  return {
    skill_id: skillId,
    name: item.skill.name,
    repository: repoUrl,
    platform: item.skill.platform,
    github_stars: stars,
  };
}

export async function importSkillsFromGitHubRepo(
  repoInput: string,
  options: ImportOptions = {}
): Promise<ImportResult> {
  const parsed = parseGitHubRepo(repoInput);
  if (!parsed) throw new Error('Invalid GitHub repository URL.');

  const repoInfo = await getJson<GitHubRepoInfo>(
    `${API_BASE}/repos/${parsed.owner}/${parsed.repo}`,
    options.token
  );

  const repoUrl = repoInfo.html_url || `https://github.com/${parsed.owner}/${parsed.repo}`;
  const stars = repoInfo.stargazers_count || 0;
  const forks = repoInfo.forks_count || 0;

  const branch = repoInfo.default_branch || 'main';
  const tree = await getJson<GitHubTreeResponse>(
    `${API_BASE}/repos/${parsed.owner}/${parsed.repo}/git/trees/${branch}?recursive=1`,
    options.token
  );
  if (tree.truncated) {
    throw new Error(`Repository tree is truncated for ${parsed.owner}/${parsed.repo}`);
  }

  const skillsPrefix = resolveSkillsPrefix(parsed.skillsPath);
  const allCandidates = tree.tree.filter(
    (item) =>
      item.type === 'blob' &&
      isSkillsDirectorySkill(item.path) &&
      (!skillsPrefix || item.path.startsWith(skillsPrefix))
  );

  const offset = Number.isFinite(options.offset as number) ? Math.max(options.offset as number, 0) : 0;
  const limit = Number.isFinite(options.limit as number) ? Math.max(options.limit as number, 1) : allCandidates.length;
  const candidates = allCandidates.slice(offset, offset + limit);

  const discovered: Array<{ path: string; skill: ParsedSkill }> = [];
  for (const item of candidates) {
    const parsedSkill = await fetchSkillFile(parsed.owner, parsed.repo, item.path, options.token, item.sha);
    if (parsedSkill) {
      discovered.push({ path: item.path, skill: parsedSkill });
    }
  }

  const dedup = new Map<string, { path: string; skill: ParsedSkill }>();
  for (const item of discovered) {
    const key = `${item.path}:${item.skill.name}`;
    if (!dedup.has(key)) dedup.set(key, item);
  }

  let imported = 0;
  let updated = 0;
  const skills: ImportedSkill[] = [];

  for (const item of dedup.values()) {
    const skillId = buildSkillId(parsed.owner, parsed.repo, item.path, item.skill.name);
    const exists = db.prepare('SELECT id FROM skills WHERE skill_id = ?').get(skillId) as { id: number } | undefined;
    const row = upsertSkill(parsed.owner, parsed.repo, repoUrl, stars, forks, item);
    skills.push(row);
    if (exists) updated += 1;
    else imported += 1;
  }

  return {
    repo: `${parsed.owner}/${parsed.repo}`,
    imported,
    updated,
    scanned_paths: candidates.length,
    skills,
    next_offset: offset + candidates.length,
    completed: offset + candidates.length >= allCandidates.length,
  };
}
