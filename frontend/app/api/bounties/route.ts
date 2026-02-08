/**
 * API Route: /api/bounties
 *
 * GET: List all bounties with optional filtering
 * POST: Create a new bounty (requires wallet signature)
 */

import { NextRequest, NextResponse } from 'next/server';

// Mock data for MVP - replace with MCP server call when contract is deployed
const mockBounties = [
  {
    id: '0x1a2b3c4d5e6f',
    title: 'Security Audit for DeFi Protocol',
    description: 'Looking for comprehensive security audit of our new DeFi protocol. Focus on reentrancy, overflow, and access control vulnerabilities.',
    reward: 500,
    category: 'security-audit',
    creator: '0x1234567890abcdef1234567890abcdef12345678',
    status: 'open',
    createdAt: new Date('2026-02-07').toISOString(),
    deadline: new Date('2026-02-21').toISOString(),
  },
  {
    id: '0x2b3c4d5e6f7a',
    title: 'Code Review for NFT Marketplace',
    description: 'Need code review for NFT marketplace smart contracts. Checking gas optimization and best practices.',
    reward: 250,
    category: 'code-review',
    creator: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
    status: 'open',
    createdAt: new Date('2026-02-06').toISOString(),
    deadline: new Date('2026-02-20').toISOString(),
  },
  {
    id: '0x3c4d5e6f7a8b',
    title: 'Test Suite for Token Contract',
    description: 'Create comprehensive test suite for ERC20 token contract with edge cases and fuzz testing.',
    reward: 150,
    category: 'test-generation',
    creator: '0x567890abcdef1234567890abcdef1234567890',
    status: 'in-progress',
    createdAt: new Date('2026-02-05').toISOString(),
    deadline: new Date('2026-02-19').toISOString(),
    assignee: '0x9876543210987654321098765432109876543210',
  },
  {
    id: '0x4e5f6a7b8c9d',
    title: 'Gas Optimization for DEX',
    description: 'Optimize gas usage for decentralized exchange smart contracts. Target: 20% reduction.',
    reward: 300,
    category: 'optimization',
    creator: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
    status: 'completed',
    createdAt: new Date('2026-02-04').toISOString(),
    deadline: new Date('2026-02-18').toISOString(),
    assignee: '0x1234567890abcdef1234567890abcdef12345678',
  },
  {
    id: '0x5f6a7b8c9d0e',
    title: 'API Documentation for Protocol',
    description: 'Write comprehensive API documentation for our DeFi protocol. Include examples and tutorials.',
    reward: 100,
    category: 'documentation',
    creator: '0x567890abcdef1234567890abcdef1234567890',
    status: 'open',
    createdAt: new Date('2026-02-08').toISOString(),
    deadline: new Date('2026-02-22').toISOString(),
  },
];

// In-memory storage for new bounties (resets on server restart)
let bounties = [...mockBounties];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const category = searchParams.get('category') || '';
    const sortBy = searchParams.get('sortBy') || 'newest';
    const limit = parseInt(searchParams.get('limit') || '50');

    let filtered = bounties;

    // Filter by status
    if (status !== 'all') {
      filtered = filtered.filter((b) => b.status === status);
    }

    // Filter by category
    if (category) {
      filtered = filtered.filter((b) => b.category === category);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'reward':
          return b.reward - a.reward;
        case 'deadline':
          return (new Date(a.deadline || 0).getTime() || 0) - (new Date(b.deadline || 0).getTime() || 0);
        case 'newest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    const results = filtered.slice(0, limit);

    return NextResponse.json({
      success: true,
      data: results,
      count: results.length,
    });
  } catch (error) {
    console.error('Error fetching bounties:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch bounties' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, reward, category, deadline } = body;

    // Validation
    if (!title || !description || !reward) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: title, description, reward' },
        { status: 400 }
    );
    }

    if (reward < 0) {
      return NextResponse.json(
        { success: false, error: 'Reward must be positive' },
        { status: 400 }
      );
    }

    // Generate bounty ID
    const bountyId = `0x${Date.now().toString(16)}${Math.random().toString(16).slice(2, 10)}`;

    const newBounty: any = {
      id: bountyId,
      title,
      description,
      reward: Number(reward),
      category: category || 'other',
      creator: '0xUSER_WALLET_ADDRESS', // TODO: Get from session/JWT
      status: 'open',
      createdAt: new Date().toISOString(),
      deadline: deadline ? new Date(deadline).toISOString() : undefined,
    };

    // Add to in-memory storage
    bounties.unshift(newBounty);

    // TODO: In production, call MCP Server's post_bounty tool
    // This would interact with the smart contract

    return NextResponse.json({
      success: true,
      data: newBounty,
      message: 'Bounty posted successfully',
    });
  } catch (error) {
    console.error('Error creating bounty:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create bounty' },
      { status: 500 }
    );
  }
}
