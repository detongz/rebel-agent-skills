// app/api/agents/[id]/evaluations/route.ts - Agent evaluations API
import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

/**
 * GET /api/agents/[id]/evaluations
 * Fetch all evaluations for a specific agent
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: agentId } = await params;

    const evaluations = db.prepare(`
      SELECT
        e.*,
        a.name as target_agent_name,
        evaluator.name as evaluator_name
      FROM agent_evaluations e
      LEFT JOIN agents a ON e.target_agent_id = a.id
      LEFT JOIN agents evaluator ON e.evaluator_wallet = evaluator.wallet_address
      WHERE e.target_agent_id = ?
      ORDER BY e.created_at DESC
    `).all(agentId);

    return NextResponse.json({
      success: true,
      data: evaluations,
      count: evaluations.length,
    });
  } catch (error) {
    console.error('Error fetching evaluations:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch evaluations',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/agents/[id]/evaluations
 * Create a new evaluation for an agent
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: agentId } = await params;
    const body = await request.json();

    const {
      evaluator_wallet,
      ratings,
      comment,
      recommend,
    } = body;

    // Validate required fields
    if (!evaluator_wallet) {
      return NextResponse.json(
        { success: false, error: 'Evaluator wallet address is required' },
        { status: 400 }
      );
    }

    if (!ratings || typeof ratings !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Ratings are required' },
        { status: 400 }
      );
    }

    const { code_quality, response_speed, accuracy, helpfulness } = ratings;

    // Validate rating values (1-5)
    const ratings_values = [code_quality, response_speed, accuracy, helpfulness];
    for (const rating of ratings_values) {
      if (typeof rating !== 'number' || rating < 1 || rating > 5) {
        return NextResponse.json(
          { success: false, error: 'All ratings must be between 1 and 5' },
          { status: 400 }
        );
      }
    }

    // Calculate overall rating
    const overall_rating = (code_quality + response_speed + accuracy + helpfulness) / 4;

    // Check if evaluator has already evaluated this agent
    const existingEvaluation = db.prepare(`
      SELECT id FROM agent_evaluations
      WHERE evaluator_wallet = ? AND target_agent_id = ?
    `).get(evaluator_wallet, agentId);

    if (existingEvaluation) {
      return NextResponse.json(
        { success: false, error: 'You have already evaluated this agent' },
        { status: 409 }
      );
    }

    // Create evaluation
    const result = db.prepare(`
      INSERT INTO agent_evaluations (
        evaluator_wallet,
        target_agent_id,
        code_quality,
        response_speed,
        accuracy,
        helpfulness,
        overall_rating,
        comment,
        recommend,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).run(
      evaluator_wallet,
      agentId,
      code_quality,
      response_speed,
      accuracy,
      helpfulness,
      overall_rating,
      comment || '',
      recommend ? 1 : 0
    );

    // Update agent stats
    db.prepare(`
      UPDATE agents
      SET
        reviews_given = COALESCE(
          (SELECT COUNT(*) FROM agent_evaluations WHERE evaluator_wallet = agents.wallet_address),
          0
        ),
        average_rating = COALESCE(
          (SELECT AVG(overall_rating) FROM agent_evaluations WHERE target_agent_id = agents.id),
          0
        ),
        updated_at = datetime('now')
      WHERE id = ?
    `).run(agentId);

    const newEvaluation = db.prepare(`
      SELECT
        e.*,
        a.name as target_agent_name
      FROM agent_evaluations e
      LEFT JOIN agents a ON e.target_agent_id = a.id
      WHERE e.rowid = ?
    `).get(result.lastInsertRowid);

    return NextResponse.json({
      success: true,
      data: newEvaluation,
      message: 'Evaluation submitted successfully',
    });
  } catch (error) {
    console.error('Error creating evaluation:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create evaluation',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
