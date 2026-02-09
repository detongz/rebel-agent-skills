/**
 * API Route: /api/skills
 *
 * GET: List all skills from the ASKL Token smart contract on Monad Testnet
 *
 * Contract Address: 0xc1fFCAD15e2f181E49bFf2cBea79094eC9B5033A
 * Network: Monad Testnet (Chain ID: 10143)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSkills } from '@/lib/contract-service';

/**
 * GET /api/skills
 * Fetches skills from the deployed ASKL Token smart contract
 *
 * Note: The current contract implementation stores skill registration events
 * but doesn't have a getAllSkills view function. This implementation returns
 * mock data that simulates on-chain data. In production, either:
 * 1. Add getAllSkills() to the smart contract, or
 * 2. Use an indexer/The Graph to query SkillRegistered events
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform') || 'all';
    const sort = searchParams.get('sort') || 'tips';
    const limit = parseInt(searchParams.get('limit') || '50');

    // Fetch skills (currently returns mock data simulating on-chain)
    const skills = await getSkills({
      platform,
      sort: sort as any,
      limit,
    });

    return NextResponse.json({
      success: true,
      data: skills,
      count: skills.length,
      source: 'ASKL Token contract on Monad Testnet (simulated data - contract needs getAllSkills() function)',
      contractAddress: '0xc1fFCAD15e2f181E49bFf2cBea79094eC9B5033A',
    });
  } catch (error) {
    console.error('Error fetching skills:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch skills from smart contract',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
