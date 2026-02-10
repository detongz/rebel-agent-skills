// lib/review-types.ts - Review system TypeScript interfaces

/**
 * Skill Review - A review submitted by a user for a skill they used
 */
export interface SkillReview {
  id?: number;
  skill_id: string;
  agent_address: string;
  wallet_address: string;

  // Rating and feedback
  stars: number; // 1-5 stars
  comment?: string;

  // Usage metrics
  compute_used: string; // Compute units consumed (as string for precision)

  // Quality assessment
  quality_score?: number; // 0-100 calculated score

  // Timestamps
  created_at?: string;
  updated_at?: string;
}

/**
 * Skill Compute - Tracks compute usage per agent-skill combination
 */
export interface SkillCompute {
  id?: number;
  skill_id: string;
  agent_address: string;

  // Usage statistics
  total_compute: string; // Total compute used (as string for precision)
  usage_count: number; // Number of times skill was used

  // Aggregated metrics
  average_quality_score?: number;
  total_reviews: number;

  // Timestamps
  last_used_at?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Airdrop Eligibility - Tracks user eligibility and claim status
 */
export interface AirdropEligibility {
  id?: number;
  wallet_address: string;

  // Eligibility criteria
  min_reviews_met: boolean; // Has >= 3 reviews
  min_compute_met: boolean; // Has >= 1000 compute used

  // Statistics
  total_reviews: number;
  total_compute_used: string;

  // Claim status
  is_eligible: boolean;
  claimed_at?: string;
  claim_tx_hash?: string;

  // Timestamps
  created_at?: string;
  updated_at?: string;
}

/**
 * Review Statistics - Aggregated stats for a skill
 */
export interface ReviewStatistics {
  skill_id: string;
  total_reviews: number;
  average_stars: number;
  average_quality_score: number;
  total_compute_used: string;
  unique_users: number;

  // Star distribution
  star_distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

/**
 * User Review Summary - User's review activity summary
 */
export interface UserReviewSummary {
  wallet_address: string;
  total_reviews: number;
  total_compute_used: string;
  unique_skills_reviewed: number;

  // Eligibility
  airdrop_eligible: boolean;
  reviews_needed: number; // Reviews needed to reach threshold
  compute_needed: string; // Compute needed to reach threshold
}
