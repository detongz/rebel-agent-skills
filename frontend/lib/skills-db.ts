/**
 * Skills Database - Hybrid storage (on-chain + off-chain)
 *
 * On-chain: skillId -> creator mapping (verified, tamper-proof)
 * Off-chain: Full skill details (JSON file for MVP, upgrade to DB later)
 */

import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

const DB_DIR = join(process.cwd(), 'data');
const SKILLS_FILE = join(DB_DIR, 'skills.json');

export interface DependencyInfo {
  name: string;
  version: string;
  type: 'runtime' | 'development' | 'peer';
  isSkill?: boolean;
}

export interface Skill {
  id: string;           // keccak256 hash
  name: string;
  description?: string;
  repository: string;   // GitHub URL
  category: string;
  creator: string;      // Wallet address
  securityScore: number;
  totalTips: string;    // Wei amount
  publishedAt: string;  // ISO timestamp
  txHash?: string;      // Registration transaction
  verified: boolean;    // Verified on-chain
  dependencies?: DependencyInfo[]; // Extracted dependencies
}

export interface PublishRecord {
  url: string;
  name: string;
  category: string;
  creator: string;
  plan: 'single' | 'subscription';
  status: 'pending' | 'paid' | 'published' | 'failed';
  createdAt: string;
  paymentId?: string;
  skillId?: string;
  txHash?: string;
}

interface SkillsDatabase {
  skills: Skill[];
  publications: PublishRecord[];
  subscriptions: Record<string, { active: boolean; expiresAt: string }>;
  dependencyGraph: SkillDependency[];  // NEW: skill-to-skill dependencies
}

export interface SkillDependency {
  sourceSkillId: string;  // The skill that has this dependency
  targetSkillName: string; // The name of the skill being depended on
  packageName: string;    // The npm package name
  version: string;
  type: 'runtime' | 'development' | 'peer';
  discoveredAt: string;
}

async function ensureDb(): Promise<SkillsDatabase> {
  if (!existsSync(DB_DIR)) {
    await mkdir(DB_DIR, { recursive: true });
  }

  if (!existsSync(SKILLS_FILE)) {
    const initial: SkillsDatabase = {
      skills: [],
      publications: [],
      subscriptions: {},
      dependencyGraph: []
    };
    await writeFile(SKILLS_FILE, JSON.stringify(initial, null, 2));
    return initial;
  }

  try {
    const content = await readFile(SKILLS_FILE, 'utf-8');
    return JSON.parse(content);
  } catch {
    // Corrupted file, recreate
    const initial: SkillsDatabase = {
      skills: [],
      publications: [],
      subscriptions: {},
      dependencyGraph: []
    };
    await writeFile(SKILLS_FILE, JSON.stringify(initial, null, 2));
    return initial;
  }
}

async function saveDb(db: SkillsDatabase): Promise<void> {
  await writeFile(SKILLS_FILE, JSON.stringify(db, null, 2));
}

// ============ Skills ============

export async function getSkills(options?: {
  creator?: string;
  category?: string;
  limit?: number;
}): Promise<Skill[]> {
  const db = await ensureDb();
  let skills = [...db.skills];

  if (options?.creator) {
    skills = skills.filter(s => s.creator.toLowerCase() === options.creator!.toLowerCase());
  }

  if (options?.category) {
    skills = skills.filter(s => s.category === options.category);
  }

  // Sort by tips (descending)
  skills.sort((a, b) => {
    const tipsA = BigInt(a.totalTips || '0');
    const tipsB = BigInt(b.totalTips || '0');
    return tipsB > tipsA ? 1 : -1;
  });

  if (options?.limit) {
    skills = skills.slice(0, options.limit);
  }

  return skills;
}

export async function getSkillById(id: string): Promise<Skill | null> {
  const db = await ensureDb();
  return db.skills.find(s => s.id === id) || null;
}

export async function createSkill(skill: Omit<Skill, 'id' | 'totalTips' | 'publishedAt'> & { id?: string }): Promise<Skill> {
  const db = await ensureDb();

  const newSkill: Skill = {
    id: skill.id || generateSkillId(skill.name, skill.repository, skill.creator),
    name: skill.name,
    description: skill.description,
    repository: skill.repository,
    category: skill.category,
    creator: skill.creator,
    securityScore: skill.securityScore,
    totalTips: '0',
    publishedAt: new Date().toISOString(),
    txHash: skill.txHash,
    verified: skill.verified || false
  };

  db.skills.push(newSkill);
  await saveDb(db);

  return newSkill;
}

export async function updateSkillTips(skillId: string, tipsAmount: string): Promise<void> {
  const db = await ensureDb();
  const skill = db.skills.find(s => s.id === skillId);

  if (skill) {
    const currentTips = BigInt(skill.totalTips || '0');
    const newTips = currentTips + BigInt(tipsAmount);
    skill.totalTips = newTips.toString();
    await saveDb(db);
  }
}

// ============ Publications ============

