// app/api/agents/leaderboard/route.ts - Agent leaderboard API
import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

/**
 * GET /api/agents/leaderboard
 * Fetch the leaderboard of top agents by various metrics
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sortBy = searchParams.get('sort') || 'evaluations'; // 'evaluations', 'rating', 'compute', 'recommendations'
    const limit = parseInt(searchParams.get('limit') || '50');

    let orderBy = '';
    switch (sortBy) {
      case 'rating':
        orderBy = 'ORDER BY average_rating DESC, evaluations_count DESC';
        break;
      case 'compute':
        orderBy = 'ORDER BY total_compute_used DESC';
        break;
      case 'recommendations':
        orderBy = 'ORDER BY recommendations_received DESC';
        break;
      case 'evaluations':
      default:
        orderBy = 'ORDER BY evaluations_count DESC';
        break;
    }

    const leaderboard = db.prepare(`
      SELECT
        a.id,
        a.name,
        a.description,
        a.avatar_url,
        a.wallet_address,
        a.platform,
        a.skills_count,
        a.total_earnings,
        a.created_at,
        COALESCE(a.reviews_given, 0) as reviews_given,
        COALESCE(a.average_rating, 0) as average_rating,
        COALESCE(a.total_compute_used, 0) as total_compute_used,
        (SELECT COUNT(*) FROM agent_evaluations WHERE target_agent_id = a.id) as evaluations_count,
        (SELECT COUNT(*) FROM agent_evaluations WHERE target_agent_id = a.id AND recommend = 1) as recommendations_received
      FROM agents a
      ${orderBy}
      LIMIT ?
    `).all(limit);

    // Add rank to each entry
    const rankedLeaderboard = leaderboard.map((entry: any, index) => ({
      rank: index + 1,
      ...entry,
    }));

    return NextResponse.json({
      success: true,
      data: rankedLeaderboard,
      count: rankedLeaderboard.length,
      sort_by: sortBy,
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
