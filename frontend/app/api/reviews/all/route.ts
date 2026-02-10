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
    // For now, return mock data with proper structure
    const mockReviews: any[] = [];

    // Apply filters to mock data
    let filteredReviews = [...mockReviews];

    if (stars && stars !== 'all') {
      const starFilter = parseInt(stars);
      filteredReviews = filteredReviews.filter(r => r.stars === starFilter);
    }

    if (airdropEligible === 'eligible') {
      filteredReviews = filteredReviews.filter(r => r.airdrop_amount > 0);
    } else if (airdropEligible === 'not-eligible') {
      filteredReviews = filteredReviews.filter(r => r.airdrop_amount === 0);
    }

    // Apply sorting
    if (sortBy === 'rating') {
      filteredReviews.sort((a, b) => b.stars - a.stars);
    } else if (sortBy === 'compute') {
      filteredReviews.sort((a, b) => (b.compute_used || 0) - (a.compute_used || 0));
    } else {
      // newest (default)
      filteredReviews.sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }

    // Apply pagination
    const paginatedReviews = filteredReviews.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      data: {
        reviews: paginatedReviews,
        total: filteredReviews.length,
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
