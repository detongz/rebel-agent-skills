/**
 * Network configuration for Monad blockchain
 *
 * Exports network constants used across MySkills Protocol
 */

import type { NetworkConfig } from '../types/config.js';

// ============================================================================
// Monad Network Configurations
// ============================================================================

/**
 * Monad Testnet configuration
 * Chain ID: 10143
 * RPC: https://testnet-rpc.monad.xyz
 * Explorer: https://testnet.monadvision.com
 */
export const MONAD_TESTNET: NetworkConfig = {
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

/**
 * Monad Mainnet configuration
 * Chain ID: 143
 * RPC: https://rpc.monad.xyz
 * Explorer: https://monadvision.com
 */
export const MONAD_MAINNET: NetworkConfig = {
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

/**
 * Convenience URL for testnet faucet
 */
export const MONAD_TESTNET_FAUCET = 'https://faucet.monad.xyz';

// ============================================================================
// Network Selection
// ============================================================================

/**
 * Current network based on environment variable
 * Defaults to testnet unless MYSKILLS_NETWORK=mainnet is set
 */
export const NETWORK = process.env.MYSKILLS_NETWORK === 'mainnet'
  ? MONAD_MAINNET
  : MONAD_TESTNET;

/**
 * Check if currently on mainnet
 */
export function isMainnet(): boolean {
  return NETWORK.id === MONAD_MAINNET.id;
}

/**
 * Check if currently on testnet
 */
export function isTestnet(): boolean {
  return NETWORK.id === MONAD_TESTNET.id;
}
