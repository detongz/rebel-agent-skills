import { NextResponse } from 'next/server';
import { importSkillsFromGitHubRepo } from '@/lib/github-skill-import';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DEFAULT_REPOS = [
  'https://github.com/detongz/rebel-agent-skills',
  'https://github.com/vercel-labs/skills',
  'https://github.com/anthropics/claude-code',
];

function resolveRepoList(): string[] {
  const fromEnv = (process.env.GITHUB_IMPORT_REPOS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const list = fromEnv.length > 0 ? fromEnv : DEFAULT_REPOS;
  return Array.from(new Set(list));
}

export async function GET() {
  const token = process.env.GITHUB_TOKEN;
  const repos = resolveRepoList();

  const results: Array<Record<string, unknown>> = [];
  let imported = 0;
  let updated = 0;
  let failed = 0;

  for (const repo of repos) {
    try {
      const result = await importSkillsFromGitHubRepo(repo, { token });
      imported += result.imported;
      updated += result.updated;
      results.push({ success: true, ...result });
    } catch (error) {
      failed += 1;
      results.push({
        success: false,
        repo,
        error: error instanceof Error ? error.message : 'Import failed',
      });
    }
  }

  return NextResponse.json({
    success: failed === 0,
    summary: {
      repos_total: repos.length,
      repos_failed: failed,
      imported,
      updated,
    },
    repos,
    results,
  });
}
