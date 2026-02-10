import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get('wallet');

    if (!wallet) {
      return NextResponse.json(
        { success: false, error: 'Wallet address required' },
        { status: 400 }
      );
    }

    // Mock history data
    const history = [
      {
        id: 'claim_001',
        txHash: '0x8f7d3e2a1b9c6f4e8d5a7b3c1e9f6d4a2b8c5e7f9d1a3b5c7e9f2d4a6b8c0e',
        reviewIds: ['rev_010', 'rev_011'],
        amount: 100,
        currency: 'ASKL',
        status: 'completed',
        timestamp: '2026-02-01T10:00:00Z',
        explorerUrl: 'https://testnet.monad.xyz/tx/0x8f7d3e2a1b9c6f4e8d5a7b3c1e9f6d4a2b8c5e7f9d1a3b5c7e9f2d4a6b8c0e',
      },
    ];

    return NextResponse.json({
      success: true,
      data: {
        wallet: wallet.toLowerCase(),
        history,
        summary: {
          totalClaimed: history.reduce((sum, tx) => sum + tx.amount, 0),
          claimCount: history.length,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching history:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch history' },
      { status: 500 }
    );
  }
}
