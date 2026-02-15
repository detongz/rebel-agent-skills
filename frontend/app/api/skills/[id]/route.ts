// app/api/skills/[id]/route.ts - 获取单个 Skill 详情
import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getReviewStatistics } from '@/lib/db-reviews';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: skillId } = await params;

    const skill = db.prepare(`
      SELECT * FROM skills WHERE id = ? OR skill_id = ? LIMIT 1
    `).get(skillId, skillId) as Record<string, unknown> | undefined;

    if (!skill) {
      return NextResponse.json(
        { success: false, error: 'Skill not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      skill: {
        ...skill,
        review_stats: getReviewStatistics(String(skill.skill_id || '')),
      },
    });
  } catch (error) {
    console.error('Get skill error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch skill' },
      { status: 500 }
    );
  }
}
