/**
 * Info Command - Get detailed information about a Skill
 */

import chalk from 'chalk';
import ora from 'ora';
import Table from 'cli-table3';
import { getSkill } from '../lib/skills.js';
import { formatNumber, shortAddress } from '../lib/format.js';

export async function infoCommand(skillId: string): Promise<void> {
  console.log('');
  const spinner = ora('Fetching Skill information...').start();

  const API_BASE = process.env.API_BASE || 'http://localhost:3001';

  try {
    const skill = await getSkill(skillId, API_BASE);
    spinner.succeed(chalk.green('Skill found!'));

    console.log('');
    console.log(chalk.bold.cyan('╔═══════════════════════════════════════════════════════════╗'));
    console.log(chalk.bold.cyan('║') + '  ' + chalk.bold.white(skill.name).padEnd(53) + chalk.bold.cyan('║'));
    console.log(chalk.bold.cyan('╚═══════════════════════════════════════════════════════════╝'));
    console.log('');

    // Basic info table
    const basicTable = new Table({
      colWidths: [20, 50],
      wordWrap: true,
    });

    basicTable.push(
      [chalk.gray('Skill ID'), chalk.white(skill.skill_id || skillId)],
      [chalk.gray('Platform'), chalk.cyan(skill.platform)],
      [chalk.gray('Version'), chalk.white(skill.version || 'N/A')],
      [chalk.gray('Creator'), chalk.cyan(shortAddress(skill.creator_address))],
      [chalk.gray('Payment Address'), chalk.cyan(shortAddress(skill.payment_address))],
      [chalk.gray('Description'), chalk.white(skill.description || 'No description')],
    );

    console.log(basicTable.toString());
    console.log('');

    // Stats section
    console.log(chalk.bold('📊 Statistics'));
    console.log(chalk.gray('─'.repeat(70)));

    const statsTable = new Table({
      colWidths: [25, 15, 15, 15],
    });

    statsTable.push(
      [
        '',
        chalk.cyan('Value'),
        chalk.gray('Count'),
        chalk.gray('Rank'),
      ],
      [
        chalk.white('Total Tips'),
        chalk.green('💰 ' + formatNumber(skill.total_tips || '0') + ' ASKL'),
        chalk.white(skill.tip_count?.toString() || '0'),
        chalk.gray('#' + (skill.rank_tips || 'N/A')),
      ],
      [
        chalk.white('Platform Likes'),
        chalk.yellow('❤️ ' + formatNumber(skill.platform_likes || '0')),
        '',
        chalk.gray('#' + (skill.rank_likes || 'N/A')),
      ],
      [
        chalk.white('GitHub Stars'),
        chalk.blue('⭐ ' + formatNumber(skill.github_stars || '0')),
        '',
        '',
      ],
      [
        chalk.white('Downloads'),
        chalk.magenta('📥 ' + formatNumber(skill.download_count || '0')),
        '',
        '',
      ],
    );

    console.log(statsTable.toString());
    console.log('');

    // Links section
    if (skill.repository || skill.homepage || skill.npm_package) {
      console.log(chalk.bold('🔗 Links'));
      console.log(chalk.gray('─'.repeat(70)));

      const linksTable = new Table({
        colWidths: [15, 55],
      });

      if (skill.repository) {
        linksTable.push([chalk.gray('GitHub'), chalk.cyan(skill.repository)]);
      }
      if (skill.homepage) {
        linksTable.push([chalk.gray('Homepage'), chalk.cyan(skill.homepage)]);
      }
      if (skill.npm_package) {
        linksTable.push([chalk.gray('npm'), chalk.cyan(`https://www.npmjs.com/package/${skill.npm_package}`)]);
      }

      console.log(linksTable.toString());
      console.log('');
    }

    // Tags
    if (skill.tags && Array.isArray(skill.tags) && skill.tags.length > 0) {
      console.log(chalk.bold('🏷️  Tags: ') + skill.tags.map((t: string) => chalk.cyan(`#${t}`)).join(' '));
      console.log('');
    }

    // Actions
    console.log(chalk.bold('⚡ Actions'));
    console.log(chalk.gray('─'.repeat(70)));
    console.log(chalk.white('  View on web:  ') + chalk.cyan(`${API_BASE}/skill/${skill.id}`));
    console.log(chalk.white('  Tip this Skill: ') + chalk.yellow(`myskills tip ${skill.skill_id || skillId}`));
    console.log('');

  } catch (error: any) {
    spinner.fail(chalk.red('Failed to fetch Skill'));
    console.error(chalk.red('Error: ') + error.message);
    console.log('');
    console.log(chalk.gray('Tip: Use ') + chalk.white('myskills list') + chalk.gray(' to see all available Skills'));
    process.exit(1);
  }
}
