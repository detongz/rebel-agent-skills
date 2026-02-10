/**
 * Smart Contract Service
 * Handles all interactions with deployed contracts on Monad Testnet
 * Connects frontend APIs to ASKLToken and BountyHub contracts
 */

import { ethers } from 'ethers';

// Monad Testnet RPC
const RPC_URL = 'https://testnet-rpc.monad.xyz';

// Contract addresses (deployed on Monad Testnet)
export const CONTRACT_ADDRESSES = {
  ASKL_TOKEN: '0xc1fFCAD15e2f181E49bFf2cBea79094eC9B5033A',
  BOUNTY_HUB: '0x2679Bb99E7Cc239787a74BF6c77c2278311c77a1',
} as const;

// ASKL Token ABI - minimal interface for our needs
export const ASKL_TOKEN_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address) view returns (uint256)',
  'function tipSkill(bytes32 skillId, uint256 amount) external',
  'function skillCreators(bytes32) view returns (address)',
  'function skillEarnings(bytes32) view returns (uint256)',
  'event Tipped(bytes32 indexed skillId, address indexed tipper, address indexed creator, uint256 amount)',
] as const;

// BountyHub ABI - Matches the deployed AgentBountyHub contract
export const BOUNTY_HUB_ABI = [
  'function createBounty(string title, string description, uint256 reward, string category, uint256 deadline) external',
  'function claimBounty(uint256 bountyId) external',
  'function submitWork(uint256 bountyId, string reportHash) external',
  'function approveSubmission(uint256 bountyId) external',
  'function raiseDispute(uint256 bountyId, string reason) external',
  'function resolveDispute(uint256 bountyId, bool inFavorOfCreator) external',
  'function cancelBounty(uint256 bountyId) external',
  'function getBounty(uint256 bountyId) external view returns (tuple(uint256 id, address creator, string title, string description, uint256 reward, string category, uint256 deadline, uint8 status, address claimer, uint256 claimedAt, uint256 completedAt))',
  'function getSubmissions(uint256 bountyId) external view returns (tuple(uint256 bountyId, address submitter, string reportHash, uint256 submittedAt, bool approved)[])',
  'function getDispute(uint256 bountyId) external view returns (tuple(uint256 bountyId, address raiser, string reason, uint256 raisedAt, uint8 status, uint256 resolutionTimestamp, bool resolvedInFavorOfCreator))',
  'event BountyCreated(uint256 indexed bountyId, address indexed creator, string title, uint256 reward, string category)',
  'event BountyClaimed(uint256 indexed bountyId, address indexed claimer, uint256 claimedAt)',
  'event SubmissionMade(uint256 indexed bountyId, address indexed submitter, string reportHash)',
  'event SubmissionApproved(uint256 indexed bountyId, address indexed submitter, uint256 reward)',
  'event DisputeRaised(uint256 indexed bountyId, address indexed raiser, string reason)',
  'event DisputeResolved(uint256 indexed bountyId, bool resolvedInFavorOfCreator)',
  'event BountyCancelled(uint256 indexed bountyId)',
] as const;

/**
 * Get a read-only provider for Monad Testnet
 */
function getProvider(): ethers.JsonRpcProvider {
  return new ethers.JsonRpcProvider(RPC_URL);
}

/**
 * Get ASKL Token contract instance (read-only)
 */
function getASKLContract() {
  const provider = getProvider();
  return new ethers.Contract(CONTRACT_ADDRESSES.ASKL_TOKEN, ASKL_TOKEN_ABI, provider);
}

/**
 * Get BountyHub contract instance (read-only)
 */
function getBountyHubContract() {
  const provider = getProvider();
  return new ethers.Contract(CONTRACT_ADDRESSES.BOUNTY_HUB, BOUNTY_HUB_ABI, provider);
}

/**
 * Get contract instances with signer for write operations
 * This is used when the frontend needs to execute transactions
 */
export function getContractsWithSigner(signer: ethers.Signer) {
  const asklToken = new ethers.Contract(CONTRACT_ADDRESSES.ASKL_TOKEN, ASKL_TOKEN_ABI, signer);
  const bountyHub = new ethers.Contract(CONTRACT_ADDRESSES.BOUNTY_HUB, BOUNTY_HUB_ABI, signer);
  return { asklToken, bountyHub };
}

