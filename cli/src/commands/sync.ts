/**
 * Sync Command - Sync GitHub statistics for Skills
 */

import chalk from 'chalk';
import ora from 'ora';
import { syncGithubStats } from '../lib/skills.js';

interface SyncOptions {
  all?: boolean;
}

export async function syncCommand(skillId: string | undefined, options: SyncOptions): Promise<void> {
  console.log('');
  const API_BASE = process.env.API_BASE || 'http://localhost:3001';

  if (!skillId && !options.all) {
    console.log(chalk.yellow('Usage: myskills sync-github <skillId>'));
    console.log(chalk.gray('       myskills sync-github --all    (sync all Skills)'));
    console.log('');
    return;
  }

  if (options.all) {
    // Sync all Skills
    const spinner = ora('Syncing GitHub stats for all Skills...').start();

    try {
      const results = await syncGithubStats(null, API_BASE);
      spinner.succeed(chalk.green(`Synced ${results.length} Skills`));

      console.log('');

      const table = require('cli-table3')({
        head: [chalk.gray('Skill'), chalk.gray('Stars'), chalk.gray('Forks')],
        colWidths: [40, 12, 12],
      });

      results.forEach((r: any) => {
        table.push([
          chalk.cyan(r.name),
          chalk.blue('⭐ ' + r.stars),
          chalk.white('🍴 ' + r.forks),
        ]);
      });

      console.log(table.toString());
      console.log('');

    } catch (error: any) {
      spinner.fail(chalk.red('Sync failed'));
      console.error(chalk.red('Error: ') + error.message);
      process.exit(1);
    }

  } else {
    // Sync single Skill
    const spinner = ora(`Syncing GitHub stats for Skill: ${skillId}...`).start();

    try {
      const result = await syncGithubStats(skillId || null, API_BASE);
      const stats = Array.isArray(result) ? result[0] : result;
      spinner.succeed(chalk.green('Sync complete!'));

      console.log('');
      console.log(chalk.bold('Updated Statistics:'));
      console.log(chalk.gray('─'.repeat(40)));
      console.log(chalk.white('  Stars:  ') + chalk.blue('⭐ ' + stats.stars));
      console.log(chalk.white('  Forks:  ') + chalk.white('🍴 ' + stats.forks));
      console.log('');

    } catch (error: any) {
      spinner.fail(chalk.red('Sync failed'));
      console.error(chalk.red('Error: ') + error.message);
      process.exit(1);
    }
  }
}
