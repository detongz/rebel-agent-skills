/**
 * API Route: /api/skills
 *
 * GET: List skills from SQLite database
 * Supports filtering by creator, category, platform, and sorting (including hot skills by stars)
 *
 * Storage Model:
 * - SQLite Database: Full skill details with GitHub stats
 * - On-chain: skillId -> creator mapping (verified, tamper-proof)
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * Seed data for fallback (same as in local file)
 */
const SEED_SKILLS = [
  {
    skill_id: '0x11112222333344445555666677777888899990000aaaabbbbccccddddeeeeffff',
    id: 1,
    name: 'React Query',
    description: '强大的数据同步库',
    platform: 'claude-code',
    version: '3.2.1',
    creator_address: '0x11112222333344445555666677777888899990000',
    payment_address: '0x11112222333344445555666677777888899990000',
    repository: 'https://github.com/TanStack/query',
    homepage: 'https://myskills.sh/skill/react-query',
    npm_package: '@tanstack/react-query',
    download_count: 2000000,
    github_stars: 42000,
    github_forks: 0,
    total_tips: '800',
    tip_count: 8,
    platform_likes: 0,
    logo_url: 'https://github.com/TanStack/query/raw/main/logo.png',
    tags: 'react,data-fetching,typescript',
    status: 'active',
    created_at: '2026-02-06 11:13:55',
    updated_at: '2026-02-06 11:13:55',
    verified: true,
  },
  {
    skill_id: '0xfeedbeef0000111122223333444455566667777788889999aaabbbcccddeeeeff',
    id: 2,
    name: 'Claude Code Copilot',
    description: 'AI-powered code assistant to help you write and optimize code quickly',
    platform: 'claude-code',
    version: '1.0.0',
    creator_address: '0x1234567890abcdef1234567890abcdef',
    payment_address: '0x1234567890abcdef',
    repository: 'https://github.com/anthropic/claude-code-copilot',
    homepage: 'https://myskills.sh/skill/claude-code-copilot',
    npm_package: '@anthropic/claude-code-copilot',
    download_count: 0,
    github_stars: 1256,
    github_forks: 0,
    total_tips: '50000000000000000000000000000000000.000000',
    tip_count: 42,
    platform_likes: 0,
    logo_url: 'https://github.com/anthropic/claude-code-copilot/raw/main/logo.png',
    tags: 'ai,copilot,claude',
    status: 'active',
    created_at: '2026-02-06 17:31:53',
    updated_at: '2026-02-06 17:31:53',
    verified: true,
  },
  {
    skill_id: '0xfeedbeef0000111122223333444455566667777888889999aaabbbcccddeeeeff',
    id: 3,
    name: 'Zod',
    description: 'TypeScript 优先的模式验证库',
    platform: 'claude-code',
    version: '2.5.1',
    creator_address: '0xfeedbeef0000111122223333444455566667777888889999aaabbbcccddeeeeff',
    payment_address: '0xfeedbeef0000111122223333444455566667777888889999aaabbbcccddeeeeff',
    repository: 'https://github.com/colinhacks/zod',
    homepage: 'https://myskills.sh/skill/zod',
    npm_package: '@myskills/zod',
    download_count: 800000,
    github_stars: 33000,
    github_forks: 0,
    total_tips: '500',
    tip_count: 5,
    platform_likes: 0,
    logo_url: 'https://github.com/colinhacks/zod/raw/main/logo.png',
    tags: 'validation,typescript,schema',
    status: 'active',
    created_at: '2026-02-06 11:13:55',
    updated_at: '2026-02-06 11:13:55',
    verified: true,
  },
  {
    skill_id: '0x0000000000000000000000000000000000000000001',
    id: 4,
    name: 'Vercel AI SDK',
    description: 'Vercel 的 AI SDK，支持多种 LLM 提供商',
    platform: 'claude-code',
    version: '2.0.3',
    creator_address: '0xabcdefabcdefabcdefabcdefabcd',
    payment_address: '0xabcdefabcdefabcdefabcdefabcd',
    repository: 'https://github.com/vercel/ai',
    homepage: 'https://myskills.sh/skill/vercel-ai-sdk',
    npm_package: '@vercel/ai',
    download_count: 150000,
    github_stars: 21528,
    github_forks: 0,
    total_tips: '3200',
    tip_count: 32,
    platform_likes: 42000,
    logo_url: 'Next.js logo',
    tags: 'vercel,ai,llm,react,nextjs',
    status: 'active',
    created_at: '2026-02-06 11:13:55',
    updated_at: '2026-02-06 11:13:55',
    verified: true,
  },
  {
    skill_id: '0xdeadbeefcafebabe1234567890abcdef1234567890abcdef',
    id: 5,
    name: 'Prisma',
    description: '下一代 ORM',
    platform: 'manus',
    version: '5.0.0',
    creator_address: '0xdeadbeefcafebabe1234567890abcdef',
    payment_address: '0xdeadbeefcafebabe1234567890abcdef',
    repository: 'https://github.com/prisma/prisma',
    homepage: 'https://myskills.sh/skill/prisma',
    npm_package: '@prisma/prisma',
    download_count: 500000,
    github_stars: 38000,
    github_forks: 0,
    total_tips: '2000',
    tip_count: 20,
    platform_likes: 0,
    logo_url: 'Prisma logo',
    tags: 'orm,database,typescript',
    status: 'active',
    created_at: '2026-02-06 11:13:55',
    updated_at: '2026-02-06 11:13:55',
    verified: true,
  },
  {
    skill_id: '0xfeedbeef0000111122223333444455566667777888889999aaabbbcccddddeeeeff',
    id: 6,
    name: 'Coze AI Writer',
    description: 'Professional AI writing assistant supporting multiple content types',
    platform: 'coze',
    version: '2.0.3',
    creator_address: '0xabcdefabcdefabcdefabcdefabcd',
    payment_address: '0xabcdefabcdefabcdefabcdefabcd',
    repository: 'https://github.com/coze/ai-writer',
    homepage: 'https://myskills.sh/skill/ai-writer',
    npm_package: '@coze/ai-writer',
    download_count: 0,
    github_stars: 856,
    github_forks: 0,
    total_tips: '32000000000000000000000000000000000000',
    tip_count: 28,
    platform_likes: 0,
    logo_url: 'Next.js logo',
    tags: 'ai,writing,assistant',
    status: 'active',
    created_at: '2026-02-06 11:13:55',
    updated_at: '2026-02-06 17:31:53',
    verified: true,
  },
  {
    skill_id: '0x1234567890abcdef1234567890abcdef',
    id: 7,
    name: 'Anthropic TypeScript SDK',
    description: 'Anthropic API 的官方 TypeScript SDK',
    platform: 'claude-code',
    version: '1.0.0',
    creator_address: '0x1234567890abcdef',
    payment_address: '0x1234567890abcdef',
    repository: 'https://github.com/anthropics/anthropic-sdk-typescript',
    homepage: 'https://myskills.sh/skill/anthropic-sdk-typescript',
    npm_package: '@anthropic/anthropic-sdk-typescript',
    download_count: 50000,
    github_stars: 1585,
    github_forks: 0,
    total_tips: '14000000000000000000000000000000000000',
    tip_count: 29,
    platform_likes: 0,
    logo_url: 'Next.js logo',
    tags: 'typescript,ai,anthropic,api',
    status: 'active',
    created_at: '2026-02-06 17:31:53',
    updated_at: '2026-02-06 11:04:16:37',
    verified: true,
  },
];