// ============ SKILL RELATED FUNCTIONS ============

/**
 * Get token metadata
 */
export async function getTokenInfo() {
  try {
    const token = getASKLContract();
    const [name, symbol, totalSupply] = await Promise.all([
      token.name(),
      token.symbol(),
      token.totalSupply(),
    ]);

    return {
      name,
      symbol,
      totalSupply: ethers.formatEther(totalSupply),
    };
  } catch (error) {
    console.error('Error fetching token info:', error);
    throw error;
  }
}

/**
 * Get skills from the contract
 * Note: The current contract doesn't have a getAllSkills function
 * This is a placeholder that returns mock data derived from contract events
 * In production, you would query SkillRegistered events or use an indexer
 */
export async function getSkills(options: {
  platform?: string;
  sort?: 'tips' | 'stars' | 'newest' | 'name';
  limit?: number;
} = {}) {
  try {
    // TODO: When the contract has a proper skills registry, query it here
    // For now, return mock data that simulates on-chain data
    const mockSkills = [
      // ========== SMART CONTRACT AUDIT SKILLS (DeFi) ==========
      {
        id: 1,
        skill_id: ethers.hexlify(ethers.randomBytes(32)),
        name: 'Smart Contract Auditor',
        platform: 'coze',
        description: 'AI-powered smart contract vulnerability detection for Solidity contracts. Detects reentrancy, overflow, access control issues.',
        payment_address: '0x8A3D2F1E4C5B6A7890DEF123456789ABCDEF1234',
        total_tips: ethers.parseEther('2890.0').toString(),
        platform_likes: 89,
        stars: 89,
        category: 'Security Audit',
        creator: '0x8A3D2F1E4C5B6A7890DEF123456789ABCDEF1234',
        createdAt: new Date('2026-02-01').toISOString(),
        repository: 'https://github.com/myskills-protocol/smart-contract-auditor',
        npm_package: '@myskills/smart-contract-auditor',
        homepage: 'https://skills.sh/myskills-protocol/smart-contract-auditor',
        download_count: 1234,
      },
      {
        id: 2,
        skill_id: ethers.hexlify(ethers.randomBytes(32)),
        name: 'DeFi Protocol Analyzer',
        platform: 'claude-code',
        description: 'Comprehensive security analysis for DeFi protocols. Checks for common attack vectors and economic vulnerabilities.',
        payment_address: '0x1B2C3D4E5F6A7B8C9D0EF123456789ABCDEF5678',
        total_tips: ethers.parseEther('2150.5').toString(),
        platform_likes: 76,
        stars: 76,
        category: 'Security Audit',
        creator: '0x1B2C3D4E5F6A7B8C9D0EF123456789ABCDEF5678',
        createdAt: new Date('2026-02-02').toISOString(),
      },
      {
        id: 3,
        skill_id: ethers.hexlify(ethers.randomBytes(32)),
        name: 'Flash Loan Simulator',
        platform: 'manus',
        description: 'Simulate flash loan attacks on your smart contracts. Test economic security before deployment.',
        payment_address: '0x9F8E7D6C5B4A3F2E1D0C123456789ABCDEF90AB',
        total_tips: ethers.parseEther('1678.0').toString(),
        platform_likes: 65,
        stars: 65,
        category: 'Security Audit',
        creator: '0x9F8E7D6C5B4A3F2E1D0C123456789ABCDEF90AB',
        createdAt: new Date('2026-02-03').toISOString(),
      },

      // ========== PDF PROCESSING SKILLS ==========
      {
        id: 4,
        skill_id: ethers.hexlify(ethers.randomBytes(32)),
        name: 'PDF Data Extractor',
        platform: 'minimax',
        description: 'Extract structured data from PDF documents including tables, forms, and invoices with 98% accuracy.',
        payment_address: '0x2C3D4E5F6A7B8C9D0E1F123456789ABCDEF12345',
        total_tips: ethers.parseEther('1434.25').toString(),
        platform_likes: 58,
        stars: 58,
        category: 'Data Processing',
        creator: '0x2C3D4E5F6A7B8C9D0E1F123456789ABCDEF12345',
        createdAt: new Date('2026-02-04').toISOString(),
      },
      {
        id: 5,
        skill_id: ethers.hexlify(ethers.randomBytes(32)),
        name: 'Document Intelligence Hub',
        platform: 'coze',
        description: 'Intelligent PDF analysis for financial documents, legal contracts, and technical specifications.',
        payment_address: '0x3D4E5F6A7B8C9D0E1F2A123456789ABCDEF23456',
        total_tips: ethers.parseEther('1189.5').toString(),
        platform_likes: 51,
        stars: 51,
        category: 'Data Processing',
        creator: '0x3D4E5F6A7B8C9D0E1F2A123456789ABCDEF23456',
        createdAt: new Date('2026-02-05').toISOString(),
      },

      // ========== DATA ANALYSIS SKILLS ==========
      {
        id: 6,
        skill_id: ethers.hexlify(ethers.randomBytes(32)),
        name: 'Crypto Market Analyst',
        platform: 'claude-code',
        description: 'Real-time cryptocurrency market analysis with sentiment tracking, whale alerts, and pattern recognition.',
        payment_address: '0x4E5F6A7B8C9D0E1F2A3B123456789ABCDEF34567',
        total_tips: ethers.parseEther('3456.75').toString(),
        platform_likes: 112,
        stars: 92,
        category: 'Data Analytics',
        creator: '0x4E5F6A7B8C9D0E1F2A3B123456789ABCDEF34567',
        createdAt: new Date('2026-02-06').toISOString(),
      },
      {
        id: 7,
        skill_id: ethers.hexlify(ethers.randomBytes(32)),
        name: 'On-Chain Data Explorer',
        platform: 'manus',
        description: 'Deep analytics for blockchain transactions, wallet behavior analysis, and NFT market insights.',
        payment_address: '0x5F6A7B8C9D0E1F2A3B4C123456789ABCDEF45678',
        total_tips: ethers.parseEther('2234.0').toString(),
        platform_likes: 87,
        stars: 87,
        category: 'Data Analytics',
        creator: '0x5F6A7B8C9D0E1F2A3B4C123456789ABCDEF45678',
        createdAt: new Date('2026-02-07').toISOString(),
      },
      {
        id: 8,
        skill_id: ethers.hexlify(ethers.randomBytes(32)),
        name: 'Financial Report Generator',
        platform: 'minimax',
        description: 'Automated financial reporting from raw data. Generate balance sheets, P&L, and cash flow statements.',
        payment_address: '0x6A7B8C9D0E1F2A3B4C5D123456789ABCDEF56789',
        total_tips: ethers.parseEther('1876.5').toString(),
        platform_likes: 72,
        stars: 72,
        category: 'Data Analytics',
        creator: '0x6A7B8C9D0E1F2A3B4C5D123456789ABCDEF56789',
        createdAt: new Date('2026-02-08').toISOString(),
      },

      // ========== CODE GENERATION SKILLS ==========
      {
        id: 9,
        skill_id: ethers.hexlify(ethers.randomBytes(32)),
        name: 'Smart Contract Generator',
        platform: 'claude-code',
        description: 'Generate secure Solidity smart contracts from natural language specifications with built-in best practices.',
        payment_address: '0x7B8C9D0E1F2A3B4C5D6E123456789ABCDEF67890',
        total_tips: ethers.parseEther('4123.25').toString(),
        platform_likes: 134,
        stars: 94,
        category: 'Code Generation',
        creator: '0x7B8C9D0E1F2A3B4C5D6E123456789ABCDEF67890',
        createdAt: new Date('2026-02-09').toISOString(),
      },
      {
        id: 10,
        skill_id: ethers.hexlify(ethers.randomBytes(32)),
        name: 'Test Suite Builder',
        platform: 'coze',
        description: 'Generate comprehensive test suites including unit tests, integration tests, and fuzzing parameters.',
        payment_address: '0x8C9D0E1F2A3B4C5D6E7F123456789ABCDEF78901',
        total_tips: ethers.parseEther('2987.0').toString(),
        platform_likes: 98,
        stars: 88,
        category: 'Code Generation',
        creator: '0x8C9D0E1F2A3B4C5D6E7F123456789ABCDEF78901',
        createdAt: new Date('2026-02-10').toISOString(),
      },
      {
        id: 11,
        skill_id: ethers.hexlify(ethers.randomBytes(32)),
        name: 'API Integration Builder',
        platform: 'manus',
        description: 'Generate API integration code from OpenAPI specs with proper error handling and retry logic.',
        payment_address: '0x9D0E1F2A3B4C5D6E7F8A123456789ABCDEF89012',
        total_tips: ethers.parseEther('2109.5').toString(),
        platform_likes: 81,
        stars: 81,
        category: 'Code Generation',
        creator: '0x9D0E1F2A3B4C5D6E7F8A123456789ABCDEF89012',
        createdAt: new Date('2026-02-11').toISOString(),
      },

      // ========== IMAGE PROCESSING SKILLS ==========
      {
        id: 12,
        skill_id: ethers.hexlify(ethers.randomBytes(32)),
        name: 'NFT Art Generator',
        platform: 'minimax',
        description: 'AI-powered NFT collection generator with layered traits, rarity calculations, and metadata generation.',
        payment_address: '0x0E1F2A3B4C5D6E7F8A9B123456789ABCDEF90123',
        total_tips: ethers.parseEther('3654.75').toString(),
        platform_likes: 121,
        stars: 91,
        category: 'Image Processing',
        creator: '0x0E1F2A3B4C5D6E7F8A9B123456789ABCDEF90123',
        createdAt: new Date('2026-02-12').toISOString(),
      },
      {
        id: 13,
        skill_id: ethers.hexlify(ethers.randomBytes(32)),
        name: 'Document Scanner',
        platform: 'claude-code',
        description: 'Intelligent document scanning with OCR, table extraction, and handwriting recognition.',
        payment_address: '0x1F2A3B4C5D6E7F8A9B0C123456789ABCDEF01234',
        total_tips: ethers.parseEther('2578.0').toString(),
        platform_likes: 95,
        stars: 85,
        category: 'Image Processing',
        creator: '0x1F2A3B4C5D6E7F8A9B0C123456789ABCDEF01234',
        createdAt: new Date('2026-02-13').toISOString(),
      },

      // ========== NATURAL LANGUAGE PROCESSING SKILLS ==========
      {
        id: 14,
        skill_id: ethers.hexlify(ethers.randomBytes(32)),
        name: 'Sentiment Analysis Engine',
        platform: 'coze',
        description: 'Real-time sentiment analysis for social media, news, and market data with multi-language support.',
        payment_address: '0x2A3B4C5D6E7F8A9B0C1D123456789ABCDEF12345',
        total_tips: ethers.parseEther('3245.25').toString(),
        platform_likes: 108,
        stars: 88,
        category: 'NLP',
        creator: '0x2A3B4C5D6E7F8A9B0C1D123456789ABCDEF12345',
        createdAt: new Date('2026-02-14').toISOString(),
      },
      {
        id: 15,
        skill_id: ethers.hexlify(ethers.randomBytes(32)),
        name: 'Translation Agent',
        platform: 'minimax',
        description: 'Context-aware translation for technical documentation, preserving code snippets and formatting.',
        payment_address: '0x3B4C5D6E7F8A9B0C1D2E123456789ABCDEF23456',
        total_tips: ethers.parseEther('1987.5').toString(),
        platform_likes: 79,
        stars: 79,
        category: 'NLP',
        creator: '0x3B4C5D6E7F8A9B0C1D2E123456789ABCDEF23456',
        createdAt: new Date('2026-02-15').toISOString(),
      },

      // ========== ADDITIONAL CROSS-PLATFORM SKILLS ==========
      // More skills to showcase cross-platform value

      // Workflow Automation (Coze alternative to Claude Code)
      {
        id: 16,
        skill_id: ethers.hexlify(ethers.randomBytes(32)),
        name: 'Workflow Automation Pro',
        platform: 'coze',
        description: 'Automate complex multi-step workflows across different platforms. Connect APIs, databases, and services.',
        payment_address: '0x4C5D6E7F8A9B0C1D2E3F123456789ABCDEF34567',
        total_tips: ethers.parseEther('1876.0').toString(),
        platform_likes: 74,
        stars: 74,
        category: 'Automation',
        creator: '0x4C5D6E7F8A9B0C1D2E3F123456789ABCDEF34567',
        createdAt: new Date('2026-02-16').toISOString(),
      },

      // Code Quality Checker (Claude Code alternative)
      {
        id: 17,
        skill_id: ethers.hexlify(ethers.randomBytes(32)),
        name: 'Code Quality Auditor',
        platform: 'claude-code',
        description: 'Analyze code quality, detect anti-patterns, suggest refactoring opportunities, and enforce best practices.',
        payment_address: '0x5D6E7F8A9B0C1D2E3F4A123456789ABCDEF45678',
        total_tips: ethers.parseEther('2345.5').toString(),
        platform_likes: 93,
        stars: 83,
        category: 'Code Generation',
        creator: '0x5D6E7F8A9B0C1D2E3F4A123456789ABCDEF45678',
        createdAt: new Date('2026-02-17').toISOString(),
      },

      // Video Processing (Manus - multimedia focus)
      {
        id: 18,
        skill_id: ethers.hexlify(ethers.randomBytes(32)),
        name: 'Video Transcription Service',
        platform: 'manus',
        description: 'Transcribe video content with speaker detection, timestamp synchronization, and multi-language support.',
        payment_address: '0x6E7F8A9B0C1D2E3F4A5B123456789ABCDEF56789',
        total_tips: ethers.parseEther('1543.25').toString(),
        platform_likes: 62,
        stars: 62,
        category: 'Media Processing',
        creator: '0x6E7F8A9B0C1D2E3F4A5B123456789ABCDEF56789',
        createdAt: new Date('2026-02-18').toISOString(),
      },

      // Content Generation (MiniMax - text generation focus)
      {
        id: 19,
        skill_id: ethers.hexlify(ethers.randomBytes(32)),
        name: 'Marketing Copy Generator',
        platform: 'minimax',
        description: 'Generate compelling marketing copy, ad text, and promotional content with brand voice consistency.',
        payment_address: '0x7F8A9B0C1D2E3F4A5B6C123456789ABCDEF67890',
        total_tips: ethers.parseEther('2098.75').toString(),
        platform_likes: 84,
        stars: 84,
        category: 'Content Creation',
        creator: '0x7F8A9B0C1D2E3F4A5B6C123456789ABCDEF67890',
        createdAt: new Date('2026-02-19').toISOString(),
      },

      // Chat Bot (MiniMax - conversational AI)
      {
        id: 20,
        skill_id: ethers.hexlify(ethers.randomBytes(32)),
        name: 'Customer Support Bot',
        platform: 'minimax',
        description: 'Intelligent customer service chatbot with context awareness, sentiment analysis, and escalation handling.',
        payment_address: '0x8A9B0C1D2E3F4A5B6C7D123456789ABCDEF78901',
        total_tips: ethers.parseEther('2765.5').toString(),
        platform_likes: 96,
        stars: 86,
        category: 'Chat Bot',
        creator: '0x8A9B0C1D2E3F4A5B6C7D123456789ABCDEF78901',
        createdAt: new Date('2026-02-20').toISOString(),
      },

      // Audio Processing (Manus - multimedia focus)
      {
        id: 21,
        skill_id: ethers.hexlify(ethers.randomBytes(32)),
        name: 'Audio Enhancement Engine',
        platform: 'manus',
        description: 'Clean and enhance audio recordings with noise reduction, echo cancellation, and voice isolation.',
        payment_address: '0x9B0C1D2E3F4A5B6C7D8E123456789ABCDEF89012',
        total_tips: ethers.parseEther('1324.0').toString(),
        platform_likes: 53,
        stars: 53,
        category: 'Media Processing',
        creator: '0x9B0C1D2E3F4A5B6C7D8E123456789ABCDEF89012',
        createdAt: new Date('2026-02-21').toISOString(),
      },

      // Data Extraction (Coze - workflow focus)
      {
        id: 22,
        skill_id: ethers.hexlify(ethers.randomBytes(32)),
        name: 'Web Scraper Pro',
        platform: 'coze',
        description: 'Extract structured data from websites with automatic pagination, form handling, and CAPTCHA solving.',
        payment_address: '0x0C1D2E3F4A5B6C7D8E9F123456789ABCDEF90123',
        total_tips: ethers.parseEther('1654.25').toString(),
        platform_likes: 66,
        stars: 66,
        category: 'Data Processing',
        creator: '0x0C1D2E3F4A5B6C7D8E9F123456789ABCDEF90123',
        createdAt: new Date('2026-02-22').toISOString(),
      },

      // LaTeX Recognition (Claude Code - academic focus)
      {
        id: 23,
        skill_id: ethers.hexlify(ethers.randomBytes(32)),
        name: 'LaTeX Equation Recognizer',
        platform: 'claude-code',
        description: 'Convert handwritten or printed mathematical equations into properly formatted LaTeX code.',
        payment_address: '0x1D2E3F4A5B6C7D8E9F0A123456789ABCDEF01234',
        total_tips: ethers.parseEther('1432.5').toString(),
        platform_likes: 57,
        stars: 57,
        category: 'Data Processing',
        creator: '0x1D2E3F4A5B6C7D8E9F0A123456789ABCDEF01234',
        createdAt: new Date('2026-02-23').toISOString(),
      },

      // Summarization Tool (MiniMax - text processing)
      {
        id: 24,
        skill_id: ethers.hexlify(ethers.randomBytes(32)),
        name: 'Document Summarizer',
        platform: 'minimax',
        description: 'Generate concise summaries of long documents while preserving key information and context.',
        payment_address: '0x2E3F4A5B6C7D8E9F0A1B123456789ABCDEF12345',
        total_tips: ethers.parseEther('1876.75').toString(),
        platform_likes: 75,
        stars: 75,
        category: 'NLP',
        creator: '0x2E3F4A5B6C7D8E9F0A1B123456789ABCDEF12345',
        createdAt: new Date('2026-02-24').toISOString(),
      },

      // Image Analysis (Manus - vision focus)
      {
        id: 25,
        skill_id: ethers.hexlify(ethers.randomBytes(32)),
        name: 'Image Content Analyzer',
        platform: 'manus',
        description: 'Analyze image content with object detection, scene understanding, and text recognition (OCR).',
        payment_address: '0x3F4A5B6C7D8E9F0A1B2C123456789ABCDEF23456',
        total_tips: ethers.parseEther('2234.0').toString(),
        platform_likes: 89,
        stars: 79,
        category: 'Image Processing',
        creator: '0x3F4A5B6C7D8E9F0A1B2C123456789ABCDEF23456',
        createdAt: new Date('2026-02-25').toISOString(),
      },
    ];

    // Enrich skills with repository info for npx skills install
    const enrichedSkills = mockSkills.map(skill => ({
      ...skill,
      // Generate repository URLs for skills that don't have them
      repository: skill.repository || `https://github.com/myskills-protocol/${skill.name.toLowerCase().replace(/\s+/g, '-')}`,
      npm_package: skill.npm_package || `@myskills/${skill.name.toLowerCase().replace(/\s+/g, '-')}`,
      homepage: skill.homepage || `https://skills.sh/myskills-protocol/${skill.name.toLowerCase().replace(/\s+/g, '-')}`,
      download_count: skill.download_count || Math.floor(Math.random() * 5000) + 100,
    }));

    let filtered = [...enrichedSkills];

    // Filter by platform
    if (options.platform && options.platform !== 'all') {
      filtered = filtered.filter((s) => s.platform === options.platform);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (options.sort) {
        case 'stars':
        case 'likes':
          return (b.platform_likes || 0) - (a.platform_likes || 0);
        case 'newest':
        case 'latest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'name':
          return a.name.localeCompare(b.name);
        case 'tips':
        default:
          return parseFloat(b.total_tips) - parseFloat(a.total_tips);
      }
    });

    const limit = options.limit || 50;
    return filtered.slice(0, limit);
  } catch (error) {
    console.error('Error fetching skills:', error);
    throw error;
  }
}

