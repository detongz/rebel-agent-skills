-- Agent Reward Hub 数据库表结构
-- SQLite 版本（适用于开发阶段）

-- ============================================
-- 1. Skills 表（核心表）
-- ============================================

CREATE TABLE IF NOT EXISTS skills (
  -- 主键
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  -- 链上标识
  skill_id TEXT NOT NULL UNIQUE,          -- 链上 skillId (hex string)
  transaction_hash TEXT UNIQUE,           -- 注册交易的哈希

  -- 基本信息
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  platform TEXT NOT NULL,                 -- 'coze' | 'claude-code' | 'manus' | 'minimax'
  version TEXT DEFAULT '1.0.0',

  -- 收款相关（核心！）
  creator_address TEXT NOT NULL,          -- 创作者钱包地址
  payment_address TEXT NOT NULL,          -- 收款地址（可以和 creator 不同）

  -- 外部链接（阶段 1）
  npm_package TEXT,                       -- npm 包名
  repository TEXT,                        -- GitHub 仓库 URL
  homepage TEXT,                          -- 官网/文档 URL

  -- 统计数据（手动填写/缓存）
  download_count INTEGER DEFAULT 0,       -- 下载量展示
  github_stars INTEGER DEFAULT 0,         -- GitHub stars（缓存）
  github_forks INTEGER DEFAULT 0,         -- GitHub forks（缓存）

  -- 平台数据
  total_tips TEXT DEFAULT '0',            -- 累计打赏（存字符串避免精度问题）
  tip_count INTEGER DEFAULT 0,            -- 打赏次数
  platform_likes INTEGER DEFAULT 0,       -- 平台内点赞数

  -- 元数据
  logo_url TEXT,                          -- Skill 图标 URL
  tags TEXT,                              -- 标签（JSON 数组字符串）
  status TEXT DEFAULT 'active',           -- 'active' | 'hidden' | 'deleted'

  -- 时间戳
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  stats_updated_at TEXT                   -- 统计数据最后更新时间
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_skills_skill_id ON skills(skill_id);
CREATE INDEX IF NOT EXISTS idx_skills_platform ON skills(platform);
CREATE INDEX IF NOT EXISTS idx_skills_creator ON skills(creator_address);
CREATE INDEX IF NOT EXISTS idx_skills_payment ON skills(payment_address);
CREATE INDEX IF NOT EXISTS idx_skills_status ON skills(status);
CREATE INDEX IF NOT EXISTS idx_skills_tips ON skills(CAST(total_tips AS INTEGER) DESC);

-- ============================================
-- 2. 打赏记录表
-- ============================================

CREATE TABLE IF NOT EXISTS tips (
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  -- 交易信息
  tx_hash TEXT NOT NULL UNIQUE,
  block_number INTEGER,
  skill_id TEXT,                          -- NULL 表示直接打赏创作者
  from_address TEXT NOT NULL,             -- 打赏者钱包地址
  to_address TEXT NOT NULL,              -- 收款创作者地址

  -- 金额
  amount TEXT NOT NULL,                   -- 打赏总金额
  creator_received TEXT NOT NULL,         -- 创作者实际收到
  platform_fee TEXT NOT NULL,             -- 平台费用

  -- 额外信息
  message TEXT,                           -- 留言

  -- 时间戳
  created_at TEXT DEFAULT (datetime('now'))
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_tips_tx_hash ON tips(tx_hash);
CREATE INDEX IF NOT EXISTS idx_tips_skill_id ON tips(skill_id);
CREATE INDEX IF NOT EXISTS idx_tips_from ON tips(from_address);
CREATE INDEX IF NOT EXISTS idx_tips_to ON tips(to_address);
CREATE INDEX IF NOT EXISTS idx_tips_created ON tips(created_at DESC);

-- ============================================
-- 3. 水龙头领取记录表
-- ============================================

CREATE TABLE IF NOT EXISTS faucet_claim (
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  address TEXT NOT NULL,
  amount TEXT DEFAULT '1000000000000000000000',  -- 1000 ASKL (18 decimals)
  tx_hash TEXT UNIQUE,

  -- 时间戳
  created_at TEXT DEFAULT (datetime('now'))
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_faucet_address ON faucet_claim(address);
CREATE INDEX IF NOT EXISTS idx_faucet_created ON faucet_claim(created_at);

-- ============================================
-- 4. 点赞/收藏表
-- ============================================

CREATE TABLE IF NOT EXISTS skill_likes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  skill_id INTEGER NOT NULL,
  user_address TEXT NOT NULL,

  created_at TEXT DEFAULT (datetime('now')),

  UNIQUE(skill_id, user_address),
  FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_skill_likes_skill ON skill_likes(skill_id);
CREATE INDEX IF NOT EXISTS idx_skill_likes_user ON skill_likes(user_address);

-- ============================================
-- 初始化完成提示
-- ============================================

-- 插入一些示例数据（使用真实 GitHub 仓库）
INSERT OR IGNORE INTO skills (skill_id, name, description, platform, creator_address, payment_address, npm_package, repository, tags, total_tips, tip_count, github_stars, download_count) VALUES
  ('0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef', 'Anthropic TypeScript SDK', 'Anthropic API 的官方 TypeScript SDK', 'claude-code', '0x1234567890123456789012345678901234567890', '0x1234567890123456789012345678901234567890', '@anthropic-ai/sdk', 'https://github.com/anthropics/anthropic-sdk-typescript', '["typescript", "ai", "llm", "anthropic"]', '1500', '15', 1585, 50000),
  ('0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890', 'Vercel AI SDK', 'Vercel 的 AI SDK，支持多种 LLM 提供商', 'claude-code', '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd', '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd', 'ai', 'https://github.com/vercel/ai', '["vercel", "ai", "llm", "react", "nextjs"]', '3200', '32', 21528, 150000),
  ('0x1111222233334444555566667777888899990000aaaabbbbccccddddeeeeffff', 'React Query', '强大的数据同步库', 'claude-code', '0x1111222233334444555566667777888899990000', '0x1111222233334444555566667777888899990000', '@tanstack/react-query', 'https://github.com/TanStack/query', '["react", "data-fetching", "typescript"]', '800', '8', 42000, 2000000),
  ('0xfeedbeef0000111122223333444455556666777788889999aaabbbcccddeeff', 'Zod', 'TypeScript 优先的模式验证库', 'claude-code', '0xfeedbeef0000111122223333444455556666777788889999', '0xfeedbeef0000111122223333444455556666777788889999', 'zod', 'https://github.com/colinhacks/zod', '["validation", "typescript", "schema"]', '500', '5', 33000, 800000),
  ('0xdeadbeefcafebabe1234567890abcdef1234567890abcdef1234567890abcd', 'Prisma', '下一代 ORM', 'manus', '0xdeadbeefcafebabe1234567890abcdef1234567890abcdef12', '0xdeadbeefcafebabe1234567890abcdef1234567890abcdef12', null, 'https://github.com/prisma/prisma', '["orm", "database", "typescript"]', '2000', '20', 38000, 500000);
