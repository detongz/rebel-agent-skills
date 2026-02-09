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
      {
        id: ethers.hexlify(ethers.randomBytes(32)),
        name: 'Web Security Scanner',
        platform: 'claude-code',
        description: 'Automated security scanning for web applications. Detects XSS, SQL injection, CSRF vulnerabilities.',
        totalTips: '1250.5',
        totalStars: 42,
        creator: '0x1234567890abcdef1234567890abcdef12345678',
        createdAt: new Date('2026-02-01').toISOString(),
      },
      {
        id: ethers.hexlify(ethers.randomBytes(32)),
        name: 'Smart Contract Auditor',
        platform: 'coze',
        description: 'AI-powered smart contract vulnerability detection for Solidity contracts.',
        totalTips: '890.0',
        totalStars: 35,
        creator: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
        createdAt: new Date('2026-02-03').toISOString(),
      },
      {
        id: ethers.hexlify(ethers.randomBytes(32)),
        name: 'Test Generator',
        platform: 'manus',
        description: 'Generate comprehensive test suites from TypeScript/JavaScript code.',
        totalTips: '567.25',
        totalStars: 28,
        creator: '0x567890abcdef1234567890abcdef1234567890',
        createdAt: new Date('2026-02-05').toISOString(),
      },
      {
        id: ethers.hexlify(ethers.randomBytes(32)),
        name: 'Code Optimizer',
        platform: 'claude-code',
        description: 'Optimize JavaScript/TypeScript code for better performance and smaller bundle size.',
        totalTips: '445.0',
        totalStars: 23,
        creator: '0x9876543210987654321098765432109876543210',
        createdAt: new Date('2026-02-06').toISOString(),
      },
      {
        id: ethers.hexlify(ethers.randomBytes(32)),
        name: 'Documentation Writer',
        platform: 'minibmp',
        description: 'Auto-generate API documentation from JSDoc comments and TypeScript types.',
        totalTips: '334.5',
        totalStars: 19,
        creator: '0xfedcba9876543210fedcba9876543210fedcba98',
        createdAt: new Date('2026-02-07').toISOString(),
      },
    ];

    let filtered = [...mockSkills];

    // Filter by platform
    if (options.platform && options.platform !== 'all') {
      filtered = filtered.filter((s) => s.platform === options.platform);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (options.sort) {
        case 'stars':
          return b.totalStars - a.totalStars;
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'name':
          return a.name.localeCompare(b.name);
        case 'tips':
        default:
          return parseFloat(b.totalTips) - parseFloat(a.totalTips);
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
