-- Agent Reward Hub 数据库表结构
-- 适用于 PostgreSQL 16+

-- ============================================
-- 1. Skills 表（核心表）
-- ============================================

CREATE TABLE IF NOT EXISTS skills (
  -- 主键
  id SERIAL PRIMARY KEY,

  -- 链上标识
  skill_id BYTEA NOT NULL UNIQUE,          -- 链上 skillId (bytes32, 存储为 hex bytes)
  transaction_hash VARCHAR(66) UNIQUE,     -- 注册交易的哈希

  -- 基本信息
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  platform VARCHAR(50) NOT NULL,           -- 'coze' | 'claude-code' | 'manus' | 'minimax'
  version VARCHAR(50) DEFAULT '1.0.0',

  -- 收款相关（核心！）
  creator_address VARCHAR(42) NOT NULL,    -- 创作者钱包地址
  payment_address VARCHAR(42) NOT NULL,    -- 收款地址（可以和 creator 不同）

  -- 外部链接（阶段 1）
  npm_package VARCHAR(255),                -- npm 包名，如 "@scope/package-name"
  repository TEXT,                         -- GitHub 仓库 URL
  homepage TEXT,                           -- 官网/文档 URL
  documentation_url TEXT,                  -- 文档 URL（单独字段）

  -- 统计数据（手动填写/缓存）
  download_count INTEGER DEFAULT 0,        -- 下载量展示
  github_stars INTEGER DEFAULT 0,          -- GitHub stars（缓存）
  github_forks INTEGER DEFAULT 0,          -- GitHub forks（缓存）
  github_issues INTEGER DEFAULT 0,         -- GitHub issues（缓存）

  -- 平台数据
  total_tips NUMERIC(78, 0) DEFAULT 0,     -- 累计打赏（从链上读取，单位：ASKL 最小单位）
  tip_count INTEGER DEFAULT 0,             -- 打赏次数
  platform_likes INTEGER DEFAULT 0,        -- 平台内点赞数

  -- 元数据
  logo_url TEXT,                          -- Skill 图标 URL
  banner_url TEXT,                        -- 横幅图片 URL
  tags TEXT[],                            -- 标签数组
  category VARCHAR(100),                  -- 分类

  -- 状态
  status VARCHAR(20) DEFAULT 'active',     -- 'active' | 'hidden' | 'deleted' | 'pending'

  -- 时间戳
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  stats_updated_at TIMESTAMP,             -- 统计数据最后更新时间
  indexed_at TIMESTAMP,                   -- 被搜索引擎索引的时间

  -- 约束检查
  CONSTRAINT skills_platform_check CHECK (platform IN ('coze', 'claude-code', 'manus', 'minimax')),
  CONSTRAINT skills_status_check CHECK (status IN ('active', 'hidden', 'deleted', 'pending')),
  CONSTRAINT skills_download_count_check CHECK (download_count >= 0),
  CONSTRAINT skills_tips_check CHECK (total_tips >= 0)
);

-- 索引
CREATE INDEX idx_skills_skill_id ON skills(skill_id);
CREATE INDEX idx_skills_platform ON skills(platform);
CREATE INDEX idx_skills_creator ON skills(creator_address);
CREATE INDEX idx_skills_payment ON skills(payment_address);
CREATE INDEX idx_skills_npm ON skills(npm_package);
CREATE INDEX idx_skills_status ON skills(status);
CREATE INDEX idx_skills_category ON skills(category);

-- 排序索引（用于排行榜）
CREATE INDEX idx_skills_tips ON skills(total_tips DESC);
CREATE INDEX idx_skills_likes ON skills(platform_likes DESC);
CREATE INDEX idx_skills_downloads ON skills(download_count DESC);
CREATE INDEX idx_skills_stars ON skills(github_stars DESC);

-- 全文搜索索引
CREATE INDEX idx_skills_name_trgm ON skills USING gin(name gin_trgm_ops);
CREATE INDEX idx_skills_description_trgm ON skills USING gin(description gin_trgm_ops);

-- 注释
COMMENT ON TABLE skills IS 'Agent Skills 注册表';
COMMENT ON COLUMN skills.skill_id IS '链上 skillId，keccak256(name + version + platform)';
COMMENT ON COLUMN skills.payment_address IS '收款钱包地址，创作者接收打赏的地址';
COMMENT ON COLUMN skills.total_tips IS '累计收到的打赏金额（最小单位）';
COMMENT ON COLUMN skills.stats_updated_at IS '统计数据（npm/GitHub）最后更新时间';

-- ============================================
-- 2. 打赏记录表
-- ============================================

