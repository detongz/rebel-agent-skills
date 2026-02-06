/**
 * Skills API - Interface with Agent Reward Hub backend
 */

import axios from 'axios';

export interface Skill {
  id: number;
  skill_id: string;
  name: string;
  description: string;
  platform: string;
  version: string;
  creator_address: string;
  payment_address: string;
  repository?: string;
  homepage?: string;
  npm_package?: string;
  total_tips: string;
  tip_count: number;
  platform_likes: number;
  github_stars: number;
  github_forks: number;
  download_count: number;
  rank_tips?: number;
  rank_likes?: number;
  tags: string[] | string;
  created_at: string;
}

/**
 * Generate a unique Skill ID from name, version, and platform
 */
export function generateSkillId(name: string, version: string, platform: string): string {
  const crypto = require('crypto');
  const data = `${name}:${version}:${platform}`;
  return '0x' + crypto.createHash('sha256').update(data).digest('hex').slice(0, 64);
}

/**
 * Create a new Skill
 */
export async function createSkill(
  skillId: string,
  data: any,
  apiBase: string
): Promise<{ id: number; skill_id: string }> {
  const response = await axios.post(`${apiBase}/api/skills`, {
    skill_id: skillId,
    ...data,
  });

  return response.data;
}

/**
 * Get a single Skill by ID
 */
export async function getSkill(skillId: string, apiBase: string): Promise<Skill> {
  // Try by numeric ID first, then by skill_id
  try {
    const response = await axios.get(`${apiBase}/api/skills/${skillId}`);
    return response.data.skill;
  } catch (error) {
    throw new Error(`Skill not found: ${skillId}`);
  }
}

/**
 * List all Skills with optional filtering
 */
export async function listSkills(
  apiBase: string,
  platform?: string,
  sort: string = 'tips',
  limit: number = 20
): Promise<Skill[]> {
  const params = new URLSearchParams();
  if (platform) params.set('platform', platform);
  if (sort) params.set('sort', sort);
  params.set('limit', limit.toString());

  const response = await axios.get(`${apiBase}/api/skills?${params.toString()}`);
  return response.data.skills || [];
}

/**
 * Get creator statistics
 */
export async function getCreatorStats(address: string, apiBase: string): Promise<any> {
  const response = await axios.get(`${apiBase}/api/creator/${address}/stats`);
  return response.data;
}

/**
 * Sync GitHub statistics for a Skill
 */
export async function syncGithubStats(
  skillId: string | null,
  apiBase: string
): Promise<{ name: string; stars: number; forks: number }[]> {
  const url = skillId
    ? `${apiBase}/api/sync-github/stats?skill_id=${skillId}`
    : `${apiBase}/api/sync-github/stats`;

  const response = await axios.post(url);

  if (skillId) {
    return [response.data];
  }

  return response.data.results || [];
}
