#!/usr/bin/env node
/**
 * myskills CLI
 *
 * A command-line tool for Agent Skill creators to:
 * - Register new Skills
 * - Query Skill information
 * - Sync GitHub statistics
 * - Manage earnings
 *
 * @example
 *   npx myskills register --name "My Skill" --platform claude-code
 *   npx myskills info <skillId>
 *   npx myskills sync-github
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { registerCommand } from './commands/register.js';
import { infoCommand } from './commands/info.js';
import { listCommand } from './commands/list.js';
import { syncCommand } from './commands/sync.js';
import { statsCommand } from './commands/stats.js';

const program = new Command();

// CLI Info
const logo = `
${chalk.cyan('╔════════════════════════════════════════════════╗')}
${chalk.cyan('║')}  ${chalk.bold.white('myskills')} ${chalk.gray('- CLI v1.0.0')}                        ${chalk.cyan('║')}
${chalk.cyan('║')}  ${chalk.white('Cross-platform Agent Skill Tipping')}      ${chalk.cyan('║')}
${chalk.cyan('╚════════════════════════════════════════════════╝')}
`;

console.log(logo);

program
  .name('myskills')
  .description('myskills CLI - Manage your Agent Skills')
  .version('1.0.0');

// Register command
program
  .command('register')
  .description('Register a new Agent Skill')
  .option('-n, --name <name>', 'Skill name')
  .option('-d, --description <description>', 'Skill description')
  .option('-p, --platform <platform>', 'Platform (coze, claude-code, manus, minimax)')
  .option('-v, --version <version>', 'Version (default: 1.0.0)', '1.0.0')
  .option('-r, --repository <url>', 'GitHub repository URL')
  .option('-h, --homepage <url>', 'Homepage/Documentation URL')
  .option('-N, --npm-package <package>', 'npm package name')
  .option('-w, --wallet <address>', 'Payment wallet address')
  .option('--interactive', 'Interactive mode')
  .action(registerCommand);

// Info command
program
  .command('info <skillId>')
  .description('Get detailed information about a Skill')
  .action(infoCommand);

// List command
program
  .command('list')
  .description('List all Skills')
  .option('-p, --platform <platform>', 'Filter by platform')
  .option('-s, --sort <field>', 'Sort by (tips, likes, latest)', 'tips')
  .option('--limit <number>', 'Limit results', '20')
  .action(listCommand);

// Sync command
program
  .command('sync-github [skillId]')
  .description('Sync GitHub statistics for a Skill')
  .option('-a, --all', 'Sync all Skills')
  .action(syncCommand);

// Stats command
program
  .command('stats <address>')
  .description('Get creator earnings statistics')
  .action(statsCommand);

// Global error handling
program.configureOutput({
  writeErr: (str) => {
    if (str.includes('error:')) {
      console.error(chalk.red(str));
    } else {
      console.error(str);
    }
  },
});

// Parse arguments
program.parse();

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
