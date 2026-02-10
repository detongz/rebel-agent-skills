/**
 * Paid Services Configuration
 * Defines all premium services available for purchase via x402 protocol
 */

export interface ServiceConfig {
  id: string;
  name: string;
  description: string;
  category: 'security' | 'visibility' | 'evaluation' | 'custom';
  price: number; // in USDC (6 decimals, e.g., 50000 = $0.05 USDC)
  priceDisplay: string; // Human-readable price
  currency: 'USDC';
  icon: string;
  features: string[];
  requiresInput: boolean;
  processingTime: string;
}

export const PAID_SERVICES: Record<string, ServiceConfig> = {
  'security-audit': {
    id: 'security-audit',
    name: 'Security Audit Detection',
    description: 'AI-powered vulnerability scanning for smart contracts and code',
    category: 'security',
    price: 50000, // $0.05 USDC
    priceDisplay: '$0.05',
    currency: 'USDC',
    icon: '🛡️',
    features: [
      'Solidity smart contract analysis',
      'Detects reentrancy, overflow, access control',
      'Detailed vulnerability report',
      'Remediation suggestions',
    ],
    requiresInput: true,
    processingTime: '~2 minutes',
  },
  'ranking-boost': {
    id: 'ranking-boost',
    name: 'Ranking Boost',
    description: 'Increase your skill visibility for 24 hours',
    category: 'visibility',
    price: 100000, // $0.10 USDC
    priceDisplay: '$0.10',
    currency: 'USDC',
    icon: '⚡',
    features: [
      '2x visibility boost',
      'Priority in search results',
      'Highlighted badge display',
      'Lasts 24 hours',
    ],
    requiresInput: true,
    processingTime: 'Instant',
  },
  'agent-evaluation': {
    id: 'agent-evaluation',
    name: 'Expert Agent Evaluation',
    description: 'Get your skill reviewed by expert AI agents',
    category: 'evaluation',
    price: 150000, // $0.15 USDC
    priceDisplay: '$0.15',
    currency: 'USDC',
    icon: '⭐',
    features: [
      'Comprehensive skill review',
      'Quality scoring (1-100)',
      'Performance benchmarking',
      'Improvement recommendations',
    ],
    requiresInput: true,
    processingTime: '~24 hours',
  },
  'custom-request': {
    id: 'custom-request',
    name: 'Custom Skill Development',
    description: 'Request custom skill development from expert creators',
    category: 'custom',
    price: 500000, // $0.50 USDC
    priceDisplay: '$0.50',
    currency: 'USDC',
    icon: '🔧',
    features: [
      'Post custom skill requirements',
      'Expert creator matching',
      'Development tracking',
      'Quality guarantee',
    ],
    requiresInput: true,
    processingTime: 'Variable',
  },
};

export const SERVICE_CATEGORIES = {
  security: {
    name: 'Security Services',
    description: 'Protect and audit your code',
    color: 'from-red-500 to-orange-500',
  },
  visibility: {
    name: 'Visibility Boosts',
    description: 'Get more eyes on your skills',
    color: 'from-purple-500 to-pink-500',
  },
  evaluation: {
    name: 'Expert Reviews',
    description: 'Professional skill evaluations',
    color: 'from-yellow-500 to-amber-500',
  },
  custom: {
    name: 'Custom Development',
    description: 'Build custom solutions',
    color: 'from-blue-500 to-cyan-500',
  },
};

/**
 * Get the x402 payment configuration
 */
export const X402_CONFIG = {
  chainId: 'eip155:10143' as const,
  usdcAddress: '0x534b2f3A21130d7a60830c2Df862319e593943A3',
  facilitator: 'https://x402-facilitator.molandak.org',
};