CREATE TABLE IF NOT EXISTS tips (
  id SERIAL PRIMARY KEY,

  -- 交易信息
  tx_hash VARCHAR(66) NOT NULL UNIQUE,    -- 交易哈希
  block_number BIGINT,
  transaction_index INTEGER,
  log_index INTEGER,

  -- 打赏关系
  skill_id BYTEA,                         -- NULL 表示直接打赏创作者
  from_address VARCHAR(42) NOT NULL,       -- 打赏者钱包地址
  to_address VARCHAR(42) NOT NULL,        -- 收款创作者地址

  -- 金额
  amount NUMERIC(78, 0) NOT NULL,         -- 打赏总金额
  creator_received NUMERIC(78, 0) NOT NULL, -- 创作者实际收到
  platform_fee NUMERIC(78, 0) NOT NULL,   -- 平台费用（销毁）

  -- 额外信息
  message TEXT,                           -- 留言（IPFS hash）
  message_text TEXT,                      -- 留言文本（链下存储）

  -- 时间戳
  created_at TIMESTAMP DEFAULT NOW(),
  indexed_at TIMESTAMP DEFAULT NOW(),

  -- 约束
  CONSTRAINT tips_amount_check CHECK (amount > 0),
  CONSTRAINT tips_received_check CHECK (creator_received >= 0),
  CONSTRAINT tips_fee_check CHECK (platform_fee >= 0),
  CONSTRAINT tips_amount_split_check CHECK (creator_received + platform_fee = amount)
);

-- 索引
CREATE INDEX idx tips_tx_hash ON tips(tx_hash);
CREATE INDEX idx tips_skill_id ON tips(skill_id) WHERE skill_id IS NOT NULL;
CREATE INDEX idx tips_from ON tips(from_address);
CREATE INDEX idx tips_to ON tips(to_address);
CREATE INDEX idx tips_created ON tips(created_at DESC);

-- 复合索引用于查询用户打赏历史
CREATE INDEX idx tips_from_created ON tips(from_address, created_at DESC);
CREATE INDEX idx tips_to_created ON tips(to_address, created_at DESC);

COMMENT ON TABLE tips IS '打赏记录表';
COMMENT ON COLUMN tips.skill_id IS '被打赏的 Skill，NULL 表示直接打赏给创作者';
COMMENT ON COLUMN tips.message IS 'IPFS hash，存储留言内容';

-- ============================================
-- 3. 赞助活动表（项目方赞助）
-- ============================================

CREATE TABLE IF NOT EXISTS sponsors (
  id SERIAL PRIMARY KEY,

  -- 基本信息
  name VARCHAR(255) NOT NULL,
  description TEXT,

  -- 赞助方信息
  sponsor_address VARCHAR(42) NOT NULL,
  sponsor_email VARCHAR(255),
  sponsor_logo_url TEXT,

  -- 赞助金额
  total_amount NUMERIC(78, 0) NOT NULL,    -- 总赞助金额
  remaining_amount NUMERIC(78, 0) NOT NULL, -- 剩余金额

  -- 目标条件
  tags TEXT[],                            -- 赞助哪些标签的 Skills
  platforms TEXT[],                       -- 赞助哪些平台的 Skills
  min_stars INTEGER DEFAULT 0,            -- 最低 stars 要求

  -- 时间范围
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP,

  -- 统计
  skills_sponsored INTEGER DEFAULT 0,     -- 已赞助的 Skill 数量
  views INTEGER DEFAULT 0,                -- 活动页面浏览量

  -- 状态
  status VARCHAR(20) DEFAULT 'active',    -- 'active' | 'paused' | 'completed'

  -- 时间戳
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT sponsors_amount_remaining CHECK (remaining_amount >= 0),
  CONSTRAINT sponsors_dates CHECK (end_date IS NULL OR end_date > start_date)
);

-- 索引
CREATE INDEX idx_sponsors_address ON sponsors(sponsor_address);
CREATE INDEX idx_sponsors_status ON sponsors(status);
CREATE INDEX idx_sponsors_dates ON sponsors(start_date, end_date);

COMMENT ON TABLE sponsors IS '项目方赞助活动';
COMMENT ON COLUMN sponsors.remaining_amount IS '剩余未分配的赞助金额';

-- ============================================
-- 4. 水龙头领取记录表
-- ============================================

CREATE TABLE IF NOT EXISTS faucet_claim (
  id SERIAL PRIMARY KEY,

  address VARCHAR(42) NOT NULL,
  amount NUMERIC(78, 0) NOT NULL DEFAULT 1000 * 10**18, -- 默认 1000 ASKL

  -- 交易信息
  tx_hash VARCHAR(66) UNIQUE,
  block_number BIGINT,

  -- 时间戳
  created_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT faucet_amount_check CHECK (amount > 0)
);

-- 索引
CREATE INDEX idx_faucet_address ON faucet_claim(address);
CREATE INDEX idx_faucet_created ON faucet_claim(created_at);

