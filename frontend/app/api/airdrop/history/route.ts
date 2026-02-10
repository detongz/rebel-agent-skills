/**
 * API Route: /api/airdrop/history
 *
 * GET: Get airdrop claim history for a wallet address
 * Returns past claims with transaction links and status
 */

import { NextRequest, NextResponse } from 'next/server';
import { CLAIMED_TRANSACTIONS } from '../claim/route';

// Mock historical claims for demo
const MOCK_HISTORY: Record<string, any[]> = {
  '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb': [
    {
      id: 'claim_1739000000000',
      txHash: '0x8f7d3e2a1b9c6f4e8d5a7b3c1e9f6d4a2b8c5e7f9d1a3b5c7e9f2d4a6b8c0e',
      reviewIds: ['rev_010', 'rev_011'],
      amount: 100,
      currency: 'ASKL',
      status: 'completed',
      timestamp: '2026-02-01T10:00:00Z',
      completedAt: '2026-02-01T10:00:15Z',
      network: 'monad-testnet',
      explorerUrl: 'https://testnet.monad.xyz/tx/0x8f7d3e2a1b9c6f4e8d5a7b3c1e9f6d4a2b8c5e7f9d1a3b5c7e9f2d4a6b8c0e',
    },
    {
      id: 'claim_1738500000000',
      txHash: '0x2e4f6a8d1c3b5e7f9a1d3c5b7e9f2a4d6c8e0f2a4b6c8d0e2f4a6b8c0d2e4f',
      reviewIds: ['rev_008'],
      amount: 45,
      currency: 'ASKL',
      status: 'completed',
      timestamp: '2026-01-25T14:30:00Z',
      completedAt: '2026-01-25T14:30:12Z',
      network: 'monad-testnet',
      explorerUrl: 'https://testnet.monad.xyz/tx/0x2e4f6a8d1c3b5e7f9a1d3c5b7e9f2a4d6c8e0f2a4b6c8d0e2f4a6b8c0d2e4f',
    },
  ],
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get('wallet');

    if (!wallet) {
      return NextResponse.json(
        {
          success: false,
          error: 'Wallet address is required',
        },
        { status: 400 }
      );
    }

    // Normalize wallet address
    const normalizedWallet = wallet.toLowerCase();

    // Get mock history for the wallet
    const history = MOCK_HISTORY[normalizedWallet] || [];

    // Add any transactions from the CLAIMED_TRANSACTIONS map
    const additionalTxs: any[] = [];
    CLAIMED_TRANSACTIONS.forEach((tx) => {
      if (tx.wallet.toLowerCase() === normalizedWallet) {
        additionalTxs.push(tx);
      }
    });

    // Combine and sort by timestamp (newest first)
    const allHistory = [...history, ...additionalTxs].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Calculate totals
    const totalClaimed = allHistory
      .filter(tx => tx.status === 'completed')
      .reduce((sum, tx) => sum + tx.amount, 0);
    const pendingAmount = allHistory
      .filter(tx => tx.status === 'processing')
      .reduce((sum, tx) => sum + tx.amount, 0);

    return NextResponse.json({
      success: true,
      data: {
        wallet: normalizedWallet,
        history: allHistory,
        summary: {
          totalClaimed,
          pendingAmount,
          claimCount: allHistory.length,
          completedClaims: allHistory.filter(tx => tx.status === 'completed').length,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching airdrop history:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch airdrop history',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
