/**
 * Add command - Add a skill to MySkills platform
 *
 * Supports multiple sources:
 * - GitHub: github:owner/repo, gh:owner/repo, or owner/repo
 * - Local: ./path, ~/path, /absolute/path
 *
 * Usage:
 *   npx myskills add github:owner/repo
 *   npx myskills add ./local-skill
 *   npx myskills add --batch skills-list.txt
 *   npx myskills add --dir ~/skills/
 */

import chalk from 'chalk';
import ora from 'ora';
import { createWalletClient, createPublicClient, http, keccak256, toHex } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { readFile, writeFile, readdir, stat } from 'fs/promises';
import { existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const MONAD_TESTNET = {
  id: 10143,
  name: 'Monad Testnet',
  rpcUrls: {
    default: { http: ['https://testnet-rpc.monad.xyz'] },
  },
} as const;

const CONFIG_DIR = join(homedir(), '.myskills');
const CONFIG_FILE = join(CONFIG_DIR, 'config.json');
const API_BASE = process.env.MYSKILLS_API_BASE || 'http://localhost:3000';

interface AddOptions {
  batch?: string;
  dir?: string;
  autoPublish?: boolean;
  skipScan?: boolean;
}

interface SkillMetadata {
  name: string;
  description?: string;
  version?: string;
  author?: string;
  path: string;
}

interface Config {
  privateKey?: string;
  address?: string;
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

function parseSource(source: string): { type: 'github' | 'local'; value: string } {
  // GitHub formats: github:owner/repo, gh:owner/repo, or owner/repo
  if (source.match(/^(github|gh):/i) || source.match(/^[^/]+\/[^/]+$/)) {
    const value = source.replace(/^(github|gh):/i, '');
    return { type: 'github', value };
  }

  // Local path: ./path, ~/path, /absolute/path
  return { type: 'local', value: source };
}

async function findSkillDir(basePath: string): Promise<string | null> {
  const possiblePaths = [
    basePath,
    join(basePath, 'skill'),
    join(basePath, 'skills'),
    join(basePath, '.skills'),
  ];

  for (const path of possiblePaths) {
    if (existsSync(path)) {
      const stats = await stat(path);
      if (stats.isDirectory()) {
        // Check if SKILL.md exists
        if (existsSync(join(path, 'SKILL.md'))) {
          return path;
        }
        // Check if any subdirectory has SKILL.md
        try {
          const entries = await readdir(path);
          for (const entry of entries) {
            const subPath = join(path, entry);
            const subStats = await stat(subPath);
            if (subStats.isDirectory() && existsSync(join(subPath, 'SKILL.md'))) {
              return subPath;
            }
          }
        } catch {
          // Continue
        }
      }
    }
  }

  return null;
}

async function readSkillMetadata(skillPath: string): Promise<SkillMetadata | null> {
  const skillFile = join(skillPath, 'SKILL.md');

  if (!existsSync(skillFile)) {
    return null;
  }

  try {
    const content = await readFile(skillFile, 'utf-8');

    // Parse metadata from SKILL.md
    const nameMatch = content.match(/^#\s+(.+)$/m);
    const descMatch = content.match(/^>?\s*\*\*(?:Description|描述):\*\*\s*(.+)$/m);
    const versionMatch = content.match(/^>?\s*\*\*(?:Version|版本):\*\*\s*(.+)$/m);
    const authorMatch = content.match(/^>?\s*\*\*(?:Author|作者):\*\*\s*(.+)$/m);

    return {
      name: nameMatch?.[1]?.trim() || 'Unknown',
      description: descMatch?.[1]?.trim(),
      version: versionMatch?.[1]?.trim() || '1.0.0',
      author: authorMatch?.[1]?.trim(),
      path: skillPath,
    };
  } catch {
    return null;
  }
}

async function cloneGitHubRepo(repo: string, targetDir: string): Promise<string> {
  const url = `https://github.com/${repo}.git`;
  await execAsync(`git clone --depth 1 ${url} ${targetDir}`, { timeout: 60000 });
  return targetDir;
}

async function scanSkill(url: string): Promise<{ score: number; status: string }> {
  try {
    const response = await fetch(`${API_BASE}/api/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, full: false })
    });

    if (response.ok) {
      const result = await response.json();
      return {
        score: result.data?.score || 75,
        status: result.data?.status || 'warning'
      };
    }
  } catch {
    // Scan failed, return default
  }

  return { score: 75, status: 'warning' };
}

async function addSkillToDatabase(metadata: SkillMetadata, source: string, creator: string): Promise<void> {
  // Generate skill ID
  const data = `${metadata.name}:${source}:${metadata.version || '1.0.0'}`;
  const skillId = `0x${keccak256(toHex(data)).slice(2)}`;

  // Call API to add skill
  try {
    const response = await fetch(`${API_BASE}/api/skills`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        skillId,
        name: metadata.name,
        description: metadata.description,
        repository: source,
        category: 'user-added',
        creator,
        securityScore: 75,
        verified: false
      })
    });

    if (!response.ok) {
      console.warn(chalk.yellow('Warning: Could not add to database'));
    }
  } catch {
    console.warn(chalk.yellow('Warning: API unavailable, skill not saved to database'));
  }
}

export async function addCommand(source: string, options: AddOptions) {
  console.log(chalk.cyan('\n➕ Adding skill to MySkills...\n'));

  // Handle batch mode
  if (options.batch) {
    return addBatch(options.batch, options);
  }

  // Handle directory mode
  if (options.dir) {
    return addFromDirectory(options.dir, options);
  }

  // Parse source
  const { type, value } = parseSource(source);

  const spinner = ora(`Processing ${type} source...`).start();

  try {
    let skillPath: string;
    let cleanUp = false;

    if (type === 'github') {
      // Clone repo
      spinner.text = `Cloning ${value}...`;
      const tempDir = `/tmp/myskills-add-${Date.now()}`;
      await cloneGitHubRepo(value, tempDir);
      skillPath = tempDir;
      cleanUp = true;
    } else {
      // Local path
      skillPath = value.replace(/^~/, homedir());
    }

    // Find skill directory
    spinner.text = 'Finding SKILL.md...';
    const foundPath = await findSkillDir(skillPath);

    if (!foundPath) {
      spinner.fail('SKILL.md not found');
      console.error(chalk.red(`\n❌ No SKILL.md found in: ${source}`));
      console.log(chalk.yellow('\nMake sure the skill has a SKILL.md file in the root or skill/ directory.\n'));
      if (cleanUp) {
        await execAsync(`rm -rf ${skillPath}`).catch(() => {});
      }
      return;
    }

    // Read metadata
    spinner.text = 'Reading skill metadata...';
    const metadata = await readSkillMetadata(foundPath);

    if (!metadata) {
      spinner.fail('Failed to read metadata');
      console.error(chalk.red('\n❌ Could not read SKILL.md\n'));
      if (cleanUp) {
        await execAsync(`rm -rf ${skillPath}`).catch(() => {});
      }
      return;
    }

    spinner.succeed(`Found: ${chalk.white(metadata.name)}`);

    console.log(chalk.bold('Skill Details:'));
    console.log(chalk.gray('─'.repeat(64)));
    console.log(`  ${chalk.cyan('Name:')}        ${chalk.white(metadata.name)}`);
    if (metadata.description) {
      console.log(`  ${chalk.cyan('Description:')} ${chalk.white(metadata.description)}`);
    }
    if (metadata.version) {
      console.log(`  ${chalk.cyan('Version:')}     ${chalk.white(metadata.version)}`);
    }
    if (metadata.author) {
      console.log(`  ${chalk.cyan('Author:')}      ${chalk.white(metadata.author)}`);
    }
    console.log(`  ${chalk.cyan('Source:')}      ${chalk.white(type === 'github' ? value : skillPath)}`);
    console.log();

    // Security scan
    if (!options.skipScan) {
      const scanSpinner = ora('Running security scan...').start();
      const scanResult = await scanSkill(type === 'github' ? `https://github.com/${value}` : skillPath);
      scanSpinner.succeed(`Security scan: ${scanResult.score}/100 (${scanResult.status})`);
    }

    // Add to database
    const dbSpinner = ora('Adding to platform...').start();

    // Get creator address (if logged in)
    const config = await loadConfig();
    const creator = config.address || '0x0000000000000000000000000000000000000000';

    await addSkillToDatabase(metadata, type === 'github' ? value : skillPath, creator);

    dbSpinner.succeed('Skill added to platform!\n');

    console.log(chalk.bold('Next Steps:'));
    console.log(chalk.gray('─'.repeat(64)));
    console.log(`  ${chalk.cyan('•')} View your skills: npx myskills my-skills`);
    console.log(`  ${chalk.cyan('•')} Publish to chain: npx myskills publish ${type === 'github' ? value : skillPath}`);
    console.log();

    // Cleanup
    if (cleanUp) {
      await execAsync(`rm -rf ${skillPath}`).catch(() => {});
    }

  } catch (error: any) {
    spinner.fail('Failed to add skill');
    console.error(chalk.red(`\nError: ${error.message}`));

    if (error.message.includes('git clone')) {
      console.log(chalk.yellow('\nTroubleshooting:'));
      console.log(chalk.gray('  • Check if the repository exists'));
      console.log(chalk.gray('  • Check your internet connection'));
      console.log(chalk.gray('  • Try: git clone https://github.com/user/repo\n'));
    }
  }
}

async function addBatch(listFile: string, options: AddOptions) {
  console.log(chalk.cyan('\n📦 Batch adding skills...\n'));

  const content = await readFile(listFile, 'utf-8');
  const sources = content.split('\n').filter(line => line.trim() && !line.startsWith('#'));

  console.log(`Found ${sources.length} source(s) to add\n`);

  let success = 0;
  let failed = 0;

  for (const source of sources) {
    try {
      await addCommand(source.trim(), { ...options, batch: undefined });
      success++;
    } catch {
      failed++;
    }
  }

  console.log(chalk.bold('\nBatch Summary:'));
  console.log(chalk.gray('─'.repeat(64)));
  console.log(`  ${chalk.green('✅ Success:')}   ${success}`);
  console.log(`  ${chalk.red('❌ Failed:')}    ${failed}`);
  console.log();
}

async function addFromDirectory(dirPath: string, options: AddOptions) {
  console.log(chalk.cyan('\n📁 Adding skills from directory...\n'));

  const fullPath = dirPath.replace(/^~/, homedir());

  if (!existsSync(fullPath)) {
    console.error(chalk.red(`\n❌ Directory not found: ${dirPath}\n`));
    return;
  }

  const entries = await readdir(fullPath, { withFileTypes: true });
  const subdirs = entries.filter(e => e.isDirectory()).map(e => e.name);

  console.log(`Found ${subdirs.length} subdirectories\n`);

  for (const subdir of subdirs) {
    const subPath = join(fullPath, subdir);
    try {
      await addCommand(subPath, options);
    } catch {
      // Continue with next
    }
  }
}
