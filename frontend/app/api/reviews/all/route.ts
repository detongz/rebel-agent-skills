import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

/**
 * GET /api/reviews/all
 * Get all reviews with optional filters
 * Query params: stars, airdrop_eligible, sort_by, limit, offset
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const stars = searchParams.get('stars');
    const airdropEligible = searchParams.get('airdrop_eligible');
    const sortBy = searchParams.get('sort_by') || 'newest';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // In production, fetch from database with filters
    // For now, return mock data
    return NextResponse.json({
      success: true,
      data: {
        reviews: [],
        total: 0,
        filters: {
          stars: stars || 'all',
          airdrop_eligible: airdropEligible || 'all',
          sort_by: sortBy,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}
