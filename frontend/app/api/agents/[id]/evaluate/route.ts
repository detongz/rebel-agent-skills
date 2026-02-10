import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

/**
 * POST /api/agents/[id]/evaluate
 * Submit an agent evaluation
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: agentId } = await params;
    const body = await request.json();
    const {
      evaluator_address,
      performance_score,
      reliability_score,
      accuracy_score,
      compute_used,
      comment,
    } = body;

    if (!evaluator_address) {
      return NextResponse.json(
        { success: false, error: 'Evaluator address is required' },
        { status: 400 }
      );
    }

    // Validate scores
    const scores = [performance_score, reliability_score, accuracy_score];
    if (scores.some(s => typeof s !== 'number' || s < 1 || s > 5)) {
      return NextResponse.json(
        { success: false, error: 'All scores must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Calculate overall score
    const overall_score = parseFloat(
      ((performance_score + reliability_score + accuracy_score) / 3).toFixed(1)
    );

    // In production, this would:
    // 1. Validate evaluator address hasn't already evaluated this agent
    // 2. Store evaluation in database
    // 3. Update agent's average rating
    // 4. Calculate airdrop eligibility based on evaluation quality
    // 5. Return evaluation ID

    return NextResponse.json({
      success: true,
      data: {
        id: `eval_${Date.now()}`,
        agent_id: agentId,
        evaluator_address,
        performance_score,
        reliability_score,
        accuracy_score,
        overall_score,
        compute_used: compute_used || 0,
        comment,
        created_at: new Date().toISOString(),
        // High-quality evaluations (4.5+ overall with comment) may qualify for airdrop
        airdrop_eligible: overall_score >= 4.5 && comment && comment.length >= 20,
        estimated_reward: overall_score >= 4.5 && comment && comment.length >= 20 ? 1.0 : 0,
      },
    });
  } catch (error) {
    console.error('Error submitting evaluation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit evaluation' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/agents/[id]/evaluate
 * Get all evaluations for an agent
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: agentId } = await params;

    // In production, fetch from database
    return NextResponse.json({
      success: true,
      data: {
        agent_id: agentId,
        evaluations: [],
        total: 0,
        average_rating: 0,
      },
    });
  } catch (error) {
    console.error('Error fetching evaluations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch evaluations' },
      { status: 500 }
    );
  }
}
