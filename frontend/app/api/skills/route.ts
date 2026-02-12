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
import db from '@/lib/db';

interface SkillRow {
  skill_id: string;
  id: number;
  name: string;
  description: string;
  platform: string;
  version: string;
  creator_address: string;
  payment_address: string;
  repository: string;
  homepage: string;
  download_count: number;
  github_stars: number;
  github_forks: number;
  total_tips: string;
  tip_count: number;
  platform_likes: number;
  logo_url: string;
  tags: string;
  status: string;
  created_at: string;
  updated_at: string;
  stats_updated_at: string;
}

// Seed data for when database is empty
const SEED_SKILLS = [
  {
    skill_id: '0x1234567890abcdef1234567890abcdef1234567890abcd',
    id: 1,
    name: 'Solidity Vulnerability Scanner',
    description: 'AI-powered static analysis tool for detecting common Solidity vulnerabilities.',
    platform: 'claude-code',
    version: '2.1.0',
    creator_address: '0x842D3812deF42b8F59b6f2e4f8b3c2a1e5d6f7e8',
    payment_address: '0x842D3812deF42b8F59b6f2e4f8b3c2a1e5d6f7e8',
    repository: 'https://github.com/securilab/solidity-scanner',
    homepage: 'https://myskills.sh/skill/solidity-scanner',
    npm_package: '@myskills/solidity-scanner',
    download_count: 1243,
    github_stars: 87,
    github_forks: 0,
    total_tips: '2.5',
    tip_count: 10,
    platform_likes: 87,
    logo_url: 'https://github.com/securilab/solidity-scanner/raw/main/logo.png',
    tags: 'solidity,security,audit,smart-contracts',
    status: 'active',
    created_at: '2026-01-15T10:00:00Z',
    updated_at: '2026-01-15T10:00:00Z',
    stats_updated_at: '2026-02-12T10:00:00Z',
  },
  {
    skill_id: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcd',
    id: 2,
    name: 'DeFi Arbitrage Scanner',
    description: 'Real-time DEX arbitrage detection with profit calculation.',
    platform: 'claude-code',
    version: '1.8.2',
    creator_address: '0x7a3b5c8d2e1f4a6b9c8d7e6f5a4b3c2d1e0f9a8',
    payment_address: '0x7a3b5c8d2e1f4a6b9c8d7e6f5a4b3c2d1e0f9a8',
    repository: 'https://github.com/yieldhunter/arb-scanner',
    homepage: 'https://myskills.sh/skill/arb-scanner',
    npm_package: '@myskills/defi-arb-tracker',
    download_count: 3421,
    github_stars: 156,
    github_forks: 0,
    total_tips: '3.25',
    tip_count: 15,
    platform_likes: 156,
    logo_url: 'https://github.com/yieldhunter/arb-scanner/raw/main/logo.png',
    tags: 'defi,arbitrage,dex,trading,yield',
    status: 'active',
    created_at: '2026-01-20T14:30:00Z',
    updated_at: '2026-01-20T14:30:00Z',
    stats_updated_at: '2026-02-12T10:00:00Z',
  },
  {
    skill_id: '0x1111222233334444555566667777888899990000aaaabbbbccccddddeeeeffff',
    id: 3,
    name: 'React Query',
    description: 'Powerful data synchronization library with elegant API.',
    platform: 'claude-code',
    version: '3.2.1',
    creator_address: '0x1111222233334444555566667777888899990000',
    payment_address: '0x1111222233334444555566667777888899990000',
    repository: 'https://github.com/tanstack/query',
    homepage: 'https://myskills.sh/skill/react-query',
    npm_package: '@tanstack/react-query',
    download_count: 876,
    github_stars: 42000,
    github_forks: 0,
    total_tips: '0',
    tip_count: 0,
    platform_likes: 42000,
    logo_url: 'https://github.com/tanstack/query/raw/main/logo.png',
    tags: 'react,data-fetching,typescript',
    status: 'active',
    created_at: '2026-02-06T11:13:55Z',
    updated_at: '2026-02-06 11:13:55Z',
    stats_updated_at: '2026-02-12T10:00:00Z',
  },
  {
    skill_id: '0xfeedbeef000011112222333344445555666777788889999aaabbbcccddeeff',
    id: 4,
    name: 'Zod',
    description: 'TypeScript-first schema validation library.',
    platform: 'claude-code',
    version: '2.5.1',
    creator_address: '0xfeedbeef000011112222333344445556666777788889999',
    payment_address: '0xfeedbeef0000111122223333444455566667777888889999',
    repository: 'https://github.com/colinhacks/zod',
    homepage: 'https://myskills.sh/skill/zod',
    npm_package: '@myskills/zod',
    download_count: 2543,
    github_stars: 8000,
    github_forks: 0,
    total_tips: '0',
    tip_count: 0,
    platform_likes: 8000,
    logo_url: 'https://github.com/colinhacks/zod/raw/main/logo.png',
    tags: 'validation,typescript,schema',
    status: 'active',
    created_at: '2026-02-06T11:13:55Z',
    updated_at: '2026-02-06 11:13:55Z',
    stats_updated_at: '2026-02-12T10:00:00Z',
  },
  {
    skill_id: '0xdeadbeefcafebabe1234567890abcdef1234567890abcdef12',
    id: 5,
    name: 'Prisma',
    description: 'Next-generation ORM for TypeScript.',
    platform: 'manus',
    version: '5.0.0',
    creator_address: '0xdeadbeefcafebabe1234567890abcdef12',
    payment_address: '0xdeadbeefcafebabe1234567890abcdef12',
    repository: 'https://github.com/prisma/prisma',
    homepage: 'https://myskills.sh/skill/prisma',
    npm_package: '@prisma/prisma',
    download_count: 5000,
    github_stars: 38000,
    github_forks: 0,
    total_tips: '0',
    tip_count: 0,
    platform_likes: 38000,
    logo_url: 'https://github.com/prisma/raw/main/logo.png',
    tags: 'orm,database,typescript',
    status: 'active',
    created_at: '2026-02-06T17:31:53Z',
    updated_at: '2026-02-06 17:31:53Z',
    stats_updated_at: '2026-02-12T10:00:00Z',
  },
  {
    skill_id: '0xfeedbeef0000111122223333444455566667777888889999',
    id: 6,
    name: 'Coze AI Writer',
    description: 'Professional AI writing assistant.',
    platform: 'coze',
    version: '2.0.3',
    creator_address: '0xfeedbeef0000111122223333444455566667777888889999',
    payment_address: '0xfeedbeef0000111122223333444455566667777888889999',
    repository: 'https://github.com/coze/ai-writer',
    homepage: 'https://myskills.sh/skill/ai-writer',
    npm_package: '@coze/ai-writer',
    download_count: 320,
    github_stars: 0,
    github_forks: 0,
    total_tips: '0',
    tip_count: 0,
    platform_likes: 0,
    logo_url: 'https://github.com/coze/ai-writer/raw/main/logo.png',
    tags: 'writing,ai',
    status: 'active',
    created_at: '2026-02-06T17:31:53Z',
    updated_at: '2026-02-06 17:31:53Z',
    stats_updated_at: '2026-02-12T10:00:00Z',
  },
  {
    skill_id: '0xfeedbeef0000111122223333444455566667777888889999',
    id: 7,
    name: 'Cursor Code Editor',
    description: 'AI-powered code editor with intelligent autocomplete.',
    platform: 'cursor',
    version: '1.0.0',
    creator_address: '0xfeedbeef0000111122223333444455566667777888889999',
    payment_address: '0xfeedbeef0000111122223333444455566667777888889999',
    repository: 'https://github.com/getcursor.com/cursor',
    homepage: 'https://myskills.sh/skill/cursor',
    npm_package: '@cursor/cursor',
    download_count: 0,
    github_stars: 0,
    github_forks: 0,
    total_tips: '0',
    tip_count: 0,
    platform_likes: 0,
    logo_url: 'https://github.com/getcursor.com/cursor/raw/main/logo.png',
    tags: 'editor,ai,autocomplete',
    status: 'active',
    created_at: '2026-02-06T17:31:53Z',
    updated_at: '2026-02-06 17:31:53Z',
    stats_updated_at: '2026-02-12T10:00:00Z',
  },
  {
    skill_id: '0x12345678901234567890abcdef1234567890abcdef',
    id: 8,
    name: 'Anthropic Claude Code Copilot',
    description: 'AI-powered code assistant for Claude.',
    platform: 'claude-code',
    version: '1.0.0',
    creator_address: '0x12345678901234567890abcdef',
    payment_address: '0x12345678901234567890abcdef',
    repository: 'https://github.com/anthropic/claude-code-copilot',
    homepage: 'https://myskills.sh/skill/claude-code-copilot',
    npm_package: '@anthropic/claude-code-copilot',
    download_count: 1256,
    github_stars: 1585,
    github_forks: 0,
    total_tips: '0',
    tip_count: 0,
    platform_likes: 1585,
    logo_url: 'https://github.com/anthropic/claude-code-copilot/raw/main/logo.png',
    tags: 'ai,copilot,claude',
    status: 'active',
    created_at: '2026-02-06T17:31:53Z',
    updated_at: '2026-02-06 17:31:53Z',
    stats_updated_at: '2026-02-12T10:00:00Z',
  },
  {
    skill_id: '0xfeedbeef0000111122223333444455566667777888889999',
    id: 9,
    name: 'Manus',
    description: 'Agent platform for tool use and discovery.',
    platform: 'manus',
    version: '1.0.0',
    creator_address: '0xfeedbeef0000111122223333444455566667777888889999',
    payment_address: '0xfeedbeef0000111122223333444455566667777888889999',
    repository: 'https://github.com/manus',
    homepage: 'https://myskills.sh/skill/manus',
    npm_package: '@manus/agent-platform',
    download_count: 0,
    github_stars: 0,
    github_forks: 0,
    total_tips: '0',
    tip_count: 0,
    platform_likes: 0,
    logo_url: 'https://github.com/manus/raw/main/logo.png',
    tags: 'agent,discovery',
    status: 'active',
    created_at: '2026-02-06T17:31:53Z',
    updated_at: '2026-02-06 17:31:53Z',
    stats_updated_at: '2026-02-12T10:00:00Z',
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

    // Build query conditions
    const conditions: string[] = [];
    const params: any[] = [];

    if (creator) {
      conditions.push('creator_address = ?');
      params.push(creator);
    }

    if (platform && platform !== 'all') {
      conditions.push('platform = ?');
      params.push(platform);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Determine sort column
    let sortColumn = 'total_tips';
    let sortOrder = 'DESC';

    switch (sort) {
      case 'stars':
        sortColumn = 'github_stars';
        break;
      case 'likes':
        sortColumn = 'platform_likes';
        break;
      case 'date':
        sortColumn = 'created_at';
        break;
      case 'name':
        sortColumn = 'name';
        sortOrder = 'ASC';
        break;
      case 'tips':
      default:
        sortColumn = 'total_tips';
        break;
    }

    // Fetch skills from SQLite database
    const query = db.prepare(`
      SELECT * FROM skills
      ${whereClause}
      ORDER BY ${sortColumn} ${sortOrder}, updated_at DESC
      LIMIT ?
    `);

    let skills = query.all(...params, limit) as SkillRow[];
    let usedSeedData = false;

    // QUICK FIX: If database is empty, return seed data
    if (skills.length === 0) {
      console.log('🌱 Database empty, using seed data');
      usedSeedData = true;
      let seedSkills = [...SEED_SKILLS] as any[];

      // Apply platform filter if specified
      if (platform && platform !== 'all') {
        seedSkills = seedSkills.filter((s: any) => s.platform === platform);
      }

      // Sort seed data by the requested sort column
      seedSkills.sort((a: any, b: any) => {
        let aVal: any, bVal: any;

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
            aVal = new Date(a.created_at || 0).getTime();
            bVal = new Date(b.created_at || 0).getTime();
            break;
          case 'name':
            aVal = (a.name || '').toLowerCase();
            bVal = (b.name || '').toLowerCase();
            return sortOrder === 'ASC' ?
              aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
          case 'tips':
          default:
            aVal = parseFloat(a.total_tips || '0');
            bVal = parseFloat(b.total_tips || '0');
            break;
        }

        // For numeric values, sort DESC (higher first) by default
        if (sortOrder === 'ASC') {
          return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
        } else {
          return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
        }
      });

      // Apply limit
      skills = seedSkills.slice(0, limit);
    }

    // Transform response format
    const transformedSkills = skills.map(skill => ({
      id: skill.skill_id || skill.id.toString(),
      skill_id: skill.skill_id,
      name: skill.name,
      description: skill.description,
      platform: skill.platform,
      repository: skill.repository,
      homepage: skill.homepage,
      category: categoryValue || 'all',
      creator: skill.creator_address,
      payment_address: skill.payment_address,
      security_score: 0,
      total_tips: skill.total_tips || '0',
      tip_count: skill.tip_count || 0,
      platform_likes: skill.platform_likes || 0,
      download_count: skill.download_count || 0,
      github_stars: skill.github_stars || 0,
      github_forks: skill.github_forks || 0,
      logo_url: skill.logo_url,
      tags: skill.tags ? skill.tags.split(',') : [],
      created_at: skill.created_at,
      updated_at: skill.updated_at,
      verified: true,
      tx_hash: undefined,
    }));

    return NextResponse.json({
      success: true,
      data: transformedSkills,
      count: transformedSkills.length,
      sort: sort,
      sort_column: sortColumn,
      source: usedSeedData ? 'Seed Data (Fallback)' : 'SQLite Database',
      contractAddress: process.env.ASKL_TOKEN_ADDRESS || '0xc1fFCAD15e2f181E49bFf2cBea79094eC9B5033A',
    });
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

/**
 * POST /api/skills
 * Create a new skill (internal use after on-chain registration)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { skillId, name, repository, category, creator, securityScore, txHash } = body;

    // Import createSkill
    const { createSkill } = await import('@/lib/skills-db');

    const skill = await createSkill({
      id: skillId,
      name,
      repository,
      category,
      creator,
      securityScore: securityScore || 85,
      txHash,
      verified: !!txHash
    });

    return NextResponse.json({
      success: true,
      data: skill,
    });
  } catch (error) {
    console.error('Error creating skill:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create skill',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
