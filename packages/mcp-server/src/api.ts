/**
 * MySkills MCP Server - HTTP API Export
 *
 * This file exports MCP tool functions for use in Next.js API routes.
 * For the MVP, we use in-memory storage and mock data when contract is not deployed.
 */

// Note: MCP tools are handled internally by the MCP server
// This file is kept for potential future HTTP API exposure

// Types are defined internally in index.ts - re-export omitted for now
// export type { Skill, Task, Milestone } from './index';

// Re-export type definitions for API usage
export interface MCPToolResponse {
  content: Array<{
    type: string;
    text: string;
  }>;
  isError?: boolean;
}

// Helper function to parse MCP server responses
export function parseMCPResponse(result: any) {
  if (result.isError) {
    throw new Error(result.content?.[0]?.text || 'Unknown error');
  }
  return result.content?.[0]?.text;
}

// Mock data fallback when contract is not deployed
export const mockBounties = [
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
];

export const mockSkills = [
  {
    id: '0xskill001',
    name: 'Web Security Scanner',
    platform: 'claude-code',
    description: 'Automated security scanning for web applications',
    totalTips: 1250.5,
    totalStars: 42,
    creator: '0x1234567890abcdef1234567890abcdef12345678',
    createdAt: new Date('2026-02-01').toISOString(),
  },
  {
    id: '0xskill002',
    name: 'Smart Contract Auditor',
    platform: 'coze',
    description: 'AI-powered smart contract vulnerability detection',
    totalTips: 890.0,
    totalStars: 35,
    creator: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
    createdAt: new Date('2026-02-03').toISOString(),
  },
  {
    id: '0xskill003',
    name: 'Test Generator',
    platform: 'manus',
    description: 'Generate comprehensive test suites from code',
    totalTips: 567.25,
    totalStars: 28,
    creator: '0x567890abcdef1234567890abcdef1234567890',
    createdAt: new Date('2026-02-05').toISOString(),
  },
];
