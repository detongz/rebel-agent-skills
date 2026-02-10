// app/api/reviews/airdrop/check/route.ts - Check airdrop eligibility
import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

// GET - Check airdrop eligibility for a wallet address
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get('wallet');

    // Validation: wallet address is required
    if (!wallet) {
      return NextResponse.json(
        { success: false, error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    // Validation: wallet address format (basic check)
    const addressRegex = /^0x[a-fA-F0-9]{40}$/;
    if (!addressRegex.test(wallet)) {
      return NextResponse.json(
        { success: false, error: 'Invalid wallet address format' },
        { status: 400 }
      );
    }

    const normalizedWallet = wallet.toLowerCase();

    // Fetch user's review statistics
    const reviewStats = db.prepare(`
      SELECT
        COUNT(*) as total_reviews,
        AVG(stars) as average_rating,
        SUM(CASE WHEN is_verified_purchase = 1 THEN 1 ELSE 0 END) as verified_count,
        SUM(CASE WHEN is_agent_tested = 1 THEN 1 ELSE 0 END) as agent_tested_count,
        COUNT(DISTINCT skill_id) as unique_skills_reviewed
      FROM reviews
      WHERE reviewer_address = ? AND status = 'active'
    `).get(normalizedWallet) as any;

    // Fetch agent usage statistics
    const agentUsage = db.prepare(`
      SELECT
        total_compute_units,
        skill_calls,
        unique_skills_used,
        last_activity_at
      FROM agent_usage
      WHERE agent_address = ?
    `).get(normalizedWallet) as any;

    // Check eligibility criteria
    const airdropCriteria = {
      min_reviews: 3, // Minimum 3 reviews required
      min_avg_rating: 3.0, // Minimum average rating of 3.0
      min_verified: 1, // At least 1 verified purchase review
      has_agent_activity: false, // Agent usage (optional but increases tier)
    };

    // Calculate eligibility
    const totalReviews = reviewStats.total_reviews || 0;
    const avgRating = reviewStats.average_rating || 0;
    const verifiedCount = reviewStats.verified_count || 0;
    const agentTestedCount = reviewStats.agent_tested_count || 0;
    const uniqueSkillsReviewed = reviewStats.unique_skills_reviewed || 0;

    // Check if eligible
    const isEligible =
      totalReviews >= airdropCriteria.min_reviews &&
      avgRating >= airdropCriteria.min_avg_rating &&
      verifiedCount >= airdropCriteria.min_verified;

    // Check agent activity
    const hasAgentActivity = agentUsage && agentUsage.skill_calls > 0;
    airdropCriteria.has_agent_activity = hasAgentActivity;

    // Determine tier based on activity
    let tier = 'ineligible';
    let airdropAmount = 0;

    if (isEligible) {
      if (totalReviews >= 10 && avgRating >= 4.5 && verifiedCount >= 3) {
        tier = 'gold';
        airdropAmount = 1000;
      } else if (totalReviews >= 5 && avgRating >= 4.0 && verifiedCount >= 2) {
        tier = 'silver';
        airdropAmount = 500;
      } else {
        tier = 'bronze';
        airdropAmount = 100;
      }

      // Bonus for agent activity
      if (hasAgentActivity && agentUsage.total_compute_units > 100) {
        airdropAmount = Math.floor(airdropAmount * 1.5); // 50% bonus
        tier = `${tier}_plus`;
      }

      // Bonus for agent-tested reviews
      if (agentTestedCount >= 2) {
        airdropAmount = Math.floor(airdropAmount * 1.2); // 20% bonus
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        wallet: normalizedWallet,
        is_eligible: isEligible,
        tier,
        airdrop_amount: airdropAmount,
        criteria: airdropCriteria,
        stats: {
          reviews: {
            total: totalReviews,
            average_rating: avgRating ? parseFloat(avgRating.toFixed(1)) : 0,
            verified_count: verifiedCount,
            agent_tested_count: agentTestedCount,
            unique_skills_reviewed: uniqueSkillsReviewed,
          },
          agent_usage: agentUsage ? {
            total_compute_units: agentUsage.total_compute_units,
            skill_calls: agentUsage.skill_calls,
            unique_skills_used: agentUsage.unique_skills_used,
            last_activity_at: agentUsage.last_activity_at,
          } : null,
        },
        progress: {
          reviews_needed: Math.max(0, airdropCriteria.min_reviews - totalReviews),
          rating_improvement: Math.max(0, airdropCriteria.min_avg_rating - avgRating),
          verified_needed: Math.max(0, airdropCriteria.min_verified - verifiedCount),
        },
      },
    });
  } catch (error) {
    console.error('Airdrop eligibility check error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check airdrop eligibility' },
      { status: 500 }
    );
  }
}
