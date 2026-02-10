import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { wallet, reviewIds } = body;

    if (!wallet || !reviewIds?.length) {
      return NextResponse.json(
        { success: false, error: 'Wallet and review IDs required' },
        { status: 400 }
      );
    }

    // Generate mock transaction
    const txHash = '0x' + randomBytes(32).toString('hex');
    const amount = reviewIds.length * 50; // 50 ASKL per review

    return NextResponse.json({
      success: true,
      data: {
        txHash,
        amount,
        currency: 'ASKL',
        status: 'completed',
        timestamp: new Date().toISOString(),
        explorerUrl: `https://testnet.monad.xyz/tx/${txHash}`,
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