export async function createPublication(record: Omit<PublishRecord, 'createdAt' | 'status'>): Promise<PublishRecord> {
  const db = await ensureDb();

  const newRecord: PublishRecord = {
    ...record,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  db.publications.push(newRecord);
  await saveDb(db);

  return newRecord;
}

export async function getPublicationById(id: string): Promise<PublishRecord | null> {
  const db = await ensureDb();
  return db.publications.find(p => p.paymentId === id || p.skillId === id) || null;
}

export async function updatePublicationStatus(
  id: string,
  status: PublishRecord['status'],
  updates?: Partial<PublishRecord>
): Promise<void> {
  const db = await ensureDb();
  const index = db.publications.findIndex(p => p.paymentId === id);

  if (index !== -1) {
    db.publications[index].status = status;
    if (updates) {
      Object.assign(db.publications[index], updates);
    }
    await saveDb(db);
  }
}

// ============ Subscriptions ============

export async function hasActiveSubscription(address: string): Promise<boolean> {
  const db = await ensureDb();
  const sub = db.subscriptions[address.toLowerCase()];

  if (!sub || !sub.active) {
    return false;
  }

  // Check if expired
  const expiresAt = new Date(sub.expiresAt);
  return expiresAt > new Date();
}

export async function activateSubscription(address: string, duration: 'month' | 'year'): Promise<void> {
  const db = await ensureDb();

  const now = new Date();
  const expiresAt = new Date(now);

  if (duration === 'month') {
    expiresAt.setMonth(expiresAt.getMonth() + 1);
  } else {
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);
  }

  db.subscriptions[address.toLowerCase()] = {
    active: true,
    expiresAt: expiresAt.toISOString()
  };

  await saveDb(db);
}

// ============ Helpers ============

function generateSkillId(name: string, repo: string, creator: string): string {
  // Simulate keccak256 hash (client-side)
  // In production, this should match the on-chain skillId
  const data = `${name}:${repo}:${creator}:v1.0.0`;

  // Simple hash for MVP (replace with actual keccak256 in production)
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  return '0x' + Math.abs(hash).toString(16).padStart(64, '0');
}

// ============ Pricing ============

export const PRICING = {
  single: {
    amount: '5000000',      // $5 USDC (6 decimals)
    currency: 'USDC'
  },
  subscription: {
    monthly: {
      amount: '49000000',   // $49 USDC
      currency: 'USDC'
    },
    yearly: {
      amount: '490000000',  // $490 USDC
      currency: 'USDC'
    }
  }
};

// ============ Skill Dependencies ============

/**
 * Store skill dependencies extracted from package.json
 */
export async function addSkillDependencies(
  skillId: string,
  dependencies: DependencyInfo[]
): Promise<void> {
  const db = await ensureDb();

  // Filter for skill-related dependencies
  const skillDeps = dependencies.filter(dep => dep.isSkill);

  for (const dep of skillDeps) {
    // Check if dependency already exists
    const exists = db.dependencyGraph.some(
      d => d.sourceSkillId === skillId && d.packageName === dep.name
    );

    if (!exists) {
      db.dependencyGraph.push({
        sourceSkillId: skillId,
        targetSkillName: dep.name,
        packageName: dep.name,
        version: dep.version,
        type: dep.type,
        discoveredAt: new Date().toISOString()
      });
    }
  }

  await saveDb(db);
}

/**
 * Get skill dependency graph for visualization
 */
export async function getSkillDependencyGraph(): Promise<{
  nodes: Array<{ id: string; name: string; category: string }>;
  links: Array<{ source: string; target: string; type: string }>;
}> {
  const db = await ensureDb();
  const nodes = new Map<string, { id: string; name: string; category: string }>();
  const links: Array<{ source: string; target: string; type: string }> = [];

  // Add all skills as nodes
  for (const skill of db.skills) {
    nodes.set(skill.id, {
      id: skill.id,
      name: skill.name,
      category: skill.category
    });
  }

  // Build links from dependency graph
  for (const dep of db.dependencyGraph) {
    const sourceSkill = db.skills.find(s => s.id === dep.sourceSkillId);
    const targetSkill = db.skills.find(s =>
      s.name === dep.targetSkillName ||
      s.repository.includes(dep.targetSkillName)
    );

    if (sourceSkill && targetSkill) {
      // Add target node if not exists
      if (!nodes.has(targetSkill.id)) {
        nodes.set(targetSkill.id, {
          id: targetSkill.id,
          name: targetSkill.name,
          category: targetSkill.category
        });
      }

      links.push({
        source: dep.sourceSkillId,
        target: targetSkill.id,
        type: 'depends-on'
      });
    }
  }

  return {
    nodes: Array.from(nodes.values()),
    links
  };
}

/**
 * Find skills that depend on a given skill
 */
export async function getDependentSkills(skillId: string): Promise<Skill[]> {
  const db = await ensureDb();
  const dependentIds = db.dependencyGraph
    .filter(d => {
      const targetSkill = db.skills.find(s =>
        s.id === skillId ||
        s.name === d.targetSkillName
      );
      return targetSkill !== undefined;
    })
    .map(d => d.sourceSkillId);

  return db.skills.filter(s => dependentIds.includes(s.id));
}

/**
 * Find skills that a given skill depends on
 */
export async function getSkillDependencies(skillId: string): Promise<Skill[]> {
  const db = await ensureDb();
  const deps = db.dependencyGraph.filter(d => d.sourceSkillId === skillId);

  const dependentSkills: Skill[] = [];
  for (const dep of deps) {
    const skill = db.skills.find(s =>
      s.id === skillId ||
      s.name === dep.targetSkillName ||
      s.repository.includes(dep.targetSkillName)
    );
    if (skill) {
      dependentSkills.push(skill);
    }
  }

  return dependentSkills;
}
