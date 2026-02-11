/**
 * Publish command - Publish a skill to MySkills platform
 *
 * Flow:
 * 1. Verify wallet login (REQUIRED)
 * 2. Run basic security scan (free)
 * 3. Check payment requirement
 * 4. Run deep scan (after payment)
 * 5. Register on-chain
 * 6. Return skill ID
 *
 * Usage:
 *   npx myskills publish https://github.com/user/repo
 *   npx myskills publish https://github.com/user/repo --name "My Skill"
 *   npx myskills publish https://github.com/user/repo --category productivity
 *   npx myskills publish https://github.com/user/repo --plan subscription
 */

import chalk from 'chalk';
import ora from 'ora';
import { createWalletClient, createPublicClient, http, type Address, keccak256, toHex, stringToHex } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

// Monad testnet configuration
const MONAD_TESTNET = {
  id: 10143,
  name: 'Monad Testnet',
  rpcUrls: {
    default: { http: ['https://testnet-rpc.monad.xyz'] },
  },
  nativeCurrency: {
    name: 'Monad',
    symbol: 'MON',
    decimals: 18,
  },
} as const;

const CONFIG_DIR = join(homedir(), '.myskills');
const CONFIG_FILE = join(CONFIG_DIR, 'config.json');
const CONTRACT_ADDRESS = process.env.ASKL_TOKEN_ADDRESS || '0xc1fFCAD15e2f181E49bFf2cBea79094eC9B5033A' as const;

const API_BASE = process.env.MYSKILLS_API_BASE || 'http://localhost:3000';

// ABI for registerSkill function
const REGISTRY_ABI = [
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

interface Config {
  privateKey?: string;
  address?: string;
}

interface PublishOptions {
  name?: string;
  category?: string;
  plan?: 'single' | 'subscription';
}

interface ScanResult {
  success: boolean;
  data: {
    score: number;
    status: 'safe' | 'warning' | 'danger';
    vulnerabilities: number;
    warnings: string[];
  };
}

interface PrepareResponse {
  payment_required: boolean;
  amount: string;
  currency: string;
  network: string;
  x402_facilitator: string;
  subscription_active?: boolean;
}

async function loadConfig(): Promise<Config> {
  if (!existsSync(CONFIG_FILE)) {
    return {};
  }
  try {
    const content = await readFile(CONFIG_FILE, 'utf-8');
    return JSON.parse(content);
  } catch {
    return {};
  }
}

function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match) return null;
  return { owner: match[1], repo: match[2].replace('.git', '') };
}

function generateSkillId(name: string, repo: string): `0x${string}` {
  // skillId = keccak256(name + repo + version)
  const data = `${name}:${repo}:v1.0.0`;
  return keccak256(toHex(data));
}

