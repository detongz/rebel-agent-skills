/**
 * MySkills CLI - Search, scan, and install agent skills with security verification
 *
 * Usage:
 *   npx myskills search <query>
 *   npx myskills scan <url>
 *   npx myskills install <skill>
 *   npx myskills tip <skill> <amount>
 *   npx myskills list
 */

import { Command } from 'commander';
import { searchCommand } from './commands/search.js';

const program = new Command();

program
  .name('myskills')
  .description('MySkills CLI - Search, scan, and install agent skills with security verification')
  .version('1.0.0');

// Search command
program.command('search [query...]')
  .description('Search for agent skills across multiple registries')
  .option('-p, --platform <type>', 'Filter by platform (claude-code|openclaw|coze|manus|minimbp|all)', 'all')
  .option('-s, --min-score <score>', 'Minimum security score (0-100)', '0')
  .option('-l, --limit <number>', 'Maximum results', '20')
  .action(searchCommand);

// Scan command
program.command('scan <url>')
  .description('Security scan a skill from URL or GitHub repo')
  .option('-f, --full', 'Run deep security scan', false)
  .option('-o, --output <format>', 'Output format (text|json)', 'text')
  .action(async (url: string, options) => {
    const { scanCommand } = await import('./commands/scan.js');
    scanCommand(url, options);
  });

// Install command
program.command('install <skill>')
  .description('Install a skill')
  .option('-t, --type <type>', 'Installation type (mcp|openclaw|npm)', 'mcp')
  .action(async (skill: string, options) => {
    const { installCommand } = await import('./commands/install.js');
    installCommand(skill, options);
  });

// Tip command
program.command('tip <skill> <amount>')
  .description('Tip a skill creator on Monad blockchain')
  .option('-m, --message <text>', 'Optional message to the creator')
  .option('--token <symbol>', 'Token symbol (default: ASKL)', 'ASKL')
  .action(async (skill: string, amount: string, options) => {
    const { tipCommand } = await import('./commands/tip.js');
    tipCommand(skill, amount, options);
  });

// List command
program.command('list')
  .description('List installed skills')
  .action(async () => {
    const { listCommand } = await import('./commands/list.js');
    listCommand();
  });

// Submit command
program.command('submit <url>')
  .description('Submit a skill to MySkills index')
  .option('-c, --category <name>', 'Skill category')
  .action(async (url: string, options) => {
    const { submitCommand } = await import('./commands/submit.js');
    submitCommand(url, options);
  });

// Leaderboard command
program.command('leaderboard')
  .description('View top skills by creator earnings')
  .option('-t, --timeframe <period>', 'Time period (week|month|all)', 'all')
  .option('-l, --limit <number>', 'Number of results', '10')
  .action(async (options) => {
    const { leaderboardCommand } = await import('./commands/leaderboard.js');
    leaderboardCommand(options);
  });

// Publish command - Publish skill to platform (requires login + payment)
program.command('publish <url>')
  .description('Publish a skill to MySkills platform (requires wallet login)')
  .option('-n, --name <name>', 'Skill name (default: repo name)')
  .option('-c, --category <category>', 'Skill category (default: general)')
  .option('-p, --plan <plan>', 'Payment plan: single or subscription', 'single')
  .action(async (url: string, options) => {
    const { publishCommand } = await import('./commands/publish.js');
    publishCommand(url, options);
  });

// My Skills command - List your published skills
program.command('my-skills')
  .description('List your published skills')
  .action(async () => {
    const { mySkillsCommand } = await import('./commands/my-skills.js');
    mySkillsCommand();
  });

// Auth commands
program.command('login [private-key]')
  .description('Connect your Monad wallet (or set MY_SKILLS_PRIVATE_KEY env var)')
  .action(async (privateKey?: string) => {
    const { loginCommand } = await import('./commands/auth.js');
    loginCommand(privateKey);
  });

// Add command - Add skill from GitHub or local directory
program.command('add <source>')
  .description('Add a skill to MySkills from GitHub or local directory')
  .option('-b, --batch <file>', 'Batch add from file (one source per line)')
  .option('-d, --dir <path>', 'Add all skills from a directory')
  .option('--auto-publish', 'Automatically publish after adding (requires login)')
  .option('--skip-scan', 'Skip security scan')
  .action(async (source: string, options) => {
    const { addCommand } = await import('./commands/add.js');
    addCommand(source, options);
  });

program.command('whoami')
  .description('Show current wallet address and balance')
  .action(async () => {
    const { whoamiCommand } = await import('./commands/auth.js');
    whoamiCommand();
  });

program.parse();
