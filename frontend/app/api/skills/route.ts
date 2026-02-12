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

/**
 * GET /api/skills
 * Query params:
 * - creator: Filter by creator wallet address
 * - category: Filter by category
 * - platform: Filter by platform (coze, claude-code, manus, minimax)
 * - sort: Sort by 'tips', 'stars', 'likes', 'date', or 'name' (default: tips)
 * - limit: Max number of results (default: 50)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const creator = searchParams.get('creator') || undefined;
    const category = searchParams.get('category') || undefined;
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

    const skills = query.all(...params) as SkillRow[];

    // Transform response format
    const transformedSkills = skills.map(skill => ({
      id: skill.skill_id || skill.id.toString(),
      skill_id: skill.skill_id,
      name: skill.name,
      description: skill.description,
      platform: skill.platform,
      repository: skill.repository,
      homepage: skill.homepage,
      category: category || 'all',
      creator: skill.creator_address,
      payment_address: skill.payment_address,
      security_score: 0, // Could be added to schema later
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
      verified: true, // Default to true for skills in DB
      tx_hash: undefined, // Could be added later
    }));

    return NextResponse.json({
      success: true,
      data: transformedSkills,
      count: transformedSkills.length,
      sort: sort,
      sort_column: sortColumn,
      source: 'SQLite Database',
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
      data: skill
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
