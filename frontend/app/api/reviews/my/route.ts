// app/api/reviews/my/route.ts - Get reviews by wallet address
import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

// GET - Fetch all reviews by a wallet address
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get('wallet');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Validation: wallet address is required
    if (!wallet) {
      return NextResponse.json(
        { success: false, error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    // Validation: wallet address format (basic check)
    const addressRegex = /^0x[a-fA-F0-9]{40}$/;
    if (!addressRegex.test(wallet)) {
      return NextResponse.json(
        { success: false, error: 'Invalid wallet address format' },
        { status: 400 }
      );
    }

    // Fetch reviews by reviewer address
    const reviews = db.prepare(`
      SELECT
        r.id,
        r.skill_id,
        r.reviewer_address,
        r.stars,
        r.quality_score,
        r.performance_score,
        r.usability_score,
        r.comment,
        r.pros,
        r.cons,
        r.is_verified_purchase,
        r.is_agent_tested,
        r.helpful_count,
        r.status,
        r.created_at,
        r.updated_at,
        s.name as skill_name,
        s.description as skill_description,
        s.platform as skill_platform,
        s.logo_url as skill_logo
      FROM reviews r
      LEFT JOIN skills s ON r.skill_id = s.id
      WHERE r.reviewer_address = ?
      ORDER BY r.created_at DESC
      LIMIT ? OFFSET ?
    `).all(wallet.toLowerCase(), limit, offset);

    // Get statistics
    const stats = db.prepare(`
      SELECT
        COUNT(*) as total_reviews,
        AVG(stars) as average_rating,
        SUM(CASE WHEN is_verified_purchase = 1 THEN 1 ELSE 0 END) as verified_count,
        SUM(CASE WHEN is_agent_tested = 1 THEN 1 ELSE 0 END) as agent_tested_count
      FROM reviews
      WHERE reviewer_address = ?
    `).get(wallet.toLowerCase()) as any;

    return NextResponse.json({
      success: true,
      data: {
        reviews,
        stats: {
          total_reviews: stats.total_reviews || 0,
          average_rating: stats.average_rating ? parseFloat(stats.average_rating.toFixed(1)) : 0,
          verified_count: stats.verified_count || 0,
          agent_tested_count: stats.agent_tested_count || 0,
        },
      },
    });
  } catch (error) {
    console.error('Get my reviews error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}
