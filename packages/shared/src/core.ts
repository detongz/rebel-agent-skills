/**
 * MySkills Core - Shared functionality for MCP Server and OpenClaw Plugin
 *
 * This module contains the core business logic that can be used by:
 * - MCP Server (standalone process)
 * - OpenClaw Plugin (running in Gateway)
 * - CLI tools
 * - Frontend API routes
 *
 * All blockchain operations go through this shared layer.
 */

import { createPublicClient, createWalletClient, http, formatUnits, parseUnits, type Address } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

// ============================================================================
// Configuration
// ============================================================================

export const MONAD_TESTNET = {
  id: 10143,
  name: 'Monad Testnet',
  nativeCurrency: { name: 'Monad', symbol: 'MON', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://testnet-rpc.monad.xyz'] },
  },
  blockExplorers: {
    default: { name: 'MonadVision', url: 'https://testnet.monadvision.com' },
  },
  testnet: true,
} as const;

// Convenience URL for testnet faucet
export const MONAD_TESTNET_FAUCET = 'https://faucet.monad.xyz';

export const MONAD_MAINNET = {
  id: 143,
  name: 'Monad Mainnet',
  nativeCurrency: { name: 'Monad', symbol: 'MON', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.monad.xyz'] },
  },
  blockExplorers: {
    default: { name: 'MonadVision', url: 'https://monadvision.com' },
  },
} as const;

// Network selection via environment variable
export const NETWORK = process.env.MYSKILLS_NETWORK === 'mainnet'
  ? MONAD_MAINNET
  : MONAD_TESTNET;

// Contract addresses from environment or defaults
export const MY_SKILLS_CONTRACT = (process.env.MYSKILLS_CONTRACT_ADDRESS ||
  '0x0000000000000000000000000000000000000000') as `0x${string}`;

export const BOUNTY_HUB_CONTRACT = (process.env.BOUNTY_HUB_CONTRACT_ADDRESS ||
  '0x0000000000000000000000000000000000000000') as `0x${string}`;

// ============================================================================
// Contract ABIs
// ============================================================================

export const ASKL_TOKEN_ABI = [
  // Read functions
  "function skillCreators(bytes32 skillId) external view returns (address)",
  "function creatorEarnings(address creator) external view returns (uint256)",
  "function totalTipped() external view returns (uint256)",
  "function totalBurned() external view returns (uint256)",
  "function creatorRewardBps() external view returns (uint256)",
  "function getSkillCreator(bytes32 skillId) external view returns (address)",
  "function getCreatorEarnings(address creator) external view returns (uint256)",
  "function calculateTipAmount(uint256 amount) external view returns (uint256 creatorReward, uint256 platformFee)",
  "function getPlatformStats() external view returns (uint256 _totalSupply, uint256 _totalTipped, uint256 _totalBurned, uint256 _creatorRewardBps)",
  "function balanceOf(address account) external view returns (uint256)",
  "function totalSupply() external view returns (uint256)",

  // Write functions
  "function registerSkill(bytes32 skillId, string skillName, address creator) external",
  "function registerSkillsBatch(bytes32[] skillIds, string[] skillNames, address[] creators) external",
  "function tipSkill(bytes32 skillId, uint256 amount) external",
  "function tipSkillsBatch(bytes32[] skillIds, uint256[] amounts) external",
  "function tipCreatorDirect(address creator, uint256 amount) external",
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function approve(address spender, uint256 amount) external returns (bool)",

  // Events
  "event SkillRegistered(bytes32 indexed skillId, address indexed creator, string skillName)",
  "event Tipped(bytes32 indexed skillId, address indexed tipper, address indexed creator, uint256 amount, uint256 creatorReward, uint256 platformFee)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
] as const;

// ============================================================================
// Client Creation
// ============================================================================

export function createPublicMonadClient() {
  return createPublicClient({
    chain: NETWORK,
    transport: http(),
  });
}

export function createWalletMonadClient(privateKey: string) {
  const account = privateKeyToAccount(privateKey as `0x${string}`);
  return createWalletClient({
    account,
    chain: NETWORK,
    transport: http(),
  });
}

// ============================================================================
// Tip Functionality (Core Agent-to-Agent Payment)
// ============================================================================

export interface TipResult {
  success: boolean;
  txHash?: string;
  blockNumber?: bigint;
  creatorReward?: string;
  platformFee?: string;
  error?: string;
}

/**
 * Send a tip from one agent to another on Monad blockchain
 *
 * This is the core agent-to-agent payment function.
 *
 * @param fromPrivateKey - Sender's private key
 * @param toSkillId - Skill ID (bytes32 hash) OR direct address
 * @param amount - Amount to tip (in whole tokens, will be converted to wei)
 * @param message - Optional message
 * @returns Transaction result
 */
