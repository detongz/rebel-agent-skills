/**
 * Contract configuration for MySkills Protocol
 *
 * Exports contract ABIs and addresses used across MySkills Protocol
 */

import type { ContractAddresses } from '../types/config.js';

// ============================================================================
// Contract Addresses
// ============================================================================

/**
 * MySkills ASKL Token contract address
 * Defaults to zero address - set via MYSKILLS_CONTRACT_ADDRESS env var
 */
export const MY_SKILLS_CONTRACT = (process.env.MYSKILLS_CONTRACT_ADDRESS ||
  '0x0000000000000000000000000000000000000000000') as `0x${string}`;

/**
 * Bounty Hub contract address
 * Defaults to zero address - set via BOUNTY_HUB_CONTRACT_ADDRESS env var
 */
export const BOUNTY_HUB_CONTRACT = (process.env.BOUNTY_HUB_CONTRACT_ADDRESS ||
  '0x0000000000000000000000000000000000000000000') as `0x${string}`;

/**
 * All contract addresses
 */
export const CONTRACT_ADDRESSES: ContractAddresses = {
  mySkillsContract: MY_SKILLS_CONTRACT,
  bountyHubContract: BOUNTY_HUB_CONTRACT,
};

// ============================================================================
// Contract ABIs
// ============================================================================

/**
 * ASKL Token ABI - MySkills protocol token contract
 *
 * Functions:
 * - read: skillCreators, creatorEarnings, totalTipped, etc.
 * - write: registerSkill, tipSkill, transfer, etc.
 */
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
  "event Transfer(address indexed from, address indexed to, address indexed value)",
] as const;

/**
 * Minimal ABI for skill registry operations
 */
export const REGISTRY_ABI = [
  {
    inputs: [
      { internalType: 'bytes32', name: 'skillId', type: 'bytes32' },
      { internalType: 'string', name: 'skillName', type: 'string' },
      { internalType: 'address', name: 'creator', type: 'address' }
    ],
    name: 'registerSkill',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'bytes32', name: 'skillId', type: 'bytes32' }],
    name: 'getSkillCreator',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const;
