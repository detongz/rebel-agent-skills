/**
 * API Route: /api/bounties
 *
 * GET: List all bounties from the deployed BountyHub smart contract on Monad Testnet
 * POST: Create a new bounty (requires wallet signature - handled on frontend)
 *
 * Contract Address: 0x2679Bb99E7Cc239787a74BF6c77c2278311c77a1
 * Network: Monad Testnet (Chain ID: 10143)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getBounties } from '@/lib/contract-service';

/**
 * GET /api/bounties
 * Fetches bounties from the deployed BountyHub smart contract
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const category = searchParams.get('category') || '';
    const sortBy = searchParams.get('sortBy') || 'newest';
    const limit = parseInt(searchParams.get('limit') || '50');

    // Fetch from smart contract
    const bounties = await getBounties({
      status: status as any,
      category,
      sortBy: sortBy as any,
      limit,
    });

    return NextResponse.json({
      success: true,
      data: bounties,
      count: bounties.length,
      source: 'BountyHub contract on Monad Testnet',
      contractAddress: '0x2679Bb99E7Cc239787a74BF6c77c2278311c77a1',
    });
  } catch (error) {
    console.error('Error fetching bounties from contract:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch bounties from smart contract',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/bounties
 * Creates a new bounty on the smart contract
 *
 * NOTE: This endpoint provides server-side validation but the actual transaction
 * must be signed by the user's wallet on the frontend. Use the createBounty function
 * from contract-service.ts with the user's signer.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, reward, category, deadline } = body;

    // Validation
    if (!title || !description || !reward) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: title, description, reward',
        },
        { status: 400 }
      );
    }

    if (reward < 0) {
      return NextResponse.json(
        { success: false, error: 'Reward must be positive' },
        { status: 400 }
      );
    }

    // IMPORTANT: Cannot create bounty from server-side
    // The transaction must be signed by the user's wallet
    // This endpoint validates the request but the frontend must call the contract directly
    return NextResponse.json({
      success: false,
      error: 'Direct contract interaction required',
      message: 'Bounty creation requires a wallet signature. Please use the createBounty function from contract-service.ts with the user signer on the frontend.',
      instructions: {
        step1: 'Connect user wallet (use RainbowKit or similar)',
        step2: 'Call createBounty(signer, { reward, skillId, title }) from contract-service.ts',
        step3: 'Wait for transaction confirmation',
        step4: 'Refresh the bounties list',
      },
      contractAddress: '0x2679Bb99E7Cc239787a74BF6c77c2278311c77a1',
    }, { status: 400 });
  } catch (error) {
    console.error('Error validating bounty creation:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to validate bounty request',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
