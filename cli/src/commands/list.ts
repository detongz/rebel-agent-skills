/**
 * List Command - List all Skills with filtering and sorting
 */

import chalk from 'chalk';
import ora from 'ora';
import Table from 'cli-table3';
import { listSkills } from '../lib/skills.js';
import { formatNumber, shortAddress } from '../lib/format.js';

interface ListOptions {
  platform?: string;
  sort?: string;
  limit?: string;
}

export async function listCommand(options: ListOptions): Promise<void> {
  console.log('');
  const spinner = ora('Fetching Skills...').start();

  const API_BASE = process.env.API_BASE || 'http://localhost:3001';

  try {
    const skills = await listSkills(
      API_BASE,
      options.platform,
      options.sort || 'tips',
      parseInt(options.limit || '20')
    );

    spinner.succeed(chalk.green(`Found ${skills.length} Skills`));

    if (skills.length === 0) {
      console.log('');
      console.log(chalk.gray('No Skills found. Be the first to create one!'));
      console.log(chalk.gray('Run: ') + chalk.cyan('myskills register --help'));
      console.log('');
      return;
    }

    console.log('');

    // Header
    const platformFilter = options.platform ? chalk.cyan(`[${options.platform}]`) : '';
    const sortFilter = chalk.gray(`sorted by: ${options.sort}`);

    console.log(
      chalk.bold.cyan('┌─────────────────────────────────────────────────────────────────────────────┐')
    );
    console.log(
      chalk.bold.cyan('│') +
      '  ' +
      chalk.bold.white(`Skills Directory ${platformFilter}`).padEnd(75) +
      chalk.bold.cyan('│')
    );
    console.log(
      chalk.bold.cyan('│') +
      '  ' +
      sortFilter.padEnd(75) +
      chalk.bold.cyan('│')
    );
    console.log(
      chalk.bold.cyan('└─────────────────────────────────────────────────────────────────────────────┘')
    );
    console.log('');

    // Skills table
    const table = new Table({
      head: [
        chalk.gray('#'),
        chalk.gray('Name'),
        chalk.gray('Platform'),
        chalk.gray('Tips'),
        chalk.gray('Likes'),
        chalk.gray('Creator'),
      ],
      colWidths: [4, 30, 12, 12, 8, 42],
      wordWrap: true,
    });

    skills.forEach((skill: any, index: number) => {
      const rankIcon = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;

      table.push([
        chalk.white(rankIcon),
        chalk.cyan(skill.name),
        chalk.white(skill.platform),
        chalk.green('💰 ' + formatNumber(skill.total_tips || '0')),
        chalk.yellow('❤️ ' + formatNumber(skill.platform_likes || '0')),
        chalk.gray(shortAddress(skill.payment_address)),
      ]);
    });

    console.log(table.toString());
    console.log('');

    // Footer
    console.log(chalk.gray('─').repeat(77));
    console.log(chalk.white('  Use ') + chalk.cyan('myskills info <skillId>') + chalk.white(' for details'));
    console.log(chalk.white('  Use ') + chalk.cyan('myskills register --help') + chalk.white(' to create a Skill'));
    console.log('');

  } catch (error: any) {
    spinner.fail(chalk.red('Failed to fetch Skills'));
    console.error(chalk.red('Error: ') + error.message);
    process.exit(1);
  }
}
