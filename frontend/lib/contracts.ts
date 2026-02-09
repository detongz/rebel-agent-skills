/**
 * Smart Contract Integration
 * Connects frontend to deployed contracts on Monad Testnet
 */

import { ethers } from 'ethers';

// Monad Testnet RPC
const RPC_URL = 'https://testnet-rpc.monad.xyz';

// Contract addresses (deployed on Monad Testnet)
export const CONTRACT_ADDRESSES = {
  ASKL_TOKEN: '0xc1fFCAD15e2f181E49bFf2cBea79094eC9B5033A',
  BOUNTY_HUB: '0x2679Bb99E7Cc239787a74BF6c77c2278311c77a1',
} as const;

// ASKL Token ABI (minimal - what we need)
export const ASKL_TOKEN_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address) view returns (uint256)',
  'function tipSkill(bytes32 skillId, uint256 amount) external',
  'function skillCreators(bytes32) view returns (address)',
  'event Tipped(bytes32 indexed skillId, address indexed tipper, address indexed creator, uint256 amount)',
] as const;

// BountyHub ABI
export const BOUNTY_HUB_ABI = [
  'function createBounty(uint256 reward, bytes32 skillId, string calldata title) external',
  'function submitWork(uint256 bountyId, string calldata proof) external',
  'function claimBounty(uint256 bountyId) external',
  'function disputeBounty(uint256 bountyId) external',
  'function resolveDispute(uint256 bountyId, bool inFavorOfCreator) external',
  'function getBounty(uint256 bountyId) external view returns (tuple(address creator, bytes32 skillId, string title, uint256 reward, address assignee, string workProof, uint256 createdAt, bool disputed, bool resolved))',
  'function getAllBounties() external view returns (tuple(uint256 id, address creator, bytes32 skillId, string title, uint256 reward, address assignee, string workProof, uint256 createdAt, bool disputed, bool resolved)[])',
  'event BountyCreated(uint256 indexed bountyId, address indexed creator, bytes32 skillId, uint256 reward)',
  'event WorkSubmitted(uint256 indexed bountyId, address indexed submitter, string proof)',
  'event BountyClaimed(uint256 indexed bountyId, address indexed claimer, uint256 reward)',
  'event BountyDisputed(uint256 indexed bountyId)',
  'event DisputeResolved(uint256 indexed bountyId, bool inFavorOfCreator)',
] as const;

/**
 * Get a provider instance
 */
export function getProvider(): ethers.JsonRpcProvider {
  return new ethers.JsonRpcProvider(RPC_URL);
}

/**
 * Get a read-only contract instance
 */
export function getASKLContract() {
  const provider = getProvider();
  return new ethers.Contract(CONTRACT_ADDRESSES.ASKL_TOKEN, ASKL_TOKEN_ABI, provider);
}

/**
 * Get a read-only BountyHub contract instance
 */
export function getBountyHubContract() {
  const provider = getProvider();
  return new ethers.Contract(CONTRACT_ADDRESSES.BOUNTY_HUB, BOUNTY_HUB_ABI, provider);
}

/**
 * Get a contract instance with signer (for write operations)
 * Note: This requires a wallet signer from the frontend
 */
export function getContractWithSigner(signer: ethers.Signer) {
  const asklToken = new ethers.Contract(CONTRACT_ADDRESSES.ASKL_TOKEN, ASKL_TOKEN_ABI, signer);
  const bountyHub = new ethers.Contract(CONTRACT_ADDRESSES.BOUNTY_HUB, BOUNTY_HUB_ABI, signer);
  return { asklToken, bountyHub };
}
