/**
 * ClawHub Integration
 *
 * Wraps the clawhub CLI to search and install skills
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface ClawHubSkill {
  slug: string;
  name: string;
  description: string;
  author: string;
  version: string;
  stars?: number;
}

export async function clawhubSearch(query: string): Promise<ClawHubSkill[]> {
  try {
    const { stdout, stderr } = await execAsync(
      `npx clawhub@latest search ${query}`,
      { timeout: 30000 }
    );

    if (stderr && !stderr.includes('warn')) {
      console.error('ClawHub error:', stderr);
    }

    // Parse clawhub output
    // Expected format is something like:
    // slug    name    description    author    version
    // We'll need to parse this

    // For now, return mock data since we can't test without actual clawhub
    return parseClawHubOutput(stdout);
  } catch (error) {
    console.error('Failed to call clawhub:', error);
    return [];
  }
}

export async function clawhubInstall(slug: string): Promise<boolean> {
  try {
    const { stdout, stderr } = await execAsync(
      `npx clawhub@latest install ${slug}`,
      { timeout: 60000 }
    );

    console.log(stdout);
    return true;
  } catch (error) {
    console.error('Failed to install from clawhub:', error);
    return false;
  }
}

export async function clawhubInspect(slug: string): Promise<any> {
  try {
    const { stdout } = await execAsync(
      `npx clawhub@latest inspect ${slug} --no-input`,
      { timeout: 15000 }
    );

    return parseClawHubInspect(stdout);
  } catch (error) {
    console.error('Failed to inspect clawhub skill:', error);
    return null;
  }
}

function parseClawHubOutput(output: string): ClawHubSkill[] {
  // TODO: Parse actual clawhub output format
  // For now return mock data
  return [
    {
      slug: 'solidity-auditor',
      name: 'Solidity Auditor',
      description: 'Smart contract security audit',
      author: '0x123...456',
      version: '1.0.0',
      stars: 42
    }
  ];
}

function parseClawHubInspect(output: string): any {
  // TODO: Parse actual inspect output
  return {
    slug: 'solidity-auditor',
    name: 'Solidity Auditor',
    description: '...',
    files: ['SKILL.md', 'index.ts']
  };
}
