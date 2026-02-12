// lib/wagmi.ts - Web3 配置 (Monad Wallet Only)
import { getDefaultConfig } from '@rainbow-me/rainbowkit';

// Monad Testnet 配置
const monadTestnet = {
  id: 10143,
  name: 'Monad Testnet',
  network: 'monad testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'MONAD',
    symbol: 'MONAD',
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
  projectId: 'YOUR_WALLET_CONNECT_PROJECT_ID',
  chains: [monadTestnet],
  ssr: true,
});

// Wallet configuration only - no contracts exposed
export const MONAD_SYMBOL = 'MONAD';
