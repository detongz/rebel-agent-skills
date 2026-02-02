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