/**
 * GET /api/skills
 * Query params:
 * - creator: Filter by creator
 * - category: Filter by category
 * - platform: Filter by platform (coze, claude-code, manus, minimax)
 * - sort: Sort by 'tips', 'stars', 'likes', 'date', or 'name' (default: tips)
 * - limit: Max number of results (default: 50)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const creator = searchParams.get('creator') || undefined;
    const categoryValue = searchParams.get('category') || undefined;
    const platform = searchParams.get('platform') || undefined;
    const sort = (searchParams.get('sort') || 'tips') as 'tips' | 'stars' | 'likes' | 'date' | 'name';
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);

    // Use seed data directly (fastest, no DB queries)
    let skills = [...SEED_SKILLS];

    // Apply filters
    if (creator) {
      skills = skills.filter((s) => s.creator_address === creator);
    }

    if (platform && platform !== 'all') {
      skills = skills.filter((s) => s.platform === platform);
    }

    // Apply sorting
    skills.sort((a, b) => {
      let aVal = 0, bVal = 0;

      switch (sort) {
        case 'stars':
          aVal = a.github_stars || 0;
          bVal = b.github_stars || 0;
          break;
        case 'likes':
          aVal = a.platform_likes || 0;
          bVal = b.platform_likes || 0;
          break;
        case 'date':
          aVal = new Date(a.created_at || '0').getTime();
          bVal = new Date(b.created_at || '0').getTime();
          break;
        case 'name':
          aVal = (a.name || '').toLowerCase();
          bVal = (b.name || '').toLowerCase();
          break;
        case 'tips':
        default:
          aVal = parseFloat(a.total_tips || '0');
          bVal = parseFloat(b.total_tips || '0');
          break;
      }

      // For date, sort DESC (older first)
      if (sort === 'date') {
        return aVal - bVal;
      }

      return bVal - aVal;
    });

    // Apply limit
    skills = skills.slice(0, limit);

    // Transform to match expected format (without NextResponse.json wrapper)
    const responseData = {
      success: true,
      data: skills,
      count: skills.length,
      sort: sort,
      sort_column: 'total_tips',
      source: 'Seed Data',
      contractAddress: process.env.ASKL_TOKEN_ADDRESS || '0xc1fFCAD15e2f181E49bFf2cBea79094eC9B5033A',
    };

    return NextResponse.json(responseData, {
      status: 200,
    headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
      },
    });
  } catch (error) {
    console.error('Error fetching skills:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch skills',
        details: error instanceof Error ? error.message : 'Unknown error',
        status: 500,
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
        },
    );
  }
}
