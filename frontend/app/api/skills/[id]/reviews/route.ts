import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import {
  getReviewStatistics,
  getSkillReviews,
  upsertReview,
} from '@/lib/db-reviews';
import { calculateReviewQuality } from '@/lib/review-quality';

function resolveSkill(paramsId: string) {
  return db
    .prepare(
      `
      SELECT id, skill_id, creator_address
      FROM skills
      WHERE id = ? OR skill_id = ?
      LIMIT 1
    `
    )
    .get(paramsId, paramsId) as
    | { id: number; skill_id: string; creator_address: string | null }
    | undefined;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const skill = resolveSkill(id);
    if (!skill) {
      return NextResponse.json({ success: false, error: 'Skill not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const rawLimit = parseInt(searchParams.get('limit') || '20', 10);
    const rawOffset = parseInt(searchParams.get('offset') || '0', 10);
    const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(rawLimit, 1), 100) : 20;
    const offset = Number.isFinite(rawOffset) ? Math.max(rawOffset, 0) : 0;

    const reviews = getSkillReviews(skill.skill_id, limit, offset);
    const stats = getReviewStatistics(skill.skill_id);

    return NextResponse.json({
      success: true,
      skill_id: skill.skill_id,
      reviews,
      stats,
      pagination: {
        limit,
        offset,
      },
    });
  } catch (error) {
    console.error('Get skill reviews error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

type CreateReviewBody = {
  stars?: number;
  comment?: string;
  wallet_address?: string;
  agent_address?: string;
  compute_used?: string | number;
};

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const skill = resolveSkill(id);
    if (!skill) {
      return NextResponse.json({ success: false, error: 'Skill not found' }, { status: 404 });
    }

    const body = (await request.json()) as CreateReviewBody;
    const stars = Number(body.stars || 0);
    const comment = (body.comment || '').trim();
    const walletAddress = (body.wallet_address || '').trim();
    const agentAddress = (body.agent_address || walletAddress).trim();
    const computeUsed = String(body.compute_used || '0');

    if (!walletAddress) {
      return NextResponse.json({ success: false, error: 'wallet_address is required' }, { status: 400 });
    }
    if (!agentAddress) {
      return NextResponse.json({ success: false, error: 'agent_address is required' }, { status: 400 });
    }
    if (!Number.isFinite(stars) || stars < 1 || stars > 5) {
      return NextResponse.json({ success: false, error: 'stars must be between 1 and 5' }, { status: 400 });
    }
    if (comment.length < 10) {
      return NextResponse.json(
        { success: false, error: 'comment must be at least 10 characters' },
        { status: 400 }
      );
    }

    const quality = calculateReviewQuality({
      stars,
      comment,
      compute_used: Number(computeUsed),
    });

    const reviewId = upsertReview({
      skill_id: skill.skill_id,
      agent_address: agentAddress,
      wallet_address: walletAddress,
      stars,
      comment,
      compute_used: computeUsed,
      quality_score: quality.score,
    });

    const stats = getReviewStatistics(skill.skill_id);

    return NextResponse.json({
      success: true,
      review_id: reviewId,
      skill_id: skill.skill_id,
      quality,
      stats,
    });
  } catch (error) {
    console.error('Create skill review error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create review' }, { status: 500 });
  }
}