// ============ BOUNTY RELATED FUNCTIONS ============

/**
 * Get all bounties from the BountyHub contract
 *
 * NOTE: The deployed contract doesn't have getAllBounties() function.
 * We query BountyCreated events to get bounty IDs, then fetch each bounty.
 * This is less efficient but works with the current contract.
 * In production, consider adding getAllBounties() to the contract or using The Graph.
 */
export async function getBounties(options: {
  status?: 'all' | 'open' | 'in-progress' | 'completed';
  category?: string;
  sortBy?: 'newest' | 'reward' | 'deadline';
  limit?: number;
} = {}) {
  try {
    const bountyHub = getBountyHubContract();
    const provider = getProvider();

    // Query BountyCreated events to get all bounty IDs
    // Get recent blocks (last 10000 blocks ~ 2-3 hours on Monad)
    const latestBlock = await provider.getBlockNumber();
    const fromBlock = Math.max(0, latestBlock - 10000);

    const bountyCreatedEvents = await bountyHub.queryFilter(
      bountyHub.filters.BountyCreated(),
      fromBlock,
      latestBlock
    );

    // Extract unique bounty IDs from events
    const bountyIds = new Set<number>();
    for (const event of bountyCreatedEvents) {
      if (event.args?.bountyId) {
        bountyIds.add(Number(event.args.bountyId));
      }
    }

    // Fetch each bounty details
    const bounties = await Promise.all(
      Array.from(bountyIds).map(async (id) => {
        try {
          const bounty = await bountyHub.getBounty(id);
          return {
            id: id.toString(),
            title: bounty.title,
            description: bounty.description,
            reward: parseFloat(ethers.formatEther(bounty.reward)),
            category: bounty.category,
            creator: bounty.creator,
            status: getStatusString(bounty.status),
            assignee: bounty.claimer || undefined,
            claimedAt: bounty.claimedAt ? new Date(Number(bounty.claimedAt) * 1000).toISOString() : undefined,
            completedAt: bounty.completedAt ? new Date(Number(bounty.completedAt) * 1000).toISOString() : undefined,
            deadline: bounty.deadline ? new Date(Number(bounty.deadline) * 1000).toISOString() : undefined,
          };
        } catch (error) {
          console.error(`Error fetching bounty ${id}:`, error);
          return null;
        }
      })
    );

    // Filter out nulls and sort
    let filtered = bounties.filter((b): b is NonNullable<typeof b> => b !== null);

    // Filter by status
    if (options.status && options.status !== 'all') {
      filtered = filtered.filter((b) => b.status === options.status);
    }

    // Filter by category
    if (options.category) {
      filtered = filtered.filter((b) => b.category === options.category);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (options.sortBy) {
        case 'reward':
          return b.reward - a.reward;
        case 'deadline':
          return (new Date(a.deadline || 0).getTime() || 0) - (new Date(b.deadline || 0).getTime() || 0);
        case 'newest':
        default:
          // Sort by ID (higher ID = newer)
          return parseInt(b.id) - parseInt(a.id);
      }
    });

    const limit = options.limit || 50;
    return filtered.slice(0, limit);
  } catch (error) {
    console.error('Error fetching bounties from contract:', error);

    // If contract call fails, return empty array (not mock data)
    // This ensures we're not showing fake data
    return [];
  }
}

