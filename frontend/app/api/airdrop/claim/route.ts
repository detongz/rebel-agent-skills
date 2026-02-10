import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

/**
 * POST /api/airdrop/claim
 * Claim airdrop for eligible reviews
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

    // Validate wallet address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(wallet_address)) {
      return NextResponse.json(
        { success: false, error: 'Invalid wallet address format' },
        { status: 400 }
      );
    }

    // In production, this would:
    // 1. Calculate eligible amount from database
    // 2. Check if already claimed
    // 3. Execute blockchain transaction via Monad Testnet
    // 4. Mark as claimed in database
    // 5. Return transaction hash

    // For now, return mock success response
    const mockTxHash = '0x' + Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');

    return NextResponse.json({
      success: true,
      data: {
        wallet_address,
        amount: 0, // In production, calculate from DB
        tx_hash: mockTxHash,
        claimed_at: new Date().toISOString(),
        network: 'monad-testnet',
        token: 'USDT',
      },
    });
  } catch (error) {
    console.error('Error claiming airdrop:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to claim airdrop' },
      { status: 500 }
    );
  }
}
