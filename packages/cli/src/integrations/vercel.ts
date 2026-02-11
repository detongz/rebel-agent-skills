/**
 * Vercel Skills Integration (npx skills)
 *
 * Wraps the Vercel skills CLI to search and install skills
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface VercelSkill {
  name: string;
  description: string;
  repo: string;
  path?: string;
}

export async function vercelSearch(query: string): Promise<VercelSkill[]> {
  try {
    // Try using npx skills command
    const { stdout } = await execAsync(
      `npx skills find ${query}`,
      { timeout: 30000 }
    );

    return parseVercelOutput(stdout);
  } catch (error) {
    console.error('Failed to call npx skills:', error);
    return [];
  }
}

export async function vercelAddSkill(repo: string): Promise<boolean> {
  try {
    const { stdout } = await execAsync(
      `npx skills add ${repo}`,
      { timeout: 60000 }
    );

    console.log(stdout);
    return true;
  } catch (error) {
    console.error('Failed to add skill:', error);
    return false;
  }
}

export async function vercelList(): Promise<VercelSkill[]> {
  try {
    const { stdout } = await execAsync(
      'npx skills list',
      { timeout: 15000 }
    );

    return parseVercelListOutput(stdout);
  } catch (error) {
    console.error('Failed to list skills:', error);
    return [];
  }
}

function parseVercelOutput(output: string): VercelSkill[] {
  // TODO: Parse actual npx skills output
  return [
    {
      name: 'test-generator',
      description: 'Generate unit tests automatically',
      repo: 'vercel-labs/agent-skills',
      path: 'test-generator'
    }
  ];
}

function parseVercelListOutput(output: string): VercelSkill[] {
  // TODO: Parse actual list output
  return [];
}
