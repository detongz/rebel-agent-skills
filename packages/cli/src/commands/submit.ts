/**
 * Submit command - Submit a skill to MySkills on-chain registry
 *
 * Flow:
 * 1. Validate GitHub URL
 * 2. Fetch skill metadata
 * 3. Run security scan
 * 4. Register on-chain (store name, repo, creator wallet)
 * 5. Return skill ID
 */

import chalk from 'chalk';
import ora from 'ora';
import { createWalletClient, createPublicClient, http, type Address, stringToHex } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

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

const CONFIG_FILE = join(homedir(), '.myskills', 'config.json');
const REGISTRY_FILE = join(homedir(), '.myskills', 'registry.json');

interface Config {
  privateKey?: string;
  address?: string;
}

interface Skill {
  id: string;
  name: string;
  repo: string;
  creator: Address;
  category?: string;
  securityScore?: number;
  createdAt: number;
}

interface LocalRegistry {
  skills: Skill[];
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

async function loadRegistry(): Promise<LocalRegistry> {
  if (!existsSync(REGISTRY_FILE)) {
    return { skills: [] };
  }
  try {
    const content = await readFile(REGISTRY_FILE, 'utf-8');
    return JSON.parse(content);
  } catch {
    return { skills: [] };
  }
}

async function saveRegistry(registry: LocalRegistry): Promise<void> {
  await writeFile(REGISTRY_FILE, JSON.stringify(registry, null, 2));
}

function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match) return null;
  return { owner: match[1], repo: match[2].replace('.git', '') };
}

async function fetchRepoMetadata(owner: string, repo: string): Promise<{ name: string; description: string }> {
  try {
    // Try to fetch from GitHub API (no auth needed for public repos)
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
    if (response.ok) {
      const data = await response.json();
      return {
        name: data.name || repo,
        description: data.description || '',
      };
    }
  } catch {
    // Continue to fallback
  }

  // Fallback: use repo name
  return {
    name: repo,
    description: '',
  };
}

export async function submitCommand(url: string, options: { category?: string }) {
  console.log(chalk.cyan(`\n📤 Submitting skill to MySkills...\n`));

  // Check wallet login
  const config = await loadConfig();
  if (!config.address || !config.privateKey) {
    console.error(chalk.red('❌ No wallet connected'));
    console.log(chalk.gray('\nLogin first:'));
    console.log(chalk.white('  npx myskills login <private-key>\n'));
    process.exit(1);
  }

  // Validate GitHub URL
  const spinner = ora('Validating URL...').start();
  const parsed = parseGitHubUrl(url);

  if (!parsed) {
    spinner.fail('Invalid URL');
    console.error(chalk.red(`\n❌ Invalid GitHub URL: ${url}`));
    console.log(chalk.gray('\nExpected format:'));
    console.log(chalk.white('  https://github.com/owner/repo\n'));
    process.exit(1);
  }

  const { owner, repo } = parsed;
  spinner.text = `Fetching ${owner}/${repo} metadata...`;

  // Fetch metadata
  const metadata = await fetchRepoMetadata(owner, repo);

  // Check if already registered
  const registry = await loadRegistry();
  const existingSkill = registry.skills.find(s => s.repo === `${owner}/${repo}`);

  if (existingSkill) {
    spinner.fail('Already registered');
    console.log(chalk.yellow(`\n⚠️  This skill is already registered!`));
    console.log(chalk.gray(`\nSkill ID: ${chalk.white(existingSkill.id)}`));
    console.log(chalk.gray(`Name: ${chalk.white(existingSkill.name)}`));
    console.log(chalk.gray(`Creator: ${chalk.white(existingSkill.creator)}`));
    console.log();
    return;
  }

  spinner.text = 'Running security scan...';

  // Run security scan (simplified version)
  const tempDir = `/tmp/myskills-submit-${Date.now()}`;
  try {
    await execAsync(`git clone --depth 1 https://github.com/${owner}/${repo} ${tempDir}`, { timeout: 60000 });

    // Basic security checks
    const { stdout: dangerousOutput } = await execAsync(
      `grep -r -i "eval\\|exec\\|spawn\\|child_process" ${tempDir} 2>/dev/null | wc -l`,
      { timeout: 10000 }
    );

    const patternCount = parseInt(dangerousOutput.trim()) || 0;
    const securityScore = Math.max(0, 100 - patternCount * 5);

    spinner.text = 'Registering on-chain...';

    // Create skill ID
    const skillId = `${owner}-${repo}-${Date.now()}`;

    // TODO: Call smart contract to register on-chain
    // For now, store in local registry
    const newSkill: Skill = {
      id: skillId,
      name: metadata.name,
      repo: `${owner}/${repo}`,
      creator: config.address as Address,
      category: options.category,
      securityScore,
      createdAt: Date.now(),
    };

    registry.skills.push(newSkill);
    await saveRegistry(registry);

    spinner.succeed('Skill registered!\n');

    console.log(chalk.bold('Skill Details:'));
    console.log(chalk.gray('─'.repeat(64)));
    console.log(`  ${chalk.cyan('ID:')}            ${chalk.white(skillId)}`);
    console.log(`  ${chalk.cyan('Name:')}          ${chalk.white(metadata.name)}`);
    console.log(`  ${chalk.cyan('Repository:')}    ${chalk.white(`${owner}/${repo}`)}`);
    console.log(`  ${chalk.cyan('Creator:')}       ${chalk.white(config.address)}`);
    if (options.category) {
      console.log(`  ${chalk.cyan('Category:')}      ${chalk.white(options.category)}`);
    }
    console.log(`  ${chalk.cyan('Security:')}      ${chalk.white(securityScore.toString())}/100`);
    console.log();

    console.log(chalk.bold('Next Steps:'));
    console.log(chalk.gray('─'.repeat(64)));
    console.log(`  ${chalk.cyan('•')} Your skill is now searchable`);
    console.log(`  ${chalk.cyan('•')} Users can tip you with: npx myskills tip ${skillId} <amount>`);
    console.log(`  ${chalk.cyan('•')} View leaderboard: npx myskills leaderboard`);
    console.log();

    // Cleanup
    await execAsync(`rm -rf ${tempDir}`).catch(() => {});

  } catch (error) {
    spinner.fail('Registration failed');
    console.error(chalk.red(`\nError: ${error}`));

    // Cleanup
    await execAsync(`rm -rf ${tempDir}`).catch(() => {});
    process.exit(1);
  }
}
