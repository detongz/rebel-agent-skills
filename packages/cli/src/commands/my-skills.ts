/**
 * My Skills command - List your published skills
 *
 * Fetches skills published by the connected wallet address
 * from both on-chain registry and database
 */

import chalk from 'chalk';
import ora from 'ora';
import { createPublicClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

const MONAD_TESTNET = {
  id: 10143,
  name: 'Monad Testnet',
  rpcUrls: {
    default: { http: ['https://testnet-rpc.monad.xyz'] },
  },
} as const;

const CONFIG_DIR = join(homedir(), '.myskills');
const CONFIG_FILE = join(CONFIG_DIR, 'config.json');
const CONTRACT_ADDRESS = process.env.ASKL_TOKEN_ADDRESS || '0xc1fFCAD15e2f181E49bFf2cBea79094eC9B5033A' as const;
const API_BASE = process.env.MYSKILLS_API_BASE || 'http://localhost:3000';

interface Config {
  privateKey?: string;
  address?: string;
}

interface PublishedSkill {
  id: string;
  name: string;
  repository: string;
  category: string;
  securityScore: number;
  totalTips: string;
  createdAt: string;
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

export async function mySkillsCommand() {
  console.log(chalk.cyan('\n📚 Your Published Skills\n'));

  // Check wallet login
  const config = await loadConfig();
  if (!config.address || !config.privateKey) {
    console.error(chalk.red('❌ No wallet connected'));
    console.log(chalk.yellow('\n🔐 Login to view your published skills'));
    console.log(chalk.gray('\nLogin with:'));
    console.log(chalk.white('  npx myskills login <private-key>\n'));
    process.exit(1);
  }

  const spinner = ora('Fetching your skills...').start();

  try {
    // Fetch from API (database + on-chain combined)
    const response = await fetch(`${API_BASE}/api/skills?creator=${config.address}`);

    if (response.ok) {
      const data = await response.json();

      if (data.success && data.data && data.data.length > 0) {
        spinner.succeed(`Found ${data.data.length} skill(s)\n`);

        console.log(chalk.bold('Your Skills:'));
        console.log(chalk.gray('─'.repeat(64)));

        data.data.forEach((skill: PublishedSkill, index: number) => {
          console.log(`\n  ${chalk.cyan((index + 1).toString() + '.')} ${chalk.white(skill.name)}`);
          console.log(`     ${chalk.gray('ID:')}           ${chalk.white(skill.id)}`);
          console.log(`     ${chalk.gray('Repository:')}   ${chalk.white(skill.repository)}`);
          console.log(`     ${chalk.gray('Category:')}     ${chalk.white(skill.category)}`);
          console.log(`     ${chalk.gray('Security:')}     ${getScoreBar(skill.securityScore)} ${skill.securityScore}/100`);
          console.log(`     ${chalk.gray('Total Tips:')}   ${chalk.white(skill.totalTips)} ASKL`);
          console.log(`     ${chalk.gray('Published:')}    ${chalk.gray(new Date(skill.createdAt).toLocaleDateString())}`);
        });

        console.log();
        console.log(chalk.bold('Actions:'));
        console.log(chalk.gray('─'.repeat(64)));
        console.log(`  ${chalk.cyan('•')} Tip a skill: ${chalk.white(`npx myskills tip <skill-id> <amount>`)}`);
        console.log(`  ${chalk.cyan('•')} Publish new: ${chalk.white(`npx myskills publish <repo-url>`)}`);
        console.log();

      } else {
        spinner.warn('No skills found');
        console.log(chalk.yellow('\nYou haven\'t published any skills yet.\n'));
        console.log(chalk.bold('To publish your first skill:'));
        console.log(chalk.gray('─'.repeat(64)));
        console.log(`  ${chalk.cyan('1.')} Make sure your wallet is connected`);
        console.log(`  ${chalk.cyan('2.')} Run: ${chalk.white('npx myskills publish https://github.com/user/repo')}`);
        console.log();
      }

    } else {
      spinner.warn('API unavailable');
      console.log(chalk.yellow('\n⚠️  Could not fetch skills from API'));
      console.log(chalk.gray('Make sure the frontend server is running.\n'));
    }

  } catch (error) {
    spinner.fail('Failed to fetch skills');
    console.error(chalk.red(`\nError: ${error}`));
    console.log(chalk.gray('\nTroubleshooting:'));
    console.log(chalk.gray('  1. Make sure the frontend server is running'));
    console.log(chalk.gray('  2. Check API_BASE is correct'));
    console.log(chalk.gray(`  3. Try: curl "${API_BASE}/api/skills?creator=${config.address}"\n`));
  }
}

function getScoreBar(score: number): string {
  const filled = Math.round(score / 10);
  const empty = 10 - filled;
  return '[' + chalk.green('█'.repeat(filled)) + chalk.gray('░'.repeat(empty)) + ']';
}
