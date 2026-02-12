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
CREATE INDEX IF NOT EXISTS idx_skills_github_stars ON skills(github_stars DESC);

-- ============================================
-- 2. 打赏记录表
-- ============================================

CREATE TABLE IF NOT EXISTS tips (
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  -- 交易信息
  tx_hash TEXT NOT NULL UNIQUE,
  block_number INTEGER,
  skill_id TEXT,                          -- NULL 表示直接打赏创作者

  -- 付款信息
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
CREATE INDEX IF NOT EXISTS idx_faucet_created ON faucet_claim(created_at DESC);

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
-- 5. 评测/评论表
-- ============================================

CREATE TABLE IF NOT EXISTS reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  -- 关联信息
  skill_id INTEGER NOT NULL,
  reviewer_address TEXT NOT NULL,

  -- 评分
  stars INTEGER NOT NULL,                   -- 1-5 星评分
  quality_score REAL DEFAULT 0,            -- 质量评分 (0-100)
  performance_score REAL DEFAULT 0,        -- 性能评分 (0-100)
  usability_score REAL DEFAULT 0,          -- 易用性评分 (0-100)

  -- 内容
  comment TEXT NOT NULL,                   -- 评论内容（最少10字符）
  pros TEXT,                               -- 优点列表
  cons TEXT,                               -- 缺点列表

  -- 标记
  is_verified_purchase BOOLEAN DEFAULT 0,  -- 是否已验证使用
  is_agent_tested BOOLEAN DEFAULT 0,       -- 是否经过 Agent 测试
  agent_test_results TEXT,                 -- Agent 测试结果 (JSON)

  -- 统计
  helpful_count INTEGER DEFAULT 0,         -- 有用投票数
  report_count INTEGER DEFAULT 0,          -- 举报数

  -- 状态
  status TEXT DEFAULT 'active',            -- 'active' | 'hidden' | 'flagged'
  moderator_notes TEXT,                    -- 版主备注

  -- 时间戳
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),

  -- 约束
  UNIQUE(skill_id, reviewer_address),
  FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
  CHECK(stars >= 1 AND stars <= 5),
  CHECK(quality_score >= 0 AND quality_score <= 100),
  CHECK(performance_score >= 0 AND performance_score <= 100),
  CHECK(usability_score >= 0 AND usability_score <= 100)
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_reviews_skill_id ON reviews(skill_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer ON reviews(reviewer_address);
CREATE INDEX IF NOT EXISTS idx_reviews_stars ON reviews(stars);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_created ON reviews(created_at DESC);

-- Agent 使用统计表 (用于 airdrop 资格检查)
CREATE TABLE IF NOT EXISTS agent_usage (
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  agent_address TEXT NOT NULL UNIQUE,
  total_compute_units REAL DEFAULT 0,      -- 计算单位使用量
  skill_calls INTEGER DEFAULT 0,           -- 技能调用次数
  unique_skills_used INTEGER DEFAULT 0,    -- 使用的不同技能数

  last_activity_at TEXT DEFAULT (datetime('now')),
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_agent_usage_address ON agent_usage(agent_address);
CREATE INDEX IF NOT EXISTS idx_agent_usage_compute ON agent_usage(total_compute_units DESC);
