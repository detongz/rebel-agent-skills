/**
 * Leaderboard command - View top skills by creator earnings
 *
 * Displays:
 * - Top earning skills
 * - Total tips received
 * - Number of contributors
 */

import chalk from 'chalk';
import Table from 'cli-table3';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import type { Address } from 'viem';

const REGISTRY_FILE = join(homedir(), '.myskills', 'registry.json');

interface Skill {
  id: string;
  name: string;
  repo: string;
  creator: Address;
  category?: string;
  securityScore?: number;
  totalEarnings?: number;
  tipsReceived?: number;
  createdAt: number;
}

interface LocalRegistry {
  skills: Skill[];
  // Mock earnings data - in production, fetch from smart contract
}

async function loadRegistry(): Promise<LocalRegistry> {
  if (!existsSync(REGISTRY_FILE)) {
    // Return mock data for demo
    return {
      skills: [
        {
          id: 'test-generator-001',
          name: 'Test Generator',
          repo: 'vercel-labs/agent-skills',
          creator: '0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf' as Address,
          category: 'testing',
          securityScore: 85,
          totalEarnings: 125.5,
          tipsReceived: 42,
          createdAt: Date.now() - 86400000 * 7,
        },
        {
          id: 'auditor-002',
          name: 'Smart Contract Auditor',
          repo: 'example/auditor',
          creator: '0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf' as Address,
          category: 'security',
          securityScore: 92,
          totalEarnings: 87.25,
          tipsReceived: 28,
          createdAt: Date.now() - 86400000 * 14,
        },
      ],
    };
  }
  try {
    const content = await readFile(REGISTRY_FILE, 'utf-8');
    return JSON.parse(content);
  } catch {
    return { skills: [] };
  }
}

function formatTimeframe(timeframe: string): string {
  switch (timeframe) {
    case 'week':
      return 'This Week';
    case 'month':
      return 'This Month';
    default:
      return 'All Time';
  }
}

function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export async function leaderboardCommand(options: { timeframe: string; limit: string }) {
  console.log(chalk.cyan(`\n🏆 MySkills Leaderboard - ${formatTimeframe(options.timeframe)}\n`));

  const registry = await loadRegistry();

  // Sort by earnings
  const sortedSkills = [...registry.skills]
    .sort((a, b) => (b.totalEarnings || 0) - (a.totalEarnings || 0))
    .slice(0, parseInt(options.limit));

  if (sortedSkills.length === 0) {
    console.log(chalk.yellow('No skills registered yet.\n'));
    console.log(chalk.gray('Be the first! Submit your skill:'));
    console.log(chalk.white('  npx myskills submit <repo-url>\n'));
    return;
  }

  // Display table
  const table = new Table({
    head: [
      chalk.cyan('Rank'),
      chalk.cyan('Skill'),
      chalk.cyan('Creator'),
      chalk.cyan('Category'),
      chalk.cyan('Earnings'),
      chalk.cyan('Tips'),
    ],
    colWidths: [8, 25, 18, 12, 12, 8],
    wordWrap: true,
  });

  sortedSkills.forEach((skill, index) => {
    const rank = index + 1;
    const rankIcon = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `${rank}.`;

    table.push([
      rankIcon,
      skill.name,
      shortenAddress(skill.creator),
      skill.category || '-',
      `${skill.totalEarnings?.toFixed(2) || '0.00'} MON`,
      skill.tipsReceived?.toString() || '0',
    ]);
  });

  console.log(table.toString());

  // Summary stats
  const totalEarnings = sortedSkills.reduce((sum, s) => sum + (s.totalEarnings || 0), 0);
  const totalTips = sortedSkills.reduce((sum, s) => sum + (s.tipsReceived || 0), 0);

  console.log();
  console.log(chalk.bold('Summary:'));
  console.log(chalk.gray('─'.repeat(64)));
  console.log(`  ${chalk.cyan('Total Skills:')}     ${chalk.white(sortedSkills.length.toString())}`);
  console.log(`  ${chalk.cyan('Total Earnings:')}   ${chalk.white(totalEarnings.toFixed(2))} MON`);
  console.log(`  ${chalk.cyan('Total Tips:')}       ${chalk.white(totalTips.toString())}`);
  console.log();

  console.log(chalk.gray('💡 Tip a skill creator:'));
  console.log(chalk.white(`  npx myskills tip <skill-id> <amount>\n`));
}