/**
 * Convert contract status enum to API status string
 */
function getStatusString(status: number): 'open' | 'in-progress' | 'completed' | 'cancelled' | 'disputed' {
  // BountyStatus enum: Active=0, Claimed=1, UnderReview=2, Completed=3, Disputed=4, Cancelled=5
  switch (status) {
    case 0: return 'open';
    case 1: return 'in-progress';
    case 2: return 'in-progress';
    case 3: return 'completed';
    case 4: return 'disputed';
    case 5: return 'cancelled';
    default: return 'open';
  }
}

/**
 * Get a single bounty by ID
 */
export async function getBountyById(bountyId: string | number) {
  try {
    const bountyHub = getBountyHubContract();
    const id = typeof bountyId === 'string' ? BigInt(bountyId) : bountyId;

    const bounty = await bountyHub.getBounty(id);

    return {
      id: bountyId.toString(),
      title: bounty.title,
      description: bounty.description,
      reward: ethers.formatEther(bounty.reward),
      category: bounty.category,
      creator: bounty.creator,
      status: getStatusString(bounty.status),
      claimer: bounty.claimer || undefined,
      deadline: bounty.deadline ? new Date(Number(bounty.deadline) * 1000).toISOString() : undefined,
      claimedAt: bounty.claimedAt ? new Date(Number(bounty.claimedAt) * 1000).toISOString() : undefined,
      completedAt: bounty.completedAt ? new Date(Number(bounty.completedAt) * 1000).toISOString() : undefined,
    };
  } catch (error) {
    console.error(`Error fetching bounty ${bountyId}:`, error);
    throw error;
  }
}

