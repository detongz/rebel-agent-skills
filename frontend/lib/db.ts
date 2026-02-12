// lib/db.ts - SQLite 数据库初始化
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbDir = path.join(process.cwd(), 'data');
const dbPath = path.join(dbDir, 'agent-reward.db');

// 确保 data 目录存在
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// 创建数据库连接
const db = new Database(dbPath);

// 启用外键约束
db.pragma('foreign_keys = ON');

// 初始化表结构
function initDatabase() {
  // 检查表是否已存在
  const tableExists = db.prepare(`
    SELECT name FROM sqlite_master
    WHERE type='table' AND name='skills'
  `).get();

  if (tableExists) {
    console.log('✅ 数据库已存在，跳过初始化');
  } else {
    const schemaPath = path.join(process.cwd(), '..', 'database', 'schema.sqlite.sql');
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, 'utf-8');
      db.exec(schema);
      console.log('✅ 数据库初始化完成');
    } else {
      console.warn('⚠️ 未找到 schema.sqlite.sql，使用默认表结构');
      // 简化的表结构
      db.exec(`
        CREATE TABLE IF NOT EXISTS skills (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          skill_id TEXT NOT NULL UNIQUE,
          name TEXT NOT NULL,
          description TEXT NOT NULL,
          platform TEXT NOT NULL,
          version TEXT DEFAULT '1.0.0',
          creator_address TEXT NOT NULL,
          payment_address TEXT NOT NULL,
          npm_package TEXT,
          repository TEXT,
          homepage TEXT,
          download_count INTEGER DEFAULT 0,
          github_stars INTEGER DEFAULT 0,
          github_forks INTEGER DEFAULT 0,
          total_tips TEXT DEFAULT '0',
          tip_count INTEGER DEFAULT 0,
          platform_likes INTEGER DEFAULT 0,
          logo_url TEXT,
          tags TEXT,
          status TEXT DEFAULT 'active',
          created_at TEXT DEFAULT (datetime('now')),
          updated_at TEXT DEFAULT (datetime('now')),
          stats_updated_at TEXT
        );
      `);
    }
  }

  // 初始化 agents 和 agent_evaluations 表
  initAgentTables();

  // 自动加载种子数据（如果表为空）
  seedDatabaseIfEmpty();
}

// 加载种子数据
async function seedDatabaseIfEmpty() {
  const countResult = db.prepare('SELECT COUNT(*) as count FROM skills').get() as { count: number };

  if (countResult.count === 0) {
    console.log('🌱 数据库为空，开始加载种子数据...');
    try {
      const { getSeedSkills } = await import('./seed-skills');
      const seedSkills = getSeedSkills();

      const insert = db.prepare(`
        INSERT INTO skills (
          skill_id, transaction_hash, name, description, platform, version,
          creator_address, payment_address, npm_package,
          repository, homepage, download_count,
          github_stars, github_forks, total_tips,
          tip_count, platform_likes, logo_url, tags,
          status, created_at, updated_at, stats_updated_at
        ) VALUES (?, NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'), NULL)
      `);

      const insertMany = db.transaction((skills: any[]) => {
        for (const skill of skills) {
          insert.run(
            skill.skill_id,
            skill.name,
            skill.description,
            skill.platform,
            skill.version || '1.0.0',
            skill.creator_address || skill.creator,
            skill.payment_address,
            skill.npm_package,
            skill.repository,
            skill.homepage,
            skill.download_count || 0,
            skill.github_stars || skill.stars || 0,
            skill.github_forks || 0,
            skill.total_tips || '0',
            skill.tip_count || 0,
            skill.platform_likes || 0,
            skill.logo_url,
            skill.tags ? skill.tags.join(',') : null,
            skill.status || 'active'
          );
        }
      });

      insertMany(seedSkills);
      console.log(`✅ 成功加载 ${seedSkills.length} 条种子数据`);
    } catch (error) {
      console.error('❌ 加载种子数据失败:', error);
    }
  } else {
    console.log(`✅ 数据库已有 ${countResult.count} 条数据`);
  }
}

