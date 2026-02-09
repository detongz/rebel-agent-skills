// lib/wagmi.ts - Web3 配置
import { getDefaultConfig } from '@rainbow-me/rainbowkit';

// Monad Testnet 配置 - x402 uses chain ID 10143
const monadTestnet = {
  id: 10143,
  name: 'Monad Testnet',
  network: 'monad testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Monad',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://testnet-rpc.monad.xyz'],
    },
    public: {
      http: ['https://testnet-rpc.monad.xyz'],
    },
  },
  blockExplorers: {
    default: { name: 'Monad Explorer', url: 'https://testnet-explorer.monad.xyz' },
  },
  testnet: true,
};

// RainbowKit 配置 - 使用 demo projectId（RainbowKit 提供的默认值）
export const config = getDefaultConfig({
  appName: 'Agent Reward Hub',
  projectId: 'YOUR_WALLET_CONNECT_PROJECT_ID', // 使用占位符，RainbowKit 仍可使用内置连接器
  chains: [monadTestnet],
  ssr: true,
});

// 智能合约地址（已部署到 Monad Testnet）
export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_ASKL_TOKEN_ADDRESS || '0xc1fFCAD15e2f181E49bFf2cBea79094eC9B5033A';

// BountyHub 合约地址
export const BOUNTY_HUB_ADDRESS = process.env.NEXT_PUBLIC_BOUNTY_HUB_ADDRESS || '0x2679Bb99E7Cc239787a74BF6c77c2278311c77a1';

// 智能合约 ABI（部分）
export const CONTRACT_ABI = [
  // 读取函数
  {
    inputs: [{ internalType: 'bytes32', name: 'skillId', type: 'bytes32' }],
    name: 'getSkillCreator',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'creator', type: 'address' }],
    name: 'getCreatorEarnings',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalSupply',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  // 写入函数
  {
    inputs: [
      { internalType: 'bytes32', name: 'skillId', type: 'bytes32' },
      { internalType: 'string', name: 'skillName', type: 'string' },
      { internalType: 'address', name: 'creator', type: 'address' },
    ],
    name: 'registerSkill',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'skillId', type: 'bytes32' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'tipSkill',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  // 事件
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'bytes32', name: 'skillId', type: 'bytes32' },
      { indexed: true, internalType: 'address', name: 'creator', type: 'address' },
      { indexed: false, internalType: 'string', name: 'skillName', type: 'string' },
    ],
    name: 'SkillRegistered',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'bytes32', name: 'skillId', type: 'bytes32' },
      { indexed: true, internalType: 'address', name: 'tipper', type: 'address' },
      { indexed: true, internalType: 'address', name: 'creator', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'Tipped',
    type: 'event',
  },
];
