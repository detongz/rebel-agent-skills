/**
 * API Route: /api/airdrop/claim
 *
 * POST: Claim eligible airdrop for reviews
 * Processes the claim and returns transaction details
 */

import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';

// Mock claimed transactions storage
const CLAIMED_TRANSACTIONS: Map<string, any> = new Map();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { wallet, reviewIds } = body;

    if (!wallet) {
      return NextResponse.json(
        {
          success: false,
          error: 'Wallet address is required',
        },
        { status: 400 }
      );
    }

    if (!reviewIds || !Array.isArray(reviewIds) || reviewIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Review IDs are required',
        },
        { status: 400 }
      );
    }

    // Normalize wallet address
    const normalizedWallet = wallet.toLowerCase();

    // Generate mock transaction hash
    const txHash = '0x' + randomBytes(32).toString('hex');

    // Calculate total amount (mock calculation)
    const amountPerReview = 50; // ASKL tokens per review
    const totalAmount = reviewIds.length * amountPerReview;

    // Create transaction record
    const transaction = {
      id: `claim_${Date.now()}`,
      txHash,
      wallet: normalizedWallet,
      reviewIds,
      amount: totalAmount,
      currency: 'ASKL',
      status: 'processing',
      timestamp: new Date().toISOString(),
      network: 'monad-testnet',
      explorerUrl: `https://testnet.monad.xyz/tx/${txHash}`,
    };

    // Store transaction
    CLAIMED_TRANSACTIONS.set(txHash, transaction);

    // Simulate processing delay
    setTimeout(() => {
      const tx = CLAIMED_TRANSACTIONS.get(txHash);
      if (tx) {
        tx.status = 'completed';
        tx.completedAt = new Date().toISOString();
      }
    }, 2000);

    return NextResponse.json({
      success: true,
      data: {
        transaction,
        message: `Successfully claimed ${totalAmount} ASKL for ${reviewIds.length} review(s)`,
      },
    });
  } catch (error) {
    console.error('Error claiming airdrop:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to claim airdrop',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Export for testing purposes
export { CLAIMED_TRANSACTIONS };
