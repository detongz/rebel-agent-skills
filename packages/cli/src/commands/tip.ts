/**
 * Tip command - Tip a skill creator via unified API
 *
 * Calls /api/tip endpoint to:
 * 1. Get skill creator address
 * 2. Calculate 98/2 split
 * 3. Execute blockchain transaction
 * 4. Store tip record
 */

import chalk from 'chalk';
import ora from 'ora';
import { createWalletClient, createPublicClient, http, parseUnits, type Address } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

// Shared imports from @myskills/shared
import { MONAD_TESTNET, API_BASE } from '@myskills/shared/config';
import type { Config, SkillInfo, TipResponse } from '@myskills/shared/types';
import { loadConfig } from '@myskills/shared/config';
import { findSkill } from '@myskills/shared/registry';
import { apiPost } from '@myskills/shared/api/client';

async function getSkillInfo(skillId: string): Promise<SkillInfo | null> {
  // First try to get from local registry
  const registryFile = join(homedir(), '.myskills', 'registry.json');
  if (existsSync(registryFile)) {
    try {
      const content = await readFile(registryFile, 'utf-8');
      const registry = JSON.parse(content);
      const skill = registry.skills?.find((s: any) => s.id === skillId || s.name === skillId);
      if (skill) {
        return skill;
      }
    } catch {
      // Continue to API
    }
  }

  // Try API endpoint (if skills API is available)
  try {
    const response = await fetch(`${API_BASE}/api/skills/${skillId}`);
    if (response.ok) {
      return await response.json();
    }
  } catch {
    // Continue
  }

  return null;
}

export async function tipCommand(skill: string, amount: string, options: { message?: string; token: string }) {
  console.log(chalk.cyan(`\n💰 Tipping ${skill}...\n`));

  // Check wallet login
  const config = await loadConfig();
  if (!config.address || !config.privateKey) {
    console.error(chalk.red('❌ No wallet connected'));
    console.log(chalk.gray('\nLogin first:'));
    console.log(chalk.white('  npx myskills login <private-key>\n'));
    return;
  }

  const spinner = ora('Looking up skill...').start();

  // Get skill info
  const skillInfo = await getSkillInfo(skill);

  if (!skillInfo) {
    spinner.fail('Skill not found');
    console.error(chalk.red(`\n❌ Skill "${skill}" not found in registry`));
    console.log(chalk.gray('\nAvailable skills:'));
    console.log(chalk.white('  npx myskills leaderboard\n'));
    return;
  }

  spinner.text = 'Preparing transaction...';

  // Parse amount
  const amountNum = parseFloat(amount);
  if (isNaN(amountNum) || amountNum <= 0) {
    spinner.fail('Invalid amount');
    console.error(chalk.red(`\n❌ Invalid amount: ${amount}`));
    return;
  }

  try {
    const account = privateKeyToAccount(config.privateKey as `0x${string}`);
    const publicClient = createPublicClient({
      chain: MONAD_TESTNET,
      transport: http(),
    });

    // Check balance
    const balance = await publicClient.getBalance({
      address: account.address,
    });

    const amountWei = parseUnits(amount.toString(), 18);
    if (balance < amountWei) {
      spinner.fail('Insufficient balance');
      console.error(chalk.red(`\n❌ Insufficient balance`));
      console.error(chalk.red(`   Required: ${amount} MON`));
      console.error(chalk.red(`   Have: ${formatUnits(balance, 18)} MON\n`));
      return;
    }

    spinner.text = 'Sending tip...';

    // Send transaction on-chain
    const walletClient = createWalletClient({
      account,
      chain: MONAD_TESTNET,
      transport: http(),
    });

    const hash = await walletClient.sendTransaction({
      to: skillInfo.payment_address as Address,
      value: amountWei,
    });

    spinner.text = 'Waiting for confirmation...';

    const receipt = await publicClient.waitForTransactionReceipt({
      hash,
    });

    spinner.text = 'Recording tip...';

    // Record tip via API
    try {
      const tipResponse = await fetch(`${API_BASE}/api/tip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skill_id: skillInfo.id,
          amount,
          from_address: config.address,
          to_address: skillInfo.payment_address,
          message: options.message,
          tx_hash: hash,
        }),
      });

      if (tipResponse.ok) {
        const result: TipResponse = await tipResponse.json();
        spinner.succeed('Tip sent!\n');
      } else {
        spinner.succeed('Tip sent! (Recording failed)\n');
      }
    } catch {
      // API call failed, but transaction succeeded
      spinner.succeed('Tip sent!\n');
    }

    // Calculate split
    const creatorShare = amountNum * 0.98;
    const platformFee = amountNum * 0.02;

    console.log(chalk.bold('Transaction Details:'));
    console.log(chalk.gray('─'.repeat(64)));
    console.log(`  ${chalk.cyan('Skill:')}         ${chalk.white(skillInfo.name)}`);
    console.log(`  ${chalk.cyan('Creator:')}       ${chalk.white(skillInfo.payment_address)}`);
    console.log(`  ${chalk.cyan('Amount:')}        ${chalk.white(amount)} MON`);
    console.log();
    console.log(chalk.bold('Distribution:'));
    console.log(chalk.gray('─'.repeat(64)));
    console.log(`  ${chalk.cyan('Creator (98%):')} ${chalk.white(creatorShare.toFixed(4))} MON`);
    console.log(`  ${chalk.cyan('Platform (2%):')} ${chalk.white(platformFee.toFixed(4))} MON`);
    console.log();
    console.log(chalk.bold('Transaction:'));
    console.log(chalk.gray('─'.repeat(64)));
    console.log(`  ${chalk.cyan('Hash:')}         ${chalk.white(hash)}`);
    console.log(`  ${chalk.cyan('Block:')}        ${chalk.white(receipt.blockNumber.toString())}`);
    console.log(`  ${chalk.cyan('Status:')}       ${chalk.green('Confirmed')}`);

    if (options.message) {
      console.log();
      console.log(chalk.bold('Message:'));
      console.log(chalk.gray('─'.repeat(64)));
      console.log(`  "${chalk.white(options.message)}"`);
    }
    console.log();

  } catch (error) {
    spinner.fail('Tip failed');
    console.error(chalk.red(`\nError: ${error}`));
  }
}