-- 唯一约束：24小时内同一地址只能领一次
CREATE UNIQUE INDEX idx_faucet_address_daily
ON faucet_claim(address, DATE(created_at));

COMMENT ON TABLE faucet_claim IS '水龙头领取记录';

-- ============================================
-- 5. 用户表（可选，用于扩展功能）
-- ============================================

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,

  -- 钱包地址（主标识）
  address VARCHAR(42) NOT NULL UNIQUE,

  -- 可选信息
  email VARCHAR(255) UNIQUE,
  username VARCHAR(100),
  bio TEXT,
  avatar_url TEXT,

  -- 社交链接
  twitter_url TEXT,
  github_url TEXT,
  website_url TEXT,

  -- 统计
  total_tipped NUMERIC(78, 0) DEFAULT 0,
  total_received NUMERIC(78, 0) DEFAULT 0,
  tip_count INTEGER DEFAULT 0,

  -- 状态
  is_creator BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,

  -- 时间戳
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_active_at TIMESTAMP
);

-- 索引
CREATE INDEX idx_users_address ON users(address);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_creator ON users(is_creator);
CREATE INDEX idx_users_tips ON users(total_tipped DESC);

COMMENT ON TABLE users IS '用户信息表（可选）';

-- ============================================
-- 6. 点赞/收藏表
-- ============================================

CREATE TABLE IF NOT EXISTS skill_likes (
  id SERIAL PRIMARY KEY,

  skill_id INTEGER NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  user_address VARCHAR(42) NOT NULL,

  created_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(skill_id, user_address)
);

-- 索引
CREATE INDEX idx_skill_likes_skill ON skill_likes(skill_id);
CREATE INDEX idx_skill_likes_user ON skill_likes(user_address);

COMMENT ON TABLE skill_likes IS '用户点赞 Skills 记录';

-- ============================================
-- 7. 统计更新日志表（用于调试）
-- ============================================

CREATE TABLE IF NOT EXISTS stats_update_log (
  id SERIAL PRIMARY KEY,

  entity_type VARCHAR(50) NOT NULL,       -- 'skill' | 'user'
  entity_id INTEGER NOT NULL,

  -- 更新内容
  update_type VARCHAR(50) NOT NULL,       -- 'npm' | 'github' | 'manual'
  old_value JSONB,
  new_value JSONB,

  -- 元数据
  success BOOLEAN DEFAULT true,
  error_message TEXT,

  -- 时间戳
  created_at TIMESTAMP DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_stats_log_entity ON stats_update_log(entity_type, entity_id);
CREATE INDEX idx_stats_log_type ON stats_update_log(update_type);
CREATE INDEX idx_stats_log_created ON stats_update_log(created_at DESC);

COMMENT ON TABLE stats_update_log IS '统计数据更新日志';

-- ============================================
-- 8. 触发器：自动更新 updated_at
-- ============================================

-- 创建通用的更新时间戳函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 为需要的表添加触发器
CREATE TRIGGER update_skills_updated_at BEFORE UPDATE ON skills
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sponsors_updated_at BEFORE UPDATE ON sponsors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 9. 视图：热门 Skills
-- ============================================

CREATE OR REPLACE VIEW hot_skills AS
SELECT
  id,
  skill_id,
  name,
  description,
  platform,
  payment_address,
  total_tips,
  tip_count,
  platform_likes,
  github_stars,
  download_count,
  created_at,
  -- 综合热度分数
  (
    (tip_count * 10) +
    (platform_likes * 5) +
    (github_stars * 2) +
    (download_count / 1000)
  ) AS hot_score
FROM skills
WHERE status = 'active'
  AND created_at > NOW() - INTERVAL '30 days'
ORDER BY hot_score DESC
LIMIT 100;

COMMENT ON VIEW hot_skills IS '热门 Skills 视图（近30天）';

-- ============================================
-- 10. 初始化数据（可选）
-- ============================================

-- 插入一些示例分类标签
-- （这些可以在代码中动态管理）

-- ============================================
-- 完成提示
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '数据库表结构创建完成！';
  RAISE NOTICE '已创建以下表:';
  RAISE NOTICE '  - skills (Skills 注册表)';
  RAISE NOTICE '  - tips (打赏记录)';
  RAISE NOTICE '  - sponsors (赞助活动)';
  RAISE NOTICE '  - faucet_claim (水龙头记录)';
  RAISE NOTICE '  - users (用户信息)';
  RAISE NOTICE '  - skill_likes (点赞记录)';
  RAISE NOTICE '  - stats_update_log (统计日志)';
  RAISE NOTICE '';
  RAISE NOTICE '已创建视图:';
  RAISE NOTICE '  - hot_skills (热门 Skills)';
END $$;