/**
 * Create a new bounty (requires signer with gas)
 * This should be called from the frontend with the user's wallet
 */
export async function createBounty(
  signer: ethers.Signer,
  params: {
    title: string;
    description: string;
    reward: string; // Amount in ASKL tokens (e.g., "100")
    category: string;
    deadline?: number; // Unix timestamp
  }
) {
  try {
    const { bountyHub } = getContractsWithSigner(signer);

    const rewardAmount = ethers.parseEther(params.reward);
    const deadline = params.deadline || Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60; // 7 days from now

    const tx = await bountyHub.createBounty(
      params.title,
      params.description,
      rewardAmount,
      params.category,
      deadline
    );
    const receipt = await tx.wait();

    // Extract bounty ID from event logs
    const bountyCreatedEvent = receipt?.logs?.find((log: any) => {
      try {
        const parsed = bountyHub.interface.parseLog(log);
        return parsed?.name === 'BountyCreated';
      } catch {
        return false;
      }
    });

    let bountyId: string | undefined;
    if (bountyCreatedEvent) {
      const parsed = bountyHub.interface.parseLog(bountyCreatedEvent);
      bountyId = parsed?.args?.bountyId?.toString();
    }

    return {
      success: true,
      transactionHash: receipt?.hash,
      bountyId,
      blockNumber: receipt?.blockNumber,
      gasUsed: receipt?.gasUsed?.toString(),
    };
  } catch (error) {
    console.error('Error creating bounty:', error);
    throw error;
  }
}

