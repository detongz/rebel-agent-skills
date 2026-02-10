import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

/**
 * POST /api/reviews/airdrop/check
 * Check airdrop eligibility for a wallet
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { wallet_address } = body;

    if (!wallet_address) {
      return NextResponse.json(
        { success: false, error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    // In production, fetch from database and calculate
    // For now, return mock data
    return NextResponse.json({
      success: true,
      data: {
        wallet_address,
        eligible_amount: 0,
        qualified_reviews: 0,
        total_reviews: 0,
        breakdown: [],
      },
    });
  } catch (error) {
    console.error('Error checking airdrop:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check airdrop eligibility' },
      { status: 500 }
    );
  }
}
