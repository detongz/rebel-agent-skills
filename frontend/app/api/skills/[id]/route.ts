// app/api/skills/[id]/route.ts - 获取单个 Skill 详情
import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getReviewStatistics } from '@/lib/db-reviews';

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parseReadableSkillPath(input: string): { owner: string; repo: string; skillSlug: string } | null {
  const match = /^gh--([^/]+)--([^/]+)--(.+)$/.exec(input);
  if (!match) return null;
  return {
    owner: match[1],
    repo: match[2],
    skillSlug: match[3],
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: skillId } = await params;
    const readablePath = parseReadableSkillPath(skillId);

    let skill: Record<string, unknown> | undefined;
    if (readablePath) {
      const candidates = db.prepare(`
        SELECT * FROM skills
        WHERE repository LIKE ?
        ORDER BY github_stars DESC, id ASC
        LIMIT 200
      `).all(`https://github.com/${readablePath.owner}/${readablePath.repo}%`) as Array<Record<string, unknown>>;

      skill = candidates.find((row) => slugify(String(row.name || '')) === readablePath.skillSlug);
      if (!skill && candidates.length > 0) {
        skill = candidates[0];
      }
    } else {
      skill = db.prepare(`
        SELECT * FROM skills WHERE id = ? OR skill_id = ? LIMIT 1
      `).get(skillId, skillId) as Record<string, unknown> | undefined;
    }

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