/**
 * Submit work for a bounty (requires signer with gas)
 */
export async function submitWork(
  signer: ethers.Signer,
  params: {
    bountyId: string | number;
    proof: string;
  }
) {
  try {
    const { bountyHub } = getContractsWithSigner(signer);
    const id = typeof params.bountyId === 'string' ? BigInt(params.bountyId) : params.bountyId;

    const tx = await bountyHub.submitWork(id, params.proof);
    const receipt = await tx.wait();

    return {
      success: true,
      transactionHash: receipt?.hash,
      blockNumber: receipt?.blockNumber,
      gasUsed: receipt?.gasUsed?.toString(),
    };
  } catch (error) {
    console.error('Error submitting work:', error);
    throw error;
  }
}

/**
 * Tip a skill creator (requires signer with gas)
 */
export async function tipSkill(
  signer: ethers.Signer,
  params: {
    skillId: string; // bytes32 as hex string
    amount: string; // Amount in ASKL tokens
  }
) {
  try {
    const { asklToken } = getContractsWithSigner(signer);

    const amountParsed = ethers.parseEther(params.amount);
    const skillIdBytes32 = ethers.getBytes(params.skillId);

    const tx = await asklToken.tipSkill(skillIdBytes32, amountParsed);
    const receipt = await tx.wait();

    return {
      success: true,
      transactionHash: receipt?.hash,
      blockNumber: receipt?.blockNumber,
      gasUsed: receipt?.gasUsed?.toString(),
    };
  } catch (error) {
    console.error('Error tipping skill:', error);
    throw error;
  }
}
