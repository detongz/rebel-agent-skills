/**
 * Register Command - Register a new Agent Skill
 */

import chalk from 'chalk';
import ora, { Ora } from 'ora';
import { createSkill, generateSkillId } from '../lib/skills.js';
import { validateAddress, validatePlatform, validateRepoUrl } from '../lib/validate.js';

interface RegisterOptions {
  name?: string;
  description?: string;
  platform?: string;
  version?: string;
  repository?: string;
  homepage?: string;
  npmPackage?: string;
  wallet?: string;
  interactive?: boolean;
}

export async function registerCommand(options: RegisterOptions): Promise<void> {
  console.log('');
  console.log(chalk.bold.cyan('┌─────────────────────────────────────────────────────────┐'));
  console.log(chalk.bold.cyan('│') + '  ' + chalk.bold.white('Register New Agent Skill') + '                           ');
  console.log(chalk.bold.cyan('└─────────────────────────────────────────────────────────┘'));
  console.log('');

  const API_BASE = process.env.API_BASE || 'http://localhost:3001';

  // Interactive mode or CLI args
  let skillData: {
    name: string;
    description: string;
    platform: string;
    version: string;
    repository?: string;
    homepage?: string;
    npm_package?: string;
    payment_address: string;
  };

  if (options.interactive) {
    // Interactive mode prompts would go here
    console.log(chalk.yellow('Interactive mode coming soon! Please use CLI flags for now.'));
    return;
  }

  // Validate required fields
  if (!options.name) {
    console.error(chalk.red('✖ Skill name is required (use --name)'));
    process.exit(1);
  }

  if (!options.platform) {
    console.error(chalk.red('✖ Platform is required (use --platform)'));
    console.log(chalk.gray('  Available platforms: coze, claude-code, manus, minimax'));
    process.exit(1);
  }

  if (!options.wallet) {
    console.error(chalk.red('✖ Payment wallet address is required (use --wallet)'));
    process.exit(1);
  }

  // Validate inputs
  const spinner = ora('Validating inputs...').start();

  try {
    if (!validatePlatform(options.platform)) {
      spinner.fail(chalk.red('Invalid platform'));
      process.exit(1);
    }

    if (!validateAddress(options.wallet)) {
      spinner.fail(chalk.red('Invalid wallet address'));
      process.exit(1);
    }

    if (options.repository && !validateRepoUrl(options.repository)) {
      spinner.fail(chalk.red('Invalid GitHub repository URL'));
      process.exit(1);
    }

    spinner.succeed(chalk.green('All inputs validated'));

  } catch (error: any) {
    spinner.fail(chalk.red('Validation failed: ' + error.message));
    process.exit(1);
  }

  // Generate skill ID
  console.log('');
  const skillIdSpinner = ora('Generating Skill ID...').start();
  const skillId = generateSkillId(options.name!, options.version!, options.platform!);
  skillIdSpinner.succeed(chalk.green('Skill ID: ' + chalk.bold(skillId)));

  // Prepare skill data
  skillData = {
    name: options.name!,
    description: options.description || '',
    platform: options.platform!,
    version: options.version!,
    repository: options.repository,
    homepage: options.homepage,
    npm_package: options.npmPackage,
    payment_address: options.wallet!,
  };

  // Display summary
  console.log('');
  console.log(chalk.bold('📋 Skill Summary:'));
  console.log(chalk.gray('─'.repeat(60)));
  console.log(chalk.white('  Name:           ') + chalk.cyan(skillData.name));
  console.log(chalk.white('  Platform:       ') + chalk.cyan(skillData.platform));
  console.log(chalk.white('  Version:        ') + chalk.cyan(skillData.version));
  console.log(chalk.white('  Payment Addr:   ') + chalk.cyan(skillData.payment_address));
  if (skillData.repository) {
    console.log(chalk.white('  Repository:     ') + chalk.cyan(skillData.repository!));
  }
  if (skillData.npm_package) {
    console.log(chalk.white('  npm Package:    ') + chalk.cyan(skillData.npm_package!));
  }
  console.log(chalk.gray('─'.repeat(60)));
  console.log('');

  // Register skill
  const registerSpinner = ora('Registering Skill on Agent Reward Hub...').start();

  try {
    const result = await createSkill(skillId, skillData, API_BASE);
    registerSpinner.succeed(chalk.green('Skill registered successfully!'));

    console.log('');
    console.log(chalk.bold.green('✨ Skill Created!'));
    console.log('');
    console.log(chalk.white('  Your Skill is now live on Agent Reward Hub!'));
    console.log(chalk.white('  View it at: ') + chalk.cyan(`${API_BASE}/skill/${result.id}`));
    console.log('');
    console.log(chalk.yellow('  🎁 Don\'t forget: Creating a Skill earns you 500 ASKL!'));
    console.log('');

  } catch (error: any) {
    registerSpinner.fail(chalk.red('Registration failed'));
    console.error(chalk.red('Error: ') + error.message);
    process.exit(1);
  }
}
