/**
 * API Route: /api/skills
 *
 * GET: List all skills with optional filtering
 */

import { NextRequest, NextResponse } from 'next/server';

// Mock skills data - replace with MCP Server call
const mockSkills = [
  {
    id: '0xskill001',
    name: 'Web Security Scanner',
    platform: 'claude-code',
    description: 'Automated security scanning for web applications. Detects XSS, SQL injection, CSRF vulnerabilities.',
    totalTips: 1250.5,
    totalStars: 42,
    creator: '0x1234567890abcdef1234567890abcdef12345678',
    createdAt: new Date('2026-02-01').toISOString(),
  },
  {
    id: '0xskill002',
    name: 'Smart Contract Auditor',
    platform: 'coze',
    description: 'AI-powered smart contract vulnerability detection for Solidity contracts.',
    totalTips: 890.0,
    totalStars: 35,
    creator: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
    createdAt: new Date('2026-02-03').toISOString(),
  },
  {
    id: '0xskill003',
    name: 'Test Generator',
    platform: 'manus',
    description: 'Generate comprehensive test suites from TypeScript/JavaScript code.',
    totalTips: 567.25,
    totalStars: 28,
    creator: '0x567890abcdef1234567890abcdef1234567890',
    createdAt: new Date('2026-02-05').toISOString(),
  },
  {
    id: '0xskill004',
    name: 'Code Optimizer',
    platform: 'claude-code',
    description: 'Optimize JavaScript/TypeScript code for better performance and smaller bundle size.',
    totalTips: 445.0,
    totalStars: 23,
    creator: '0x9876543210987654321098765432109876543210',
    createdAt: new Date('2026-02-06').toISOString(),
  },
  {
    id: '0xskill005',
    name: 'Documentation Writer',
    platform: 'minibmp',
    description: 'Auto-generate API documentation from JSDoc comments and TypeScript types.',
    totalTips: 334.5,
    totalStars: 19,
    creator: '0xfedcba9876543210fedcba9876543210fedcba98',
    createdAt: new Date('2026-02-07').toISOString(),
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform') || 'all';
    const sort = searchParams.get('sort') || 'tips';
    const limit = parseInt(searchParams.get('limit') || '50');

    let filtered = [...mockSkills];

    // Filter by platform
    if (platform !== 'all') {
      filtered = filtered.filter((s) => s.platform === platform);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sort) {
        case 'stars':
          return b.totalStars - a.totalStars;
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'name':
          return a.name.localeCompare(b.name);
        case 'tips':
        default:
          return b.totalTips - a.totalTips;
      }
    });

    const results = filtered.slice(0, limit);

    return NextResponse.json({
      success: true,
      data: results,
      count: results.length,
    });
  } catch (error) {
    console.error('Error fetching skills:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch skills' },
      { status: 500 }
    );
  }
}