export async function publishCommand(url: string, options: PublishOptions) {
  console.log(chalk.cyan('\n🚀 Publishing skill to MySkills...\n'));

  // ========================================
  // Step 1: Verify wallet login (REQUIRED)
  // ========================================
  const config = await loadConfig();
  if (!config.address || !config.privateKey) {
    console.error(chalk.red('❌ No wallet connected'));
    console.log(chalk.yellow('\n🔐 You must login to publish skills'));
    console.log(chalk.gray('\nLogin with:'));
    console.log(chalk.white('  npx myskills login <private-key>'));
    console.log(chalk.gray('\nOr set environment variable:'));
    console.log(chalk.white('  export MY_SKILLS_PRIVATE_KEY=0x...\n'));
    process.exit(1);
  }

  const account = privateKeyToAccount(config.privateKey as `0x${string}`);
  const walletClient = createWalletClient({
    account,
    chain: MONAD_TESTNET,
    transport: http(),
  });

  const publicClient = createPublicClient({
    chain: MONAD_TESTNET,
    transport: http(),
  });

  console.log(chalk.gray('Logged in as:'), chalk.white(account.address));

  // ========================================
  // Step 2: Validate GitHub URL
  // ========================================
  const spinner = ora('Validating repository...').start();
  const parsed = parseGitHubUrl(url);

  if (!parsed) {
    spinner.fail('Invalid URL');
    console.error(chalk.red(`\n❌ Invalid GitHub URL: ${url}`));
    console.log(chalk.gray('\nExpected format:'));
    console.log(chalk.white('  https://github.com/owner/repo\n'));
    process.exit(1);
  }

  const { owner, repo } = parsed;
  const repoFullName = `${owner}/${repo}`;
  spinner.text = `Validating ${repoFullName}...`;

  // Fetch metadata
  let metadata = { name: repo, description: '' };
  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
    if (response.ok) {
      const data = await response.json();
      metadata = {
        name: data.name || repo,
        description: data.description || ''
      };
    }
  } catch {
    // Use repo name as fallback
  }

  // Use provided name or metadata name
  const skillName = options.name || metadata.name;

  // ========================================
  // Step 3: Check if already registered
  // ========================================
  spinner.text = 'Checking if skill already exists...';

  const skillId = generateSkillId(skillName, repoFullName);

  try {
    const existingCreator = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: REGISTRY_ABI,
      functionName: 'getSkillCreator',
      args: [skillId]
    }) as Address;

    if (existingCreator !== '0x0000000000000000000000000000000000000000') {
      spinner.fail('Already registered');
      console.log(chalk.yellow(`\n⚠️  This skill is already registered on-chain!`));
      console.log(chalk.gray(`\nSkill ID: ${chalk.white(skillId)}`));
      console.log(chalk.gray(`Name: ${chalk.white(skillName)}`));
      console.log(chalk.gray(`Creator: ${chalk.white(existingCreator)}`));
      console.log(chalk.gray(`\nIf you are the creator, you can update via the platform.\n`));
      process.exit(1);
    }
  } catch {
    // Contract might not be deployed yet, continue
  }

  // ========================================
  // Step 4: Run basic security scan (free)
  // ========================================
  spinner.text = 'Running security scan...';

  try {
    const scanResponse = await fetch(`${API_BASE}/api/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, full: false })
    });

    if (scanResponse.ok) {
      const scanResult: ScanResult = await scanResponse.json();

      if (!scanResult.success || scanResult.data.score < 50) {
        spinner.fail('Security check failed');
        console.log(chalk.red(`\n❌ Security score too low: ${scanResult.data.score}/100`));
        console.log(chalk.yellow('\nPlease fix security issues before publishing.\n'));
        process.exit(1);
      }

      spinner.succeed(`Security scan passed: ${scanResult.data.score}/100`);
    }
  } catch {
    // Scan API might not be available, show warning but continue
    spinner.warn('Security scan unavailable, continuing...');
  }

  // ========================================
  // Step 5: Check payment requirement
  // ========================================
  const paymentSpinner = ora('Checking payment requirements...').start();

  try {
    const prepareResponse = await fetch(`${API_BASE}/api/publish/prepare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url,
        name: skillName,
        category: options.category || 'general',
        plan: options.plan || 'single',
        creator: account.address
      })
    });

    if (prepareResponse.ok) {
      const prepareData: PrepareResponse = await prepareResponse.json();

      if (prepareData.payment_required && !prepareData.subscription_active) {
        paymentSpinner.fail('Payment required');
        console.log(chalk.yellow('\n💳 Payment Required to Publish'));
        console.log(chalk.gray('─'.repeat(64)));
        console.log(`  ${chalk.cyan('Amount:')}      ${chalk.white(prepareData.amount)} ${prepareData.currency}`);
        console.log(`  ${chalk.cyan('Network:')}     ${prepareData.network}`);
        console.log(`  ${chalk.cyan('Facilitator:')} ${prepareData.x402_facilitator}`);
        console.log();
        console.log(chalk.yellow('To complete payment:'));
        console.log(chalk.white(`  1. Visit the facilitator URL`));
        console.log(chalk.white(`  2. Approve the payment`));
        console.log(chalk.white(`  3. Run: npx myskills publish ${url} --receipt <payment-proof>\n`));
        console.log(chalk.gray('Or subscribe for unlimited publishes:'));
        console.log(chalk.white(`  npx myskills subscribe\n`));
        process.exit(1);
      }

      if (prepareData.subscription_active) {
        paymentSpinner.succeed('Active subscription detected');
      }
    }
  } catch {
    paymentSpinner.warn('Payment check unavailable, continuing...');
  }

  // ========================================
  // Step 6: Register on-chain
  // ========================================
  const registerSpinner = ora('Registering on Monad Testnet...').start();

  try {
    // Check balance for gas
    const balance = await publicClient.getBalance({
      address: account.address
    });

    if (balance === 0n) {
      registerSpinner.fail('Insufficient balance');
      console.error(chalk.red('\n❌ No MON balance for gas fees'));
      console.log(chalk.yellow('\nGet testnet MON from:'));
      console.log(chalk.white('  https://faucet.monad.xyz\n'));
      process.exit(1);
    }

    // Estimate gas
    registerSpinner.text = 'Estimating gas...';

    try {
      const gasEstimate = await publicClient.estimateContractGas({
        address: CONTRACT_ADDRESS,
        abi: REGISTRY_ABI,
        functionName: 'registerSkill',
        args: [skillId, skillName, account.address],
        account
      });

      // Execute transaction
      registerSpinner.text = 'Sending transaction...';

      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESS,
        abi: REGISTRY_ABI,
        functionName: 'registerSkill',
        args: [skillId, skillName, account.address],
        gas: gasEstimate * 12n / 10n // 20% buffer
      });

      registerSpinner.text = 'Waiting for confirmation...';

      const receipt = await publicClient.waitForTransactionReceipt({
        hash
      });

      if (receipt.status !== 'success') {
        throw new Error('Transaction failed');
      }

      registerSpinner.succeed('Skill published on-chain!\n');

      // ========================================
      // Success Output
      // ========================================
      console.log(chalk.bold('🎉 Skill Successfully Published!'));
      console.log(chalk.gray('─'.repeat(64)));
      console.log(`  ${chalk.cyan('Skill ID:')}     ${chalk.white(skillId)}`);
      console.log(`  ${chalk.cyan('Name:')}        ${chalk.white(skillName)}`);
      console.log(`  ${chalk.cyan('Repository:')}  ${chalk.white(repoFullName)}`);
      console.log(`  ${chalk.cyan('Creator:')}     ${chalk.white(account.address)}`);
      if (options.category) {
        console.log(`  ${chalk.cyan('Category:')}    ${chalk.white(options.category)}`);
      }
      console.log();
      console.log(chalk.bold('Transaction Details:'));
      console.log(chalk.gray('─'.repeat(64)));
      console.log(`  ${chalk.cyan('TX Hash:')}     ${chalk.white(hash)}`);
      console.log(`  ${chalk.cyan('Block:')}       ${chalk.white(receipt.blockNumber.toString())}`);
      console.log(`  ${chalk.cyan('Gas Used:')}    ${chalk.white(receipt.gasUsed.toString())}`);
      console.log();
      console.log(chalk.bold('Explorer:'));
      console.log(chalk.gray('─'.repeat(64)));
      console.log(`  ${chalk.white('https://testnet.monadvision.com/tx/' + hash)}`);
      console.log();

      console.log(chalk.bold('Next Steps:'));
      console.log(chalk.gray('─'.repeat(64)));
      console.log(`  ${chalk.cyan('•')} Your skill is now on the platform`);
      console.log(`  ${chalk.cyan('•')} Users can search: npx myskills search ${skillName}`);
      console.log(`  ${chalk.cyan('•')} Users can tip: npx myskills tip ${skillId} <amount>`);
      console.log(`  ${chalk.cyan('•')} View your skills: npx myskills my-skills`);
      console.log();

    } catch (gasError: any) {
      // Contract might not support registerSkill yet
      if (gasError.message?.includes('function') || gasError.message?.includes('encode')) {
        registerSpinner.warn('Contract function not available');
        console.log(chalk.yellow('\n⚠️  The ASKL Token contract may need to be updated'));
        console.log(chalk.gray('Current address:'), chalk.white(CONTRACT_ADDRESS));
        console.log(chalk.gray('\nMake sure the contract has registerSkill function'));
        console.log(chalk.gray('Deploy: npm run deploy-contract\n'));
      } else {
        throw gasError;
      }
    }

  } catch (error: any) {
    registerSpinner.fail('Registration failed');
    console.error(chalk.red(`\nError: ${error.message}`));

    // Help message
    console.log(chalk.gray('\nTroubleshooting:'));
    console.log(chalk.gray('  1. Check your MON balance'));
    console.log(chalk.gray('  2. Verify contract address:'), chalk.white(CONTRACT_ADDRESS));
    console.log(chalk.gray('  3. Check network: Monad Testnet (Chain ID: 10143)'));
    console.log(chalk.gray('  4. View account: npx myskills whoami\n'));

    process.exit(1);
  }
}