export async function tipAgent(
  fromPrivateKey: string,
  toSkillId: string,
  amount: number,
  message?: string
): Promise<TipResult> {
  const publicClient = createPublicMonadClient();
  const walletClient = createWalletMonadClient(fromPrivateKey);

  try {
    // Check if skillId is an address (direct tip) or skill hash
    const isAddress = toSkillId.startsWith('0x') && toSkillId.length === 42;
    const skillIdBytes32 = isAddress
      ? '0x0000000000000000000000000000000000000000000000000000000000000000' as `0x${string}`
      : (toSkillId.startsWith('0x') ? toSkillId : `0x${toSkillId}`) as `0x${string}`;

    const recipientAddress = isAddress
      ? toSkillId as Address
      : await publicClient.readContract({
          address: MY_SKILLS_CONTRACT,
          abi: ASKL_TOKEN_ABI,
          functionName: 'getSkillCreator',
          args: [skillIdBytes32],
        }) as Address;

    if (recipientAddress === '0x0000000000000000000000000000000000000000') {
      return {
        success: false,
        error: `Skill ${toSkillId} not found. Please check the skill ID.`,
      };
    }

    // Convert amount to wei (18 decimals)
    const amountInWei = parseUnits(amount.toString(), 18);

    // Check sender balance
    const balance = await publicClient.readContract({
      address: MY_SKILLS_CONTRACT,
      abi: ASKL_TOKEN_ABI,
      functionName: 'balanceOf',
      args: [walletClient.account.address],
    }) as bigint;

    if (balance < amountInWei) {
      return {
        success: false,
        error: `Insufficient ASKL balance. Have ${formatUnits(balance, 18)} ASKL, need ${amount} ASKL.`,
      };
    }

    // Simulate transaction first
    const { request } = await publicClient.simulateContract({
      address: MY_SKILLS_CONTRACT,
      abi: ASKL_TOKEN_ABI,
      functionName: 'tipSkill',
      args: [skillIdBytes32, amountInWei],
      account: walletClient.account,
    });

    // Execute transaction
    const hash = await walletClient.writeContract(request);

    // Wait for confirmation
    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    // Calculate split
    const creatorRewardBps = await publicClient.readContract({
      address: MY_SKILLS_CONTRACT,
      abi: ASKL_TOKEN_ABI,
      functionName: 'creatorRewardBps',
    }) as bigint;

    const creatorReward = (amountInWei * BigInt(Number(creatorRewardBps))) / 10000n;
    const platformFee = amountInWei - creatorReward;

    return {
      success: true,
      txHash: hash,
      blockNumber: receipt.blockNumber,
      creatorReward: formatUnits(creatorReward, 18),
      platformFee: formatUnits(platformFee, 18),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// ============================================================================
// Query Functions
// ============================================================================

export interface BalanceInfo {
  mon: string;
  askl: string;
}

export async function getBalances(address: Address): Promise<BalanceInfo> {
  const publicClient = createPublicMonadClient();

  const monBalance = await publicClient.getBalance({ address });

  let asklBalance = 0n;
  try {
    asklBalance = await publicClient.readContract({
      address: MY_SKILLS_CONTRACT,
      abi: ASKL_TOKEN_ABI,
      functionName: 'balanceOf',
      args: [address],
    }) as bigint;
  } catch {
    // Contract might not be deployed
  }

  return {
    mon: formatUnits(monBalance, 18),
    askl: formatUnits(asklBalance, 18),
  };
}

export interface SkillInfo {
  id: string;
  creator: Address;
  totalTips: string;
  tipCount: number;
}

export async function getSkillInfo(skillId: string): Promise<SkillInfo | null> {
  const publicClient = createPublicMonadClient();

  try {
    const skillIdBytes32 = skillId.startsWith('0x')
      ? skillId as `0x${string}`
      : `0x${skillId}` as `0x${string}`;

    const creator = await publicClient.readContract({
      address: MY_SKILLS_CONTRACT,
      abi: ASKL_TOKEN_ABI,
      functionName: 'getSkillCreator',
      args: [skillIdBytes32],
    }) as Address;

    if (creator === '0x0000000000000000000000000000000000000000') {
      return null;
    }

    const earnings = await publicClient.readContract({
      address: MY_SKILLS_CONTRACT,
      abi: ASKL_TOKEN_ABI,
      functionName: 'getCreatorEarnings',
      args: [creator],
    }) as bigint;

    return {
      id: skillId,
      creator,
      totalTips: formatUnits(earnings, 18),
      tipCount: 0, // Would need event logs to count
    };
  } catch {
    return null;
  }
}
