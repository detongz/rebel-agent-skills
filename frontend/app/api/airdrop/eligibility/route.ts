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

    // Mock data for demo
    const eligibleReviews = [
      {
        id: 'rev_001',
        skillName: 'Code Analyzer Pro',
        reviewContent: 'Excellent code analysis tool with great integration.',
        qualityScore: 95,
        amount: 50,
        currency: 'ASKL',
        submittedAt: '2026-02-08T10:30:00Z',
      },
      {
        id: 'rev_002',
        skillName: 'Data Pipeline Agent',
        reviewContent: 'Solid performance, minor improvements needed.',
        qualityScore: 78,
        amount: 30,
        currency: 'ASKL',
        submittedAt: '2026-02-07T15:20:00Z',
      },
      {
        id: 'rev_003',
        skillName: 'Test Generator',
        reviewContent: 'Amazing test coverage automation!',
        qualityScore: 92,
        amount: 45,
        currency: 'ASKL',
        submittedAt: '2026-02-06T09:15:00Z',
      },
    ];

    const totalAmount = eligibleReviews.reduce((sum, r) => sum + r.amount, 0);
    const avgQuality = eligibleReviews.reduce((sum, r) => sum + r.qualityScore, 0) / eligibleReviews.length;

    // Mock leaderboard
    const leaderboard = [
      { rank: 1, address: wallet.toLowerCase(), totalEarned: totalAmount, reviewCount: eligibleReviews.length, avgQuality, badge: 'gold' },
      { rank: 2, address: '0x1234...5678', totalEarned: 95, reviewCount: 2, avgQuality: 85.0, badge: 'silver' },
      { rank: 3, address: '0xabcd...ef01', totalEarned: 70, reviewCount: 2, avgQuality: 82.5, badge: 'bronze' },
    ];

    return NextResponse.json({
      success: true,
      data: {
        wallet: wallet.toLowerCase(),
        eligibleReviews,
        summary: {
          totalAmount,
          reviewCount: eligibleReviews.length,
          avgQuality: Math.round(avgQuality * 10) / 10,
        },
        userRank: leaderboard[0],
      },
      leaderboard,
    });
  } catch (error) {
    console.error('Error checking eligibility:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check eligibility' },
      { status: 500 }
    );
  }
}
