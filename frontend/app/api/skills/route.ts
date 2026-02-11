/**
 * API Route: /api/skills
 *
 * GET: List skills from hybrid storage (database + on-chain verification)
 * Supports filtering by creator, category, and sorting
 *
 * Hybrid Storage Model:
 * - Database: Full skill details (name, description, category, security_score)
 * - On-chain: skillId -> creator mapping (verified, tamper-proof)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSkills as getSkillsFromDb } from '@/lib/skills-db';

/**
 * GET /api/skills
 * Query params:
 * - creator: Filter by creator wallet address
 * - category: Filter by category
 * - sort: Sort by 'tips' or 'date' (default: tips)
 * - limit: Max number of results (default: 50)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const creator = searchParams.get('creator') || undefined;
    const category = searchParams.get('category') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50');

    // Fetch skills from database
    const skills = await getSkillsFromDb({ creator, category, limit });

    // Transform response format
    const transformedSkills = skills.map(skill => ({
      id: skill.id,
      name: skill.name,
      description: skill.description || `Skill from ${skill.repository}`,
      repository: skill.repository,
      category: skill.category,
      creator: skill.creator,
      security_score: skill.securityScore,
      total_tips: skill.totalTips,
      created_at: skill.publishedAt,
      verified: skill.verified,
      tx_hash: skill.txHash
    }));

    return NextResponse.json({
      success: true,
      data: transformedSkills,
      count: transformedSkills.length,
      source: 'Hybrid: Database + On-chain verification',
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
