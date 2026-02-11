/**
 * Scan command - Security scan via unified API
 *
 * Calls /api/scan endpoint for:
 * - Free tier: Basic code pattern detection
 * - Paid tier: VirusTotal API integration (TODO)
 */

import chalk from 'chalk';
import ora from 'ora';

const API_BASE = process.env.MYSKILLS_API_BASE || 'http://localhost:3000';

interface ScanOptions {
  full: boolean;
  output: 'text' | 'json';
}

interface ScanResult {
  id: string;
  url: string;
  score: number;
  status: 'safe' | 'warning' | 'danger';
  vulnerabilities: number;
  warnings: string[];
  details: {
    codeAnalysis: {
      score: number;
      findings: string[];
    };
    dependencyCheck: {
      score: number;
      warnings: string[];
    };
  };
  createdAt: string;
}

interface ScanResponse {
  success: boolean;
  data: ScanResult;
  cached?: boolean;
  fullScan?: {
    available: boolean;
    message: string;
    estimatedCost: string;
    features: string[];
  };
}

export async function scanCommand(url: string, options: ScanOptions) {
  console.log(chalk.cyan(`\n🛡️  Scanning ${url}...\n`));

  const spinner = ora('Connecting to security service...').start();

  try {
    // Call unified API
    const apiUrl = new URL(`${API_BASE}/api/scan`);
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, full: options.full, output: options.output }),
    });

    spinner.text = 'Analyzing code...';

    if (!response.ok) {
      spinner.fail('Connection failed');
      console.error(chalk.red(`\n❌ API Error: ${response.status}`));
      console.log(chalk.gray('\nMake sure the frontend server is running:'));
      console.log(chalk.white('  cd frontend && npm run dev\n'));
      console.log(chalk.gray('Or set API base URL:'));
      console.log(chalk.white(`  export MYSKILLS_API_BASE=https://your-domain.com\n`));
      return;
    }

    const result: ScanResponse = await response.json();

    if (!result.success || !result.data) {
      spinner.fail('Scan failed');
      console.error(chalk.red(`\n❌ ${result.data ? 'Unknown error' : 'Scan failed'}`));
      return;
    }

    spinner.succeed('Scan complete!\n');

    displayResult(result.data, url, options);

    // Show full scan info if requested
    if (options.full && result.fullScan) {
      console.log(chalk.bold('\n🔬 Deep Scan Info:'));
      console.log(chalk.gray('─'.repeat(64)));
      console.log(`  ${chalk.yellow('Status:')} ${result.fullScan.available ? chalk.green('Available') : chalk.yellow('Coming Soon')}`);
      console.log(`  ${chalk.cyan('Message:')} ${result.fullScan.message}`);
      console.log(`  ${chalk.cyan('Cost:')} ${chalk.white(result.fullScan.estimatedCost)}`);
      console.log(`  ${chalk.cyan('Features:')}`);
      result.fullScan.features.forEach(f => console.log(`    • ${f}`));
      console.log();
    }

  } catch (error) {
    spinner.fail('Scan failed');
    console.error(chalk.red(`\n❌ ${error}`));
    console.log(chalk.gray('\nTroubleshooting:'));
    console.log(chalk.gray('  1. Make sure the frontend server is running'));
    console.log(chalk.gray('  2. Check API_BASE is correct'));
    console.log(chalk.gray('  3. Try: curl -X POST "' + apiUrl + '"\n'));
  }
}

function displayResult(result: ScanResult, url: string, options: ScanOptions) {
  if (options.output === 'json') {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  // Status banner
  const statusColor = result.status === 'safe' ? chalk.green : result.status === 'warning' ? chalk.yellow : chalk.red;
  const statusIcon = result.status === 'safe' ? '✅' : result.status === 'warning' ? '⚠️  ' : '🚨';

  console.log(chalk.bold('┌─────────────────────────────────────────────────────────────┐'));
  console.log(chalk.bold('│') + ' ' + statusIcon + ' SECURITY SCAN RESULTS' + '                                      ' + chalk.bold('│'));
  console.log(chalk.bold('├─────────────────────────────────────────────────────────────┤'));
  console.log(chalk.bold('│') + ' Target: ' + chalk.white(url.slice(0, 55)) + (url.length > 55 ? '...' : '') + ' '.repeat(Math.max(0, 56 - url.length)) + chalk.bold('│'));
  console.log(chalk.bold('│') + '                                                                      ' + chalk.bold('│'));
  console.log(chalk.bold('│') + ' Overall Score: ' + statusColor(result.score.toString().padStart(3)) + '/100           Status: ' + statusColor(result.status.toUpperCase().padEnd(7)) + ' ' + chalk.bold('│'));
  console.log(chalk.bold('│') + ' Vulnerabilities: ' + (result.vulnerabilities > 0 ? chalk.yellow(result.vulnerabilities.toString()) : chalk.green('0')) + '                                                    ' + chalk.bold('│'));
  console.log(chalk.bold('└─────────────────────────────────────────────────────────────┘'));
  console.log();

  // Detailed scores
  console.log(chalk.bold('Detailed Analysis:'));
  console.log(chalk.gray('─'.repeat(64)));

  console.log(`  ${chalk.cyan('Code Security:')}      ${chalk.white(result.details.codeAnalysis.score.toString() + '/100')} ${getScoreBar(result.details.codeAnalysis.score)}`);
  if (result.details.codeAnalysis.findings.length > 0) {
    result.details.codeAnalysis.findings.forEach(f => console.log(`    ${chalk.yellow('⚠')} ${f}`));
  }

  console.log(`  ${chalk.cyan('Dependencies:')}       ${chalk.white(result.details.dependencyCheck.score.toString() + '/100')} ${getScoreBar(result.details.dependencyCheck.score)}`);
  if (result.details.dependencyCheck.warnings.length > 0) {
    result.details.dependencyCheck.warnings.forEach(w => console.log(`    ${chalk.yellow('⚠')} ${w}`));
  }

  console.log();

  // Recommendations
  if (result.status !== 'safe') {
    console.log(chalk.bold('Recommendations:'));
    console.log(chalk.gray('─'.repeat(64)));

    if (result.status === 'danger') {
      console.log(`  ${chalk.red('✖')} This skill has critical security issues. Do NOT install.`);
    } else {
      console.log(`  ${chalk.yellow('⚠')} Review warnings above before installing.`);
    }
    console.log();
  }

  // Upgrade pitch
  console.log(chalk.bold('Want deeper security analysis?'));
  console.log(chalk.gray('─'.repeat(64)));
  console.log(`  ${chalk.cyan('•')} VirusTotal API integration`);
  console.log(`  ${chalk.cyan('•')} Full vulnerability database`);
  console.log(`  ${chalk.cyan('•')} Sandbox execution analysis`);
  console.log(`  ${chalk.white('Run:')} ${chalk.yellow('npx myskills scan --full <url>')}`);
  console.log();
}

function getScoreBar(score: number): string {
  const filled = Math.round(score / 10);
  const empty = 10 - filled;
  return '[' + chalk.green('█'.repeat(filled)) + chalk.gray('░'.repeat(empty)) + ']';
}
