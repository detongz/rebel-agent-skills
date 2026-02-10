// app/api/agents/[id]/route.ts - Single agent API
import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

/**
 * GET /api/agents/[id]
 * Fetch a single agent by ID with stats
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: agentId } = await params;

    const agent = db.prepare(`
      SELECT
        a.*,
        COALESCE(a.reviews_given, 0) as reviews_given,
        COALESCE(a.average_rating, 0) as average_rating,
        COALESCE(a.total_compute_used, 0) as total_compute_used,
        (SELECT COUNT(*) FROM agent_evaluations WHERE target_agent_id = a.id) as evaluations_received,
        (SELECT COUNT(*) FROM agent_evaluations WHERE evaluator_wallet = a.wallet_address) as evaluations_given
      FROM agents a
      WHERE a.id = ?
    `).get(agentId);

    if (!agent) {
      return NextResponse.json(
        { success: false, error: 'Agent not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: agent,
    });
  } catch (error) {
    console.error('Error fetching agent:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch agent',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
