/**
 * API Route: /api/leaderboard
 *
 * GET: Get leaderboard of top skills by tips/earnings
 * Fast endpoint with caching for OpenClaw plugin
 */

import { NextRequest, NextResponse } from 'next/server';

// Seed skills data (same as in skills route)
const SEED_SKILLS = [
  {
    skill_id: '0x1234567890abcdef1234567890abcdef1234567890abcd',
    id: 1,
    name: 'React Query',
    description: 'Powerful data synchronization library with elegant API.',
    platform: 'claude-code',
    creator_address: '0x1111222233334444555566667777888899990000',
    total_tips: '800',
    tip_count: 8,
    github_stars: 42000,
  },
  {
    skill_id: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcd',
    id: 2,
    name: 'Claude Code Copilot',
    description: 'AI-powered code assistant to help you write and optimize code quickly',
    platform: 'claude-code',
    creator_address: '0x1234567890123456789012345678901234567890',
    total_tips: '5000000000000000000000000',
    tip_count: 42,
    github_stars: 1585,
  },
  {
    skill_id: '0xfeedbeef0000111122223333444455556666777788889999aaabbbcccddeeff',
    id: 3,
    name: 'Zod',
    description: 'TypeScript 优先的模式验证库',
    platform: 'claude-code',
    creator_address: '0xfeedbeef0000111122223333444455566667777888889999',
    total_tips: '500',
    tip_count: 5,
    github_stars: 33000,
  },
  {
    skill_id: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    id: 4,
    name: 'Vercel AI SDK',
    description: 'Vercel 的 AI SDK，支持多种 LLM 提供商',
    platform: 'claude-code',
    creator_address: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
    total_tips: '3200',
    tip_count: 32,
    github_stars: 21528,
  },
  {
    skill_id: '0xdeadbeefcafebabe1234567890abcdef1234567890abcdef12',
    id: 5,
    name: 'Prisma',
    description: '下一代 ORM',
    platform: 'manus',
    creator_address: '0xdeadbeefcafebabe1234567890abcdef1234567890abcdef12',
    total_tips: '2000',
    tip_count: 20,
    github_stars: 38000,
  },
  {
    skill_id: '0xfeedbeef0000111122223333444455566667777888889999',
    id: 6,
    name: 'Coze AI Writer',
    description: 'Professional AI writing assistant',
    platform: 'coze',
    creator_address: '0xfeedbeef0000111122223333444455566667777888889999',
    total_tips: '3200000000000000000000',
    tip_count: 28,
    github_stars: 856,
  },
  {
    skill_id: '0x12345678901234567890abcdef1234567890abcdef',
    id: 7,
    name: 'Anthropic TypeScript SDK',
    description: 'Anthropic API 的官方 TypeScript SDK',
    platform: 'claude-code',
    creator_address: '0x12345678901234567890abcdef',
    total_tips: '140000000000000000000',
    tip_count: 29,
    github_stars: 1585,
  },
];

interface LeaderboardEntry {
  rank: number;
  name: string;
  creator: string;
  platform: string;
  totalTips: string;
  tipCount: number;
  githubStars: number;
}

interface LeaderboardResponse {
  success: boolean;
  data: LeaderboardEntry[];
  count: number;
  timeframe: string;
}

/**
 * GET /api/leaderboard
 * Query params:
 * - timeframe: 'all' | 'week' | 'month' (default: 'all')
 * - limit: Max results (default: 50)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || 'all';
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);

    // Sort skills by tips (descending)
    const sortedSkills = [...SEED_SKILLS]
      .sort((a, b) => {
        const aTips = parseFloat(a.total_tips || '0');
        const bTips = parseFloat(b.total_tips || '0');
        return bTips - aTips;
      })
      .slice(0, limit);

    // Transform to leaderboard format
    const leaderboard: LeaderboardEntry[] = sortedSkills.map((skill, index) => ({
      rank: index + 1,
      name: skill.name,
      creator: skill.creator_address,
      platform: skill.platform,
      totalTips: skill.total_tips || '0',
      tipCount: skill.tip_count || 0,
      githubStars: skill.github_stars || 0,
    }));

    return NextResponse.json({
      success: true,
      data: leaderboard,
      count: leaderboard.length,
      timeframe,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60', // 5 min cache
      },
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch leaderboard',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
