// lib/db-reviews.ts - Review system database operations
import db from './db';

// ============================================
// Table Initialization
// ============================================

export function initReviewTables() {
  // Check if review tables already exist
  const tableExists = db.prepare(`
    SELECT name FROM sqlite_master
    WHERE type='table' AND name='skill_reviews'
  `).get();

  if (tableExists) {
    console.log('✅ Review tables already exist');
    return;
  }

  // Create skill_reviews table
  db.exec(`
    CREATE TABLE IF NOT EXISTS skill_reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      skill_id TEXT NOT NULL,
      agent_address TEXT NOT NULL,
      wallet_address TEXT NOT NULL,

      -- Rating and feedback
      stars INTEGER NOT NULL CHECK(stars >= 1 AND stars <= 5),
      comment TEXT,

      -- Usage metrics
      compute_used TEXT NOT NULL DEFAULT '0',

      -- Quality assessment
      quality_score INTEGER CHECK(quality_score >= 0 AND quality_score <= 100),

      -- Timestamps
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),

      UNIQUE(skill_id, agent_address, wallet_address)
    );
  `);

  // Create skill_compute table
  db.exec(`
    CREATE TABLE IF NOT EXISTS skill_compute (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      skill_id TEXT NOT NULL,
      agent_address TEXT NOT NULL,

      -- Usage statistics
      total_compute TEXT NOT NULL DEFAULT '0',
      usage_count INTEGER NOT NULL DEFAULT 0,

      -- Aggregated metrics
      average_quality_score REAL,
      total_reviews INTEGER NOT NULL DEFAULT 0,

      -- Timestamps
      last_used_at TEXT DEFAULT (datetime('now')),
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),

      UNIQUE(skill_id, agent_address)
    );
  `);

  // Create airdrop_eligibility table
  db.exec(`
    CREATE TABLE IF NOT EXISTS airdrop_eligibility (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      wallet_address TEXT NOT NULL UNIQUE,

      -- Eligibility criteria
      min_reviews_met INTEGER NOT NULL DEFAULT 0,
      min_compute_met INTEGER NOT NULL DEFAULT 0,

      -- Statistics
      total_reviews INTEGER NOT NULL DEFAULT 0,
      total_compute_used TEXT NOT NULL DEFAULT '0',

      -- Claim status
      is_eligible INTEGER NOT NULL DEFAULT 0,
      claimed_at TEXT,
      claim_tx_hash TEXT,

      -- Timestamps
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
  `);

  // Create indexes
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_reviews_skill ON skill_reviews(skill_id);
    CREATE INDEX IF NOT EXISTS idx_reviews_agent ON skill_reviews(agent_address);
    CREATE INDEX IF NOT EXISTS idx_reviews_wallet ON skill_reviews(wallet_address);
    CREATE INDEX IF NOT EXISTS idx_reviews_stars ON skill_reviews(stars);
    CREATE INDEX IF NOT EXISTS idx_reviews_created ON skill_reviews(created_at DESC);

    CREATE INDEX IF NOT EXISTS idx_compute_skill ON skill_compute(skill_id);
    CREATE INDEX IF NOT EXISTS idx_compute_agent ON skill_compute(agent_address);
    CREATE INDEX IF NOT EXISTS idx_compute_usage ON skill_compute(total_compute DESC);

    CREATE INDEX IF NOT EXISTS idx_airdrop_wallet ON airdrop_eligibility(wallet_address);
    CREATE INDEX IF NOT EXISTS idx_airdrop_eligible ON airdrop_eligibility(is_eligible);
  `);

  console.log('✅ Review tables initialized');
}

// Initialize tables on import
initReviewTables();

// ============================================
// Skill Review Operations
// ============================================

export interface CreateReviewParams {
  skill_id: string;
  agent_address: string;
  wallet_address: string;
  stars: number;
  comment?: string;
  compute_used: string;
  quality_score?: number;
}

/**
 * Create or update a skill review
 */
export function upsertReview(params: CreateReviewParams): number {
  const stmt = db.prepare(`
    INSERT INTO skill_reviews (
      skill_id, agent_address, wallet_address, stars, comment, compute_used, quality_score
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(skill_id, agent_address, wallet_address)
    DO UPDATE SET
      stars = excluded.stars,
      comment = excluded.comment,
      compute_used = excluded.compute_used,
      quality_score = excluded.quality_score,
      updated_at = datetime('now')
  `);

  const result = stmt.run(
    params.skill_id,
    params.agent_address,
    params.wallet_address,
    params.stars,
    params.comment || null,
    params.compute_used,
    params.quality_score || null
  );

  // Update skill_compute
  updateSkillCompute(params.skill_id, params.agent_address, params.compute_used, params.quality_score);

  // Update airdrop eligibility
  updateAirdropEligibility(params.wallet_address);

  return result.lastInsertRowid as number;
}

/**
 * Get a review by skill, agent, and wallet
 */
export function getReview(skillId: string, agentAddress: string, walletAddress: string) {
  const stmt = db.prepare(`
    SELECT * FROM skill_reviews
    WHERE skill_id = ? AND agent_address = ? AND wallet_address = ?
  `);
  return stmt.get(skillId, agentAddress, walletAddress);
}

/**
 * Get all reviews for a skill
 */
export function getSkillReviews(skillId: string, limit = 50, offset = 0) {
  const stmt = db.prepare(`
    SELECT * FROM skill_reviews
    WHERE skill_id = ?
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `);
  return stmt.all(skillId, limit, offset);
}

/**
 * Get reviews by wallet address
 */
export function getUserReviews(walletAddress: string, limit = 50, offset = 0) {
  const stmt = db.prepare(`
    SELECT * FROM skill_reviews
    WHERE wallet_address = ?
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `);
  return stmt.all(walletAddress, limit, offset);
}

// ============================================
// Skill Compute Operations
// ============================================

/**
 * Update skill compute statistics
 */
export function updateSkillCompute(
  skillId: string,
  agentAddress: string,
  computeUsed: string,
  qualityScore?: number
) {
  const stmt = db.prepare(`
    INSERT INTO skill_compute (
      skill_id, agent_address, total_compute, usage_count, quality_score
    ) VALUES (?, ?, ?, 1, ?)
    ON CONFLICT(skill_id, agent_address)
    DO UPDATE SET
      total_compute = CAST(total_compute AS INTEGER) + CAST(excluded.total_compute AS INTEGER),
      usage_count = usage_count + 1,
      last_used_at = datetime('now'),
      updated_at = datetime('now')
  `);

  stmt.run(skillId, agentAddress, computeUsed, qualityScore || null);

  // Update aggregated quality score
  if (qualityScore !== undefined) {
    updateAverageQualityScore(skillId, agentAddress);
  }
}

/**
 * Update the average quality score for a skill-agent pair
 */
function updateAverageQualityScore(skillId: string, agentAddress: string) {
  const stmt = db.prepare(`
    UPDATE skill_compute
    SET average_quality_score = (
      SELECT AVG(quality_score)
      FROM skill_reviews
      WHERE skill_id = ? AND agent_address = ? AND quality_score IS NOT NULL
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM skill_reviews
      WHERE skill_id = ? AND agent_address = ?
    )
    WHERE skill_id = ? AND agent_address = ?
  `);
  stmt.run(skillId, agentAddress, skillId, agentAddress, skillId, agentAddress);
}

/**
 * Get compute statistics for a skill
 */
export function getSkillComputeStats(skillId: string) {
  const stmt = db.prepare(`
    SELECT
      agent_address,
      total_compute,
      usage_count,
      average_quality_score,
      total_reviews,
      last_used_at
    FROM skill_compute
    WHERE skill_id = ?
    ORDER BY total_compute DESC
  `);
  return stmt.all(skillId);
}

/**
 * Get compute statistics for an agent
 */
export function getAgentComputeStats(agentAddress: string) {
  const stmt = db.prepare(`
    SELECT
      skill_id,
      total_compute,
      usage_count,
      average_quality_score,
      total_reviews,
      last_used_at
    FROM skill_compute
    WHERE agent_address = ?
    ORDER BY total_compute DESC
  `);
  return stmt.all(agentAddress);
}

// ============================================
// Airdrop Eligibility Operations
// ============================================

const MIN_REVIEWS_THRESHOLD = 3;
const MIN_COMPUTE_THRESHOLD = '1000';

/**
 * Update airdrop eligibility for a wallet
 */
export function updateAirdropEligibility(walletAddress: string) {
  // Get user statistics
  const stats = getUserReviewStats(walletAddress);

  const minReviewsMet = stats.total_reviews >= MIN_REVIEWS_THRESHOLD;
  const minComputeMet = BigInt(stats.total_compute_used || '0') >= BigInt(MIN_COMPUTE_THRESHOLD);
  const isEligible = minReviewsMet && minComputeMet;

  const stmt = db.prepare(`
    INSERT INTO airdrop_eligibility (
      wallet_address, min_reviews_met, min_compute_met,
      total_reviews, total_compute_used, is_eligible
    ) VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(wallet_address)
    DO UPDATE SET
      min_reviews_met = excluded.min_reviews_met,
      min_compute_met = excluded.min_compute_met,
      total_reviews = excluded.total_reviews,
      total_compute_used = excluded.total_compute_used,
      is_eligible = excluded.is_eligible,
      updated_at = datetime('now')
  `);

  stmt.run(
    walletAddress,
    minReviewsMet ? 1 : 0,
    minComputeMet ? 1 : 0,
    stats.total_reviews,
    stats.total_compute_used || '0',
    isEligible ? 1 : 0
  );
}

/**
 * Get airdrop eligibility for a wallet
 */
export function getAirdropEligibility(walletAddress: string) {
  const stmt = db.prepare(`
    SELECT * FROM airdrop_eligibility
    WHERE wallet_address = ?
  `);
  return stmt.get(walletAddress) as {
    wallet_address: string;
    min_reviews_met: number;
    min_compute_met: number;
    total_reviews: number;
    total_compute_used: string;
    is_eligible: number;
    claimed_at?: string;
    claim_tx_hash?: string;
    updated_at: string;
  } | undefined;
}

/**
 * Mark airdrop as claimed
 */
export function markAirdropClaimed(walletAddress: string, txHash: string) {
  const stmt = db.prepare(`
    UPDATE airdrop_eligibility
    SET claimed_at = datetime('now'),
        claim_tx_hash = ?,
        updated_at = datetime('now')
    WHERE wallet_address = ? AND is_eligible = 1 AND claimed_at IS NULL
  `);
  return stmt.run(txHash, walletAddress);
}

/**
 * Get all eligible wallets
 */
export function getEligibleWallets() {
  const stmt = db.prepare(`
    SELECT * FROM airdrop_eligibility
    WHERE is_eligible = 1 AND claimed_at IS NULL
    ORDER BY created_at ASC
  `);
  return stmt.all();
}

// ============================================
// Statistics and Summary Operations
// ============================================

/**
 * Get aggregated review statistics for a skill
 */
export function getReviewStatistics(skillId: string) {
  const stmt = db.prepare(`
    SELECT
      COUNT(*) as total_reviews,
      AVG(stars) as average_stars,
      AVG(quality_score) as average_quality_score,
      SUM(CAST(compute_used AS INTEGER)) as total_compute_used,
      COUNT(DISTINCT wallet_address) as unique_users
    FROM skill_reviews
    WHERE skill_id = ?
  `);

  const stats = stmt.get(skillId) as any;

  // Get star distribution
  const starStmt = db.prepare(`
    SELECT stars, COUNT(*) as count
    FROM skill_reviews
    WHERE skill_id = ?
    GROUP BY stars
  `);
  const starRows = starStmt.all(skillId) as Array<{ stars: number; count: number }>;

  const starDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const row of starRows) {
    const starValue = row.stars;
    if (starValue in starDistribution) {
      starDistribution[starValue] = row.count;
    }
  }

  return {
    skill_id: skillId,
    total_reviews: stats.total_reviews || 0,
    average_stars: stats.average_stars || 0,
    average_quality_score: stats.average_quality_score || 0,
    total_compute_used: stats.total_compute_used || '0',
    unique_users: stats.unique_users || 0,
    star_distribution: starDistribution,
  };
}

/**
 * Get user review statistics
 */
export function getUserReviewStats(walletAddress: string) {
  const stmt = db.prepare(`
    SELECT
      COUNT(*) as total_reviews,
      SUM(CAST(compute_used AS INTEGER)) as total_compute_used,
      COUNT(DISTINCT skill_id) as unique_skills_reviewed
    FROM skill_reviews
    WHERE wallet_address = ?
  `);

  return stmt.get(walletAddress) as {
    total_reviews: number;
    total_compute_used: string;
    unique_skills_reviewed: number;
  };
}

/**
 * Get user review summary with eligibility info
 */
export function getUserReviewSummary(walletAddress: string) {
  const stats = getUserReviewStats(walletAddress);
  const eligibility = getAirdropEligibility(walletAddress);

  const reviewsNeeded = Math.max(0, MIN_REVIEWS_THRESHOLD - stats.total_reviews);
  const computeNeeded = String(
    BigInt(MIN_COMPUTE_THRESHOLD) - BigInt(stats.total_compute_used || '0')
  );

  return {
    wallet_address: walletAddress,
    total_reviews: stats.total_reviews || 0,
    total_compute_used: stats.total_compute_used || '0',
    unique_skills_reviewed: stats.unique_skills_reviewed || 0,
    airdrop_eligible: eligibility?.is_eligible === 1,
    reviews_needed: reviewsNeeded,
    compute_needed: computeNeeded,
  };
}

/**
 * Get top skills by reviews
 */
export function getTopSkillsByReviews(limit = 10) {
  const stmt = db.prepare(`
    SELECT
      skill_id,
      COUNT(*) as total_reviews,
      AVG(stars) as average_stars,
      SUM(CAST(compute_used AS INTEGER)) as total_compute_used
    FROM skill_reviews
    GROUP BY skill_id
    ORDER BY total_reviews DESC
    LIMIT ?
  `);
  return stmt.all(limit);
}

/**
 * Get top agents by compute usage
 */
export function getTopAgentsByCompute(limit = 10) {
  const stmt = db.prepare(`
    SELECT
      agent_address,
      SUM(CAST(total_compute AS INTEGER)) as total_compute,
      SUM(usage_count) as total_usage
    FROM skill_compute
    GROUP BY agent_address
    ORDER BY total_compute DESC
    LIMIT ?
  `);
  return stmt.all(limit);
}
