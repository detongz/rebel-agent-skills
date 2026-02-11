/**
 * Auth commands - Wallet connection and management
 *
 * Supports Monad testnet (Chain ID: 10143)
 * Private key stored securely in ~/.myskills/config.json
 */

import chalk from 'chalk';
import ora from 'ora';
import { createWalletClient, createPublicClient, http, formatUnits } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

// Shared imports from @myskills/shared
import { MONAD_TESTNET } from '@myskills/shared/config';
import type { Config, BalanceInfo } from '@myskills/shared/types';
import { loadConfig, saveConfig } from '@myskills/shared/config';

export async function loginCommand(privateKeyInput?: string): Promise<void> {
  console.log(chalk.cyan('\n🔐 Connecting to Monad Testnet...\n'));

  let privateKey: string;

  if (privateKeyInput) {
    privateKey = privateKeyInput.startsWith('0x') ? privateKeyInput : `0x${privateKeyInput}`;
  } else {
    // Prompt for private key (in real implementation, use readline)
    console.log(chalk.yellow('Usage: npx myskills login <private-key>'));
    console.log(chalk.gray('Or set MY_SKILLS_PRIVATE_KEY environment variable\n'));
    const envKey = process.env.MY_SKILLS_PRIVATE_KEY;
    if (!envKey) {
      console.error(chalk.red('❌ No private key provided'));
      process.exit(1);
    }
    privateKey = envKey.startsWith('0x') ? envKey : `0x${envKey}`;
  }

  const spinner = ora('Validating wallet...').start();

  try {
    const account = privateKeyToAccount(privateKey as `0x${string}`);
    const walletClient = createWalletClient({
      account,
      chain: MONAD_TESTNET,
      transport: http(),
    });

    const publicClient = createPublicClient({
      chain: MONAD_TESTNET,
      transport: http(),
    });

    // Verify wallet works by getting balance
    const balance = await publicClient.getBalance({
      address: account.address,
    });

    spinner.succeed('Wallet connected!\n');

    // Save config
    await saveConfig({
      privateKey,
      address: account.address,
    });

    console.log(chalk.bold('Wallet Info:'));
    console.log(chalk.gray('─'.repeat(64)));
    console.log(`  ${chalk.cyan('Address:')}   ${chalk.white(account.address)}`);
    console.log(`  ${chalk.cyan('Balance:')}   ${chalk.white(formatUnits(balance, 18))} MON`);
    console.log();

  } catch (error) {
    spinner.fail('Connection failed');
    console.error(chalk.red(`Error: ${error}`));
    process.exit(1);
  }
}

export async function whoamiCommand(): Promise<void> {
  const config = await loadConfig();

  if (!config.address || !config.privateKey) {
    console.log(chalk.yellow('\n⚠️  No wallet connected'));
    console.log(chalk.gray('Run: npx myskills login <private-key>\n'));
    return;
  }

  const spinner = ora('Fetching account info...').start();

  try {
    const account = privateKeyToAccount(config.privateKey as `0x${string}`);
    const publicClient = createPublicClient({
      chain: MONAD_TESTNET,
      transport: http(),
    });

    // Get balances
    const monBalance = await publicClient.getBalance({
      address: account.address,
    });

    // TODO: Get ASKL token balance when contract is deployed
    const asklBalance = 0n;

    spinner.succeed('Account info loaded\n');

    console.log(chalk.bold('Current Account:'));
    console.log(chalk.gray('─'.repeat(64)));
    console.log(`  ${chalk.cyan('Address:')}   ${chalk.white(account.address)}`);
    console.log(`  ${chalk.cyan('Network:')}   ${chalk.white('Monad Testnet')} (Chain ID: ${MONAD_TESTNET.id})`);
    console.log();
    console.log(chalk.bold('Balances:'));
    console.log(chalk.gray('─'.repeat(64)));
    console.log(`  ${chalk.cyan('MON:')}       ${chalk.white(formatUnits(monBalance, 18))} MON`);
    console.log(`  ${chalk.cyan('ASKL:')}      ${chalk.white('0')} ASKL ${chalk.gray('(Token not deployed)')}`);
    console.log();

  } catch (error) {
    spinner.fail('Failed to fetch account info');
    console.error(chalk.red(`Error: ${error}`));
    process.exit(1);
  }
}
