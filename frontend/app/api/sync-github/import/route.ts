import { NextRequest, NextResponse } from 'next/server';
import { importSkillsFromGitHubRepo } from '@/lib/github-skill-import';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type ImportBody = {
  repo?: string;
  repos?: string[];
  token?: string;
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ImportBody;
    const token = body.token || process.env.GITHUB_TOKEN;

    const repoList = (body.repos && body.repos.length > 0)
      ? body.repos
      : (body.repo ? [body.repo] : []);

    if (repoList.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing repo or repos in request body.',
          example: {
            repo: 'https://github.com/vercel-labs/skills',
          },
        },
        { status: 400 }
      );
    }

    const results = [];
    let totalImported = 0;
    let totalUpdated = 0;
    let failed = 0;

    for (const repoInput of repoList) {
      try {
        const result = await importSkillsFromGitHubRepo(repoInput, { token });
        results.push({ success: true, ...result });
        totalImported += result.imported;
        totalUpdated += result.updated;
      } catch (error) {
        failed += 1;
        results.push({
          success: false,
          repo: repoInput,
          error: error instanceof Error ? error.message : 'Import failed',
        });
      }
    }

    return NextResponse.json({
      success: failed === 0,
      summary: {
        repos_total: repoList.length,
        repos_failed: failed,
        imported: totalImported,
        updated: totalUpdated,
      },
      results,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid request body',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 400 }
    );
  }
}
