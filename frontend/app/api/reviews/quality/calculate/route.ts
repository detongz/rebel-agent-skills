import { NextRequest, NextResponse } from 'next/server';
import { calculateReviewQuality } from '../../../../../lib/review-quality';

export const runtime = 'edge';

/**
 * POST /api/reviews/quality/calculate
 * Calculate review quality score and airdrop eligibility
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { stars, comment, compute_used, has_code_snippet } = body;

    if (typeof stars !== 'number' || stars < 1 || stars > 5) {
      return NextResponse.json(
        { success: false, error: 'Invalid star rating' },
        { status: 400 }
      );
    }

    const result = calculateReviewQuality({
      stars,
      comment: comment || '',
      compute_used: compute_used || 0,
      has_code_snippet: has_code_snippet || false,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error calculating quality:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to calculate quality score' },
      { status: 500 }
    );
  }
}
