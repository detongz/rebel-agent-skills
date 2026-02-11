/**
 * Install command - Install a skill via available methods
 *
 * Supports installation via:
 * - ClawHub (npx clawhub install)
 * - Vercel Skills (npx skills add)
 * - MySkills (after security scan)
 */

import chalk from 'chalk';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface InstallOptions {
  type: 'clawhub' | 'vercel' | 'auto';
}

export async function installCommand(skillIdentifier: string, options: InstallOptions) {
  console.log(chalk.cyan(`\n📦 Installing ${skillIdentifier}...\n`));

  try {
    // Auto-detect installation method
    if (options.type === 'auto') {
      options.type = detectInstallMethod(skillIdentifier);
    }

    let success = false;

    switch (options.type) {
      case 'clawhub':
        success = await installViaClawHub(skillIdentifier);
        break;
      case 'vercel':
        success = await installViaVercel(skillIdentifier);
        break;
    }

    if (success) {
      console.log(chalk.green('\n✅ Installation successful!\n'));
      console.log(chalk.gray('Next steps:'));
      console.log(chalk.gray(`  • Restart your AI agent to use the new skill\n`));
    } else {
      console.log(chalk.red('\n❌ Installation failed\n'));
      process.exit(1);
    }

  } catch (error) {
    console.error(chalk.red(`Error: ${error}`));
    process.exit(1);
  }
}

function detectInstallMethod(identifier: string): 'clawhub' | 'vercel' {
  // ClawHub skills are usually simple names (no slashes)
  if (!identifier.includes('/') && !identifier.includes('@')) {
    return 'clawhub';
  }

  // Vercel skills are GitHub repos (owner/repo)
  if (identifier.includes('/')) {
    return 'vercel';
  }

  // Default to clawhub
  return 'clawhub';
}

async function installViaClawHub(slug: string): Promise<boolean> {
  console.log(chalk.gray(`Installing via ClawHub...`));

  try {
    const { stdout, stderr } = await execAsync(
      `npx clawhub@latest install ${slug}`,
      { timeout: 60000 }
    );

    console.log(stdout);
    if (stderr && !stderr.includes('warn')) {
      console.error(chalk.yellow(stderr));
    }

    return true;
  } catch (error) {
    console.error(chalk.red(`ClawHub installation failed: ${error}`));
    console.log(chalk.gray('\nTry installing via Vercel:'));
    console.log(chalk.white(`  npx skills add ${slug}\n`));
    return false;
  }
}

async function installViaVercel(repo: string): Promise<boolean> {
  console.log(chalk.gray(`Installing via Vercel Skills...`));

  try {
    const { stdout, stderr } = await execAsync(
      `npx skills add ${repo}`,
      { timeout: 60000 }
    );

    console.log(stdout);
    if (stderr && !stderr.includes('warn')) {
      console.error(chalk.yellow(stderr));
    }

    return true;
  } catch (error) {
    console.error(chalk.red(`Vercel installation failed: ${error}`));
    console.log(chalk.gray('\nTry installing via ClawHub:'));
    console.log(chalk.white(`  npx clawhub@latest install ${repo}\n`));
    return false;
  }
}
