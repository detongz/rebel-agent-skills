/**
 * Stats Command - Get creator earnings statistics
 */

import chalk from 'chalk';
import ora from 'ora';
import Table from 'cli-table3';
import { getCreatorStats } from '../lib/skills.js';
import { formatNumber, shortAddress } from '../lib/format.js';

export async function statsCommand(address: string): Promise<void> {
  console.log('');
  const spinner = ora('Fetching creator statistics...').start();

  const API_BASE = process.env.API_BASE || 'http://localhost:3001';

  try {
    const stats = await getCreatorStats(address, API_BASE);
    spinner.succeed(chalk.green('Statistics loaded!'));

    console.log('');
    console.log(chalk.bold.cyan('╔═══════════════════════════════════════════════════════════╗'));
    console.log(chalk.bold.cyan('║') + '  ' + chalk.bold.white('Creator Earnings Dashboard').padEnd(53) + chalk.bold.cyan('║'));
    console.log(chalk.bold.cyan('╚═══════════════════════════════════════════════════════════╝'));
    console.log('');

    // Address badge
    console.log(chalk.gray('Address:  ') + chalk.cyan(shortAddress(address)));
    console.log(chalk.gray('          ') + chalk.white(address));
    console.log('');

    // Main stats
    const mainTable = new Table({
      colWidths: [30, 20],
    });

    mainTable.push(
      [chalk.white('Total Skills Created'), chalk.cyan.bold(stats.skillCount?.toString() || '0')],
      [chalk.white('Total Tips Received'), chalk.green.bold('💰 ' + formatNumber(stats.totalTips || '0') + ' ASKL')],
      [chalk.white('Total Tip Count'), chalk.white(stats.tipCount?.toString() || '0')],
      [chalk.white('Average per Tip'), chalk.yellow(formatNumber(stats.avgTip || '0') + ' ASKL')],
    );

    console.log(mainTable.toString());
    console.log('');

    // Top Skills
    if (stats.topSkills && stats.topSkills.length > 0) {
      console.log(chalk.bold('🏆 Top Performing Skills'));
      console.log(chalk.gray('─'.repeat(70)));

      const topTable = new Table({
        head: [chalk.gray('Skill'), chalk.gray('Tips'), chalk.gray('Count')],
        colWidths: [40, 18, 12],
      });

      stats.topSkills.forEach((skill: any) => {
        topTable.push([
          chalk.cyan(skill.name),
          chalk.green('💰 ' + formatNumber(skill.total_tips || '0')),
          chalk.white(skill.tip_count?.toString() || '0'),
        ]);
      });

      console.log(topTable.toString());
      console.log('');
    }

    // Tips breakdown
    if (stats.recentTips && stats.recentTips.length > 0) {
      console.log(chalk.bold('📜 Recent Tips (Last 10)'));
      console.log(chalk.gray('─'.repeat(70)));

      const tipsTable = new Table({
        head: [chalk.gray('From'), chalk.gray('Amount'), chalk.gray('Time')],
        colWidths: [42, 18, 20],
      });

      stats.recentTips.slice(0, 10).forEach((tip: any) => {
        tipsTable.push([
          chalk.cyan(shortAddress(tip.from_address)),
          chalk.green('💰 ' + formatNumber(tip.amount)),
          chalk.gray(new Date(tip.created_at).toLocaleDateString()),
        ]);
      });

      console.log(tipsTable.toString());
      console.log('');
    }

    // Call to action
    console.log(chalk.bold('⚡ Actions'));
    console.log(chalk.gray('─'.repeat(70)));
    console.log(chalk.white('  View profile: ') + chalk.cyan(`${API_BASE}/creator/${address}`));
    console.log(chalk.white('  Register more Skills to earn more!'));
    console.log('');

  } catch (error: any) {
    spinner.fail(chalk.red('Failed to fetch statistics'));
    console.error(chalk.red('Error: ') + error.message);
    process.exit(1);
  }
}