// 初始化 agent 评估系统表
function initAgentTables() {
  const agentsTableExists = db.prepare(`
    SELECT name FROM sqlite_master
    WHERE type='table' AND name='agents'
  `).get();

  if (!agentsTableExists) {
    const migrationPath = path.join(process.cwd(), '..', 'database', 'migrations', '002_agents_evaluations.sql');
    if (fs.existsSync(migrationPath)) {
      const migration = fs.readFileSync(migrationPath, 'utf-8');
      db.exec(migration);
      console.log('✅ Agent evaluation tables initialized');
    } else {
      console.warn('⚠️ 未找到 agents migration，创建默认表结构');
      db.exec(`
        CREATE TABLE IF NOT EXISTS agents (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          avatar_url TEXT,
          wallet_address TEXT NOT NULL UNIQUE,
          platform TEXT NOT NULL CHECK(platform IN ('coze', 'claude-code', 'manus', 'minimax')),
          skills_count INTEGER DEFAULT 0,
          total_earnings TEXT DEFAULT '0',
          reviews_given INTEGER DEFAULT 0,
          average_rating REAL DEFAULT 0,
          total_compute_used INTEGER DEFAULT 0,
          created_at TEXT DEFAULT (datetime('now')),
          updated_at TEXT DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS agent_evaluations (
          id TEXT PRIMARY KEY,
          evaluator_wallet TEXT NOT NULL,
          target_agent_id TEXT NOT NULL,
          code_quality REAL NOT NULL CHECK(code_quality BETWEEN 1 AND 5),
          response_speed REAL NOT NULL CHECK(response_speed BETWEEN 1 AND 5),
          accuracy REAL NOT NULL CHECK(accuracy BETWEEN 1 AND 5),
          helpfulness REAL NOT NULL CHECK(helpfulness BETWEEN 1 AND 5),
          overall_rating REAL NOT NULL CHECK(overall_rating BETWEEN 1 AND 5),
          comment TEXT,
          recommend INTEGER DEFAULT 0 CHECK(recommend IN (0, 1)),
          created_at TEXT DEFAULT (datetime('now')),
          updated_at TEXT DEFAULT (datetime('now')),
          FOREIGN KEY (target_agent_id) REFERENCES agents(id) ON DELETE CASCADE,
          UNIQUE(evaluator_wallet, target_agent_id)
        );

        CREATE INDEX IF NOT EXISTS idx_agent_evaluations_evaluator ON agent_evaluations(evaluator_wallet);
        CREATE INDEX IF NOT EXISTS idx_agent_evaluations_target ON agent_evaluations(target_agent_id);
        CREATE INDEX IF NOT EXISTS idx_agent_evaluations_rating ON agent_evaluations(overall_rating);
      `);
    }
  } else {
    console.log('✅ Agent tables already exist');
  }

  // Create index for github_stars to optimize hot skills queries
  const starsIndexExists = db.prepare(`
    SELECT name FROM sqlite_master
    WHERE type='index' AND name='idx_skills_github_stars'
  `).get() as { name: string } | undefined;

  if (!starsIndexExists) {
    db.exec('CREATE INDEX IF NOT EXISTS idx_skills_github_stars ON skills(github_stars DESC);');
    console.log('✅ Created index for github_stars (hot skills optimization)');
  }
}

// 首次运行时初始化
initDatabase();

export default db;

// 工具函数
export function generateSkillId(name: string, version: string, platform: string): string {
  const crypto = require('crypto');
  const data = `${name}:${version}:${platform}`;
  return '0x' + crypto.createHash('sha256').update(data).digest('hex');
}

export function shortenAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatNumber(num: number | string): string {
  const n = typeof num === 'string' ? parseFloat(num) : num;
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}
