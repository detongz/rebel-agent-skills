/**
 * API Route: POST /api/publish/prepare
 *
 * Prepare to publish a skill:
 * - Validate the repository
 * - Check if already published
 * - Return payment requirements
 * - Check subscription status
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSkills, hasActiveSubscription, PRICING, createPublication } from '@/lib/skills-db';

interface PrepareRequest {
  url: string;
  name: string;
  category?: string;
  plan?: 'single' | 'subscription';
  creator: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: PrepareRequest = await request.json();
    const { url, name, category = 'general', plan = 'single', creator } = body;

    // Validate GitHub URL
    const githubMatch = url.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!githubMatch) {
      return NextResponse.json(
        { success: false, error: 'Invalid GitHub URL' },
        { status: 400 }
      );
    }

    const [_, owner, repo] = githubMatch;
    const repoFullName = `${owner}/${repo}`;

    // Check if already published
    const existingSkills = await getSkills();
    const alreadyExists = existingSkills.some(s =>
      s.repository === repoFullName || s.name === name
    );

    if (alreadyExists) {
      return NextResponse.json(
        {
          success: false,
          error: 'Skill already published',
          message: 'This skill has already been published to the platform'
        },
        { status: 409 }
      );
    }

    // Check subscription status
    const hasSubscription = await hasActiveSubscription(creator);

    // Create publication record
    const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await createPublication({
      url,
      name,
      category,
      creator,
      plan,
      paymentId
    });

    // Return payment requirements
    if (hasSubscription) {
      return NextResponse.json({
        success: true,
        payment_required: false,
        subscription_active: true,
        message: 'Your active subscription covers this publication'
      });
    }

    // Payment required
    const pricing = plan === 'subscription'
      ? PRICING.subscription.monthly
      : PRICING.single;

    return NextResponse.json({
      success: true,
      payment_required: true,
      amount: pricing.amount,
      currency: pricing.currency,
      network: 'eip155:10143',
      x402_facilitator: 'https://x402-facilitator.molandak.org',
      payment_id: paymentId,
      plan,
      message: plan === 'subscription'
        ? 'Subscribe for unlimited publishes'
        : 'One-time publication fee'
    });

  } catch (error) {
    console.error('Publish prepare error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to prepare publication',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
