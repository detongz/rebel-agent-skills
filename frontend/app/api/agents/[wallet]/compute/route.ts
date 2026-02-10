// app/api/agents/[wallet]/compute/route.ts - Get agent compute usage
import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

// GET - Fetch compute usage statistics for an agent wallet
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ wallet: string }> }
) {
  try {
    const { wallet } = await params;
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30'); // Default to last 30 days

    // Validation: wallet address format (basic check)
    const addressRegex = /^0x[a-fA-F0-9]{40}$/;
    if (!addressRegex.test(wallet)) {
      return NextResponse.json(
        { success: false, error: 'Invalid wallet address format' },
        { status: 400 }
      );
    }

    const normalizedWallet = wallet.toLowerCase();

    // Fetch current agent usage record
    const agentUsage = db.prepare(`
      SELECT
        id,
        agent_address,
        total_compute_units,
        skill_calls,
        unique_skills_used,
        last_activity_at,
        created_at
      FROM agent_usage
      WHERE agent_address = ?
    `).get(normalizedWallet) as any;

    // Fetch recent activity from reviews (agent-tested reviews)
    const recentActivity = db.prepare(`
      SELECT
        COUNT(*) as recent_reviews,
        SUM(CASE WHEN is_agent_tested = 1 THEN 1 ELSE 0 END) as agent_tested_count,
        MAX(created_at) as last_review_at
      FROM reviews
      WHERE reviewer_address = ?
        AND datetime(created_at) >= datetime('now', '-' || ? || ' days')
    `).get(normalizedWallet, days) as any;

    // Fetch skill usage breakdown
    const skillBreakdown = db.prepare(`
      SELECT
        r.skill_id,
        s.name as skill_name,
        s.platform,
        COUNT(*) as review_count,
        AVG(r.stars) as avg_rating,
        MAX(r.created_at) as last_reviewed
      FROM reviews r
      LEFT JOIN skills s ON r.skill_id = s.id
      WHERE r.reviewer_address = ?
      GROUP BY r.skill_id
      ORDER BY review_count DESC
      LIMIT 10
    `).all(normalizedWallet);

    // Calculate tier based on compute usage
    let tier = 'newcomer';
    let nextTierThreshold = 0;
    let progressPercent = 0;

    if (agentUsage) {
      const computeUnits = agentUsage.total_compute_units || 0;

      if (computeUnits >= 10000) {
        tier = 'platinum';
        nextTierThreshold = 0;
        progressPercent = 100;
      } else if (computeUnits >= 5000) {
        tier = 'gold';
        nextTierThreshold = 10000;
        progressPercent = Math.floor((computeUnits / 10000) * 100);
      } else if (computeUnits >= 1000) {
        tier = 'silver';
        nextTierThreshold = 5000;
        progressPercent = Math.floor((computeUnits / 5000) * 100);
      } else if (computeUnits >= 100) {
        tier = 'bronze';
        nextTierThreshold = 1000;
        progressPercent = Math.floor((computeUnits / 1000) * 100);
      } else {
        tier = 'newcomer';
        nextTierThreshold = 100;
        progressPercent = Math.min(100, Math.floor((computeUnits / 100) * 100));
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        wallet: normalizedWallet,
        tier,
        next_tier_threshold: nextTierThreshold,
        progress_percent: progressPercent,
        usage: agentUsage ? {
          total_compute_units: agentUsage.total_compute_units || 0,
          skill_calls: agentUsage.skill_calls || 0,
          unique_skills_used: agentUsage.unique_skills_used || 0,
          last_activity_at: agentUsage.last_activity_at,
          member_since: agentUsage.created_at,
        } : {
          total_compute_units: 0,
          skill_calls: 0,
          unique_skills_used: 0,
          last_activity_at: null,
          member_since: null,
        },
        recent_activity: {
          days_period: days,
          recent_reviews: recentActivity.recent_reviews || 0,
          agent_tested_count: recentActivity.agent_tested_count || 0,
          last_review_at: recentActivity.last_review_at,
        },
        skill_breakdown: skillBreakdown,
      },
    });
  } catch (error) {
    console.error('Get compute usage error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch compute usage' },
      { status: 500 }
    );
  }
}

// POST - Update agent compute usage (called when agent uses skills)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ wallet: string }> }
) {
  try {
    const { wallet } = await params;
    const body = await request.json();
    const { compute_units, skill_id } = body;

    // Validation: compute_units is required
    if (typeof compute_units !== 'number' || compute_units <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid compute_units value' },
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

    // Check if agent usage record exists
    const existingUsage = db.prepare(`
      SELECT id, total_compute_units, skill_calls, unique_skills_used
      FROM agent_usage
      WHERE agent_address = ?
    `).get(normalizedWallet) as any;

    let newUniqueSkills = 0;
    let newTotalUnits = compute_units;
    let newSkillCalls = 1;

    if (existingUsage) {
      newTotalUnits = existingUsage.total_compute_units + compute_units;
      newSkillCalls = existingUsage.skill_calls + 1;

      // Check if this is a new skill
      if (skill_id) {
        const hasUsedSkill = db.prepare(`
          SELECT 1 FROM reviews WHERE reviewer_address = ? AND skill_id = ?
          LIMIT 1
        `).get(normalizedWallet, skill_id);

        newUniqueSkills = hasUsedSkill ? existingUsage.unique_skills_used : existingUsage.unique_skills_used + 1;
      } else {
        newUniqueSkills = existingUsage.unique_skills_used;
      }

      // Update existing record
      db.prepare(`
        UPDATE agent_usage
        SET total_compute_units = ?,
            skill_calls = ?,
            unique_skills_used = ?,
            last_activity_at = datetime('now')
        WHERE agent_address = ?
      `).run(newTotalUnits, newSkillCalls, newUniqueSkills, normalizedWallet);
    } else {
      // Create new record
      db.prepare(`
        INSERT INTO agent_usage (
          agent_address,
          total_compute_units,
          skill_calls,
          unique_skills_used
        ) VALUES (?, ?, ?, ?)
      `).run(normalizedWallet, compute_units, 1, skill_id ? 1 : 0);
    }

    return NextResponse.json({
      success: true,
      data: {
        wallet: normalizedWallet,
        compute_units_added: compute_units,
        new_totals: {
          total_compute_units: newTotalUnits,
          skill_calls: newSkillCalls,
          unique_skills_used: newUniqueSkills,
        },
      },
    });
  } catch (error) {
    console.error('Update compute usage error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update compute usage' },
      { status: 500 }
    );
  }
}
