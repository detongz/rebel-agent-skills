/**
 * List command - List installed agent skills
 *
 * Scans for skills from multiple sources:
 * - OpenClaw plugins (~/.openclaw/skills.json)
 * - Vercel Skills (~/.skills/skills.json)
 * - MCP servers (project .mcp.json files)
 */

import chalk from 'chalk';
import ora from 'ora';
import Table from 'cli-table3';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface Skill {
  name: string;
  platform: string;
  source: string;
  installedAt?: string;
  version?: string;
}

interface OpenClawConfig {
  skills?: Array<{
    slug: string;
    installedAt?: number;
  }>;
}

interface VercelSkillsConfig {
  skills?: Array<{
    repo: string;
    path?: string;
    installedAt?: number;
  }>;
}

async function loadOpenClawSkills(): Promise<Skill[]> {
  const configPath = join(homedir(), '.openclaw', 'skills.json');
  const skills: Skill[] = [];

  if (!existsSync(configPath)) {
    return skills;
  }

  try {
    const content = await readFile(configPath, 'utf-8');
    const config: OpenClawConfig = JSON.parse(content);

    if (config.skills) {
      for (const skill of config.skills) {
        skills.push({
          name: skill.slug,
          platform: 'openclaw',
          source: 'ClawHub',
          installedAt: skill.installedAt ? new Date(skill.installedAt).toLocaleDateString() : undefined,
        });
      }
    }
  } catch {
    // Invalid config, continue
  }

  return skills;
}

async function loadVercelSkills(): Promise<Skill[]> {
  const configPath = join(homedir(), '.skills', 'skills.json');
  const skills: Skill[] = [];

  if (!existsSync(configPath)) {
    return skills;
  }

  try {
    const content = await readFile(configPath, 'utf-8');
    const config: VercelSkillsConfig = JSON.parse(content);

    if (config.skills) {
      for (const skill of config.skills) {
        const name = skill.repo.split('/').pop() || skill.repo;
        skills.push({
          name,
          platform: 'claude-code',
          source: 'Vercel',
          installedAt: skill.installedAt ? new Date(skill.installedAt).toLocaleDateString() : undefined,
        });
      }
    }
  } catch {
    // Invalid config, continue
  }

  return skills;
}

async function loadMCPServers(): Promise<Skill[]> {
  const skills: Skill[] = [];

  // Check common MCP config locations
  const mcpPaths = [
    join(process.cwd(), '.mcp.json'),
    join(process.cwd(), '.claude', 'mcp.json'),
    join(homedir(), '.config', 'claude', 'mcp.json'),
  ];

  for (const mcpPath of mcpPaths) {
    if (!existsSync(mcpPath)) {
      continue;
    }

    try {
      const content = await readFile(mcpPath, 'utf-8');
      const config = JSON.parse(content);

      if (config.mcpServers) {
        for (const [name, serverConfig] of Object.entries(config.mcpServers)) {
          const isNpx = typeof serverConfig === 'object' && 'command' in serverConfig;
          const source = isNpx && (serverConfig as any).command?.includes('npx') ? 'npm' : 'local';

          skills.push({
            name,
            platform: 'mcp',
            source,
          });
        }
      }
    } catch {
      // Invalid config, continue
    }
  }

  return skills;
}

export async function listCommand() {
  console.log(chalk.cyan('\n📋 Installed Agent Skills\n'));

  const spinner = ora('Scanning for installed skills...').start();

  // Load skills from all sources
  const [openClawSkills, vercelSkills, mcpServers] = await Promise.all([
    loadOpenClawSkills(),
    loadVercelSkills(),
    loadMCPServers(),
  ]);

  const allSkills = [...openClawSkills, ...vercelSkills, ...mcpServers];

  spinner.succeed(`Found ${allSkills.length} skill(s)\n`);

  if (allSkills.length === 0) {
    console.log(chalk.yellow('No skills installed yet.\n'));
    console.log(chalk.gray('Install your first skill:'));
    console.log(chalk.white('  npx myskills search <query>'));
    console.log(chalk.white('  npx myskills install <skill>\n'));
    return;
  }

  // Group by platform
  const byPlatform: Record<string, Skill[]> = {
    openclaw: openClawSkills,
    'claude-code': vercelSkills,
    mcp: mcpServers,
  };

  // Display table
  const table = new Table({
    head: [
      chalk.cyan('Name'),
      chalk.cyan('Platform'),
      chalk.cyan('Source'),
      chalk.cyan('Installed'),
    ],
    colWidths: [30, 15, 12, 14],
    wordWrap: true,
  });

  allSkills.forEach(skill => {
    table.push([
      skill.name,
      skill.platform,
      skill.source === 'ClawHub'
        ? chalk.white('ClawHub')
        : skill.source === 'Vercel'
          ? chalk.blue('Vercel')
          : skill.source,
      skill.installedAt || '-',
    ]);
  });

  console.log(table.toString());

  // Summary
  console.log();
  console.log(chalk.bold('Summary:'));
  console.log(chalk.gray('─'.repeat(64)));
  console.log(`  ${chalk.cyan('OpenClaw:')}      ${chalk.white(openClawSkills.length.toString())}`);
  console.log(`  ${chalk.cyan('Vercel Skills:')} ${chalk.white(vercelSkills.length.toString())}`);
  console.log(`  ${chalk.cyan('MCP Servers:')}   ${chalk.white(mcpServers.length.toString())}`);
  console.log();

  console.log(chalk.gray('💡 Manage skills:'));
  console.log(chalk.white(`  npx myskills search <query>   - Find new skills`));
  console.log(chalk.white(`  npx myskills install <skill>  - Install a skill`));
  console.log(chalk.white(`  npx myskills scan <url>       - Security check\n`));
}
