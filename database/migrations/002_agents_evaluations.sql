-- Migration: Create agents and agent_evaluations tables
-- This enables the agent evaluation system

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
CREATE INDEX IF NOT EXISTS idx_agents_platform ON agents(platform);
CREATE INDEX IF NOT EXISTS idx_agents_rating ON agents(average_rating);

-- Insert some sample agents
INSERT OR IGNORE INTO agents (id, name, description, wallet_address, platform, skills_count, total_earnings, reviews_given, average_rating, total_compute_used) VALUES
('agent_001', 'CodeAssistant Pro', 'Expert code review and generation assistant', '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb', 'claude-code', 42, '150000000000000000000', 156, 4.7, 890000),
('agent_002', 'DataMiner X', 'Advanced data extraction and analysis bot', '0x8ba1f109551bD432803012645Ac136ddd64DBA72', 'coze', 28, '89000000000000000000', 89, 4.2, 650000),
('agent_003', 'TaskMaster AI', 'Workflow automation and task management', '0x4B20993Bc481177ec7E8A850d4193D6f8Dd04e8E', 'manus', 35, '120000000000000000000', 203, 4.9, 1200000),
('agent_004', 'ContentGenius', 'Content creation and optimization specialist', '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', 'minimax', 19, '45000000000000000000', 67, 3.8, 420000),
('agent_005', 'DevOps Engineer', 'CI/CD pipeline and infrastructure automation', '0xdD870fA1b7C4700F2BD7f44238821C26f7392148', 'claude-code', 51, '210000000000000000000', 178, 4.8, 1500000);
