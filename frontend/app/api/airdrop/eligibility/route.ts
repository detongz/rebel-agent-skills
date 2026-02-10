/**
 * API Route: /api/airdrop/eligibility
 *
 * GET: Check airdrop eligibility for a wallet address
 * Returns qualifying reviews with amounts and quality scores
 */

import { NextRequest, NextResponse } from 'next/server';

// Mock data for demo - in production, this would query the database/contract
const MOCK_ELIGIBLE_REVIEWS: Record<string, any[]> = {
  '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb': [
    {
      id: 'rev_001',
      skillId: 'skill_abc123',
      skillName: 'Code Analyzer Pro',
      reviewContent: 'Excellent code analysis tool with great integration.',
      qualityScore: 95,
      amount: 50,
      currency: 'ASKL',
      submittedAt: '2026-02-08T10:30:00Z',
      status: 'eligible',
    },
    {
      id: 'rev_002',
      skillId: 'skill_def456',
      skillName: 'Data Pipeline Agent',
      reviewContent: 'Solid performance, minor improvements needed.',
      qualityScore: 78,
      amount: 30,
      currency: 'ASKL',
      submittedAt: '2026-02-07T15:20:00Z',
      status: 'eligible',
    },
    {
      id: 'rev_003',
      skillId: 'skill_ghi789',
      skillName: 'Test Generator',
      reviewContent: 'Amazing test coverage automation!',
      qualityScore: 92,
      amount: 45,
      currency: 'ASKL',
      submittedAt: '2026-02-06T09:15:00Z',
      status: 'eligible',
    },
  ],
  '0x1234567890abcdef1234567890abcdef12345678': [
    {
      id: 'rev_004',
      skillId: 'skill_jkl012',
      skillName: 'CLI Helper',
      reviewContent: 'Very useful for command line workflows.',
      qualityScore: 88,
      amount: 40,
      currency: 'ASKL',
      submittedAt: '2026-02-05T14:00:00Z',
      status: 'eligible',
    },
  ],
};

// Mock leaderboard data
const MOCK_LEADERBOARD = [
  {
    rank: 1,
    address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    totalEarned: 125,
    reviewCount: 3,
    avgQuality: 88.3,
    badge: 'gold',
  },
  {
    rank: 2,
    address: '0x1234567890abcdef1234567890abcdef12345678',
    totalEarned: 95,
    reviewCount: 2,
    avgQuality: 85.0,
    badge: 'silver',
  },
  {
    rank: 3,
    address: '0xfedcba0987654321fedcba0987654321fedcba09',
    totalEarned: 70,
    reviewCount: 2,
    avgQuality: 82.5,
    badge: 'bronze',
  },
  {
    rank: 4,
    address: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
    totalEarned: 55,
    reviewCount: 1,
    avgQuality: 92.0,
    badge: null,
  },
  {
    rank: 5,
    address: '0x5555555555555555555555555555555555555555',
    totalEarned: 40,
    reviewCount: 1,
    avgQuality: 80.0,
    badge: null,
  },
];

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

    // Get eligible reviews for the wallet
    const reviews = MOCK_ELIGIBLE_REVIEWS[normalizedWallet] || [];

    // Calculate totals
    const totalAmount = reviews.reduce((sum, rev) => sum + rev.amount, 0);
    const avgQuality = reviews.length > 0
      ? reviews.reduce((sum, rev) => sum + rev.qualityScore, 0) / reviews.length
      : 0;

    // Find user's rank in leaderboard
    const userRank = MOCK_LEADERBOARD.find(
      entry => entry.address.toLowerCase() === normalizedWallet
    );

    return NextResponse.json({
      success: true,
      data: {
        wallet: normalizedWallet,
        eligibleReviews: reviews,
        summary: {
          totalAmount,
          reviewCount: reviews.length,
          avgQuality: Math.round(avgQuality * 10) / 10,
        },
        userRank: userRank || null,
      },
      leaderboard: MOCK_LEADERBOARD,
    });
  } catch (error) {
    console.error('Error checking airdrop eligibility:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to check airdrop eligibility',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
