/**
 * Review Quality Scoring Algorithm
 *
 * Calculates quality scores for skill reviews with spam detection
 * and airdrop eligibility determination.
 */

/**
 * Input for review quality calculation
 */
export interface ReviewQualityInput {
  /** Star rating (1-5) */
  stars: number;
  /** Review comment text */
  comment: string;
  /** Optional compute units used (shows actual usage) */
  compute_used?: number;
}

/**
 * Output from review quality calculation
 */
export interface ReviewQualityOutput {
  /** Quality score (0-100) */
  score: number;
  /** Airdrop amount in USDT */
  airdrop_amount: number;
  /** Whether review qualifies for airdrop */
  qualifies: boolean;
  /** Reasons explaining the score breakdown */
  reasons: string[];
}

/**
 * Airdrop tier configuration
 */
interface AirdropTier {
  min_score: number;
  max_score: number;
  amount: number;
}

/** Airdrop tiers from lowest to highest */
const AIRDROP_TIERS: AirdropTier[] = [
  { min_score: 90, max_score: 100, amount: 3.00 },
  { min_score: 70, max_score: 89, amount: 1.00 },
  { min_score: 50, max_score: 69, amount: 0.50 },
];

/** Patterns that indicate spam or low-quality content */
const SPAM_PATTERNS = [
  /^(.)\1{10,}$/,           // Repeating same character 10+ times
  /^[A-Z\s]{20,}$/,         // All caps (20+ chars)
  /^(?:test|test123|asdf|nice|good|bad|\d+)$/i, // Generic/spam words
  /^[\s\W]*$/,              // Only whitespace/special chars
  /^(..+)\1{3,}$/,          // Repeating phrase (e.g., "goodgoodgood")
];

/** Minimum comment length to qualify */
const MIN_COMMENT_LENGTH = 10;

/** Maximum score cap */
const MAX_SCORE = 100;

/**
 * Detects if a comment appears to be spam or low-quality
 *
 * @param comment - The comment text to analyze
 * @returns true if spam is detected
 */
export function detectSpam(comment: string): boolean {
  const trimmed = comment.trim();

  // Check minimum length
  if (trimmed.length < MIN_COMMENT_LENGTH) {
    return true;
  }

  // Check against spam patterns
  for (const pattern of SPAM_PATTERNS) {
    if (pattern.test(trimmed)) {
      return true;
    }
  }

  // Check for excessive repetition (more than 50% repeated chars)
  const uniqueChars = new Set(trimmed.toLowerCase()).size;
  if (uniqueChars < trimmed.length * 0.3) {
    return true;
  }

  return false;
}

/**
 * Calculates base score from star rating
 * 5 stars = 60pts, 4 = 48pts, 3 = 36pts, 2 = 24pts, 1 = 12pts
 *
 * @param stars - Star rating (1-5)
 * @returns Points earned from star rating
 */
function calculateStarScore(stars: number): number {
  if (stars < 1 || stars > 5) {
    return 0;
  }
  return stars * 12; // 12, 24, 36, 48, or 60 points
}

/**
 * Calculates points from comment length
 * 10-50 chars = 10pts, 50-100 = 20pts, 100+ = 30pts
 *
 * @param comment - The comment text
 * @returns Points earned from comment length
 */
function calculateLengthScore(comment: string): number {
  const length = comment.trim().length;

  if (length >= 100) {
    return 30;
  } else if (length >= 50) {
    return 20;
  } else if (length >= 10) {
    return 10;
  }

  return 0;
}

/**
 * Detects if comment contains a code snippet
 * Looks for code blocks, function names, or common code patterns
 *
 * @param comment - The comment text
 * @returns true if code snippet is detected
 */
function hasCodeSnippet(comment: string): boolean {
  const codePatterns = [
    /```[\s\S]*?```/,     // Code blocks
    /`[^`]+`/,            // Inline code
    /\b(function|const|let|var|class|import|export|return|async|await)\b/i,
    /\b[a-zA-Z_]\w*\s*\(/, // Function calls
    /\{[\s\S]*?\}/,       // Braces (might be code)
  ];

  return codePatterns.some(pattern => pattern.test(comment));
}

/**
 * Detects if comment contains specific feature feedback
 * Looks for mentions of specific features, UI elements, or functionality
 *
 * @param comment - The comment text
 * @returns true if specific feedback is detected
 */
function hasSpecificFeedback(comment: string): boolean {
  const specificKeywords = [
    'interface', 'ui', 'button', 'menu', 'sidebar', 'header',
    'performance', 'speed', 'fast', 'slow', 'latency',
    'feature', 'functionality', 'option', 'setting', 'config',
    'integration', 'api', 'endpoint', 'response',
    'documentation', 'readme', 'guide', 'tutorial',
    'installation', 'setup', 'deploy',
  ];

  const lowerComment = comment.toLowerCase();
  return specificKeywords.some(keyword => lowerComment.includes(keyword));
}

/**
 * Determines airdrop amount based on quality score
 *
 * @param score - Quality score (0-100)
 * @returns Airdrop amount in USDT
 */
function calculateAirdropAmount(score: number): number {
  for (const tier of AIRDROP_TIERS) {
    if (score >= tier.min_score && score <= tier.max_score) {
      return tier.amount;
    }
  }
  return 0;
}

/**
 * Calculates review quality score and airdrop eligibility
 *
 * @param input - Review quality input data
 * @returns Review quality output with score, airdrop amount, and reasons
 */
export function calculateReviewQuality(
  input: ReviewQualityInput
): ReviewQualityOutput {
  const { stars, comment, compute_used } = input;
  const reasons: string[] = [];
  let score = 0;

  // Spam detection first
  if (detectSpam(comment)) {
    return {
      score: 0,
      airdrop_amount: 0,
      qualifies: false,
      reasons: ['Review detected as spam or low-quality'],
    };
  }

  // Validate star rating
  if (stars < 1 || stars > 5) {
    return {
      score: 0,
      airdrop_amount: 0,
      qualifies: false,
      reasons: ['Invalid star rating (must be 1-5)'],
    };
  }

  // Calculate star score
  const starScore = calculateStarScore(stars);
  score += starScore;
  reasons.push(`${stars} star rating: +${starScore} points`);

  // Calculate comment length score
  const lengthScore = calculateLengthScore(comment);
  if (lengthScore > 0) {
    score += lengthScore;
    reasons.push(`Comment length (${comment.length} chars): +${lengthScore} points`);
  }

  // Compute usage bonus
  if (compute_used && compute_used > 0) {
    score += 10;
    reasons.push('Compute usage verified: +10 points');
  }

  // Code snippet bonus
  if (hasCodeSnippet(comment)) {
    score += 20;
    reasons.push('Code snippet included: +20 points');
  }

  // Specific feedback bonus
  if (hasSpecificFeedback(comment)) {
    score += 15;
    reasons.push('Specific feature feedback: +15 points');
  }

  // Cap at max score
  const finalScore = Math.min(score, MAX_SCORE);
  if (score > MAX_SCORE) {
    reasons.push(`Score capped at ${MAX_SCORE} points`);
  }

  // Calculate airdrop
  const airdropAmount = calculateAirdropAmount(finalScore);
  const qualifies = airdropAmount > 0;

  return {
    score: finalScore,
    airdrop_amount: airdropAmount,
    qualifies,
    reasons,
  };
}

/**
 * Represents a review for batch processing
 */
export interface Review {
  skill_id: string;
  wallet: string;
  stars: number;
  comment: string;
  compute_used?: number;
}

/**
 * Checks airdrop eligibility for multiple reviews
 * Handles deduplication (one review per skill per wallet)
 *
 * @param reviews - Array of reviews to process
 * @returns Total airdrop amount and breakdown
 */
export function checkAirdropEligibility(reviews: Review[]): {
  total_amount: number;
  qualified_reviews: number;
  breakdown: Array<{
    skill_id: string;
    score: number;
    amount: number;
  }>;
} {
  // Deduplicate: one review per skill per wallet (keep highest scoring)
  const reviewMap = new Map<string, Review>();

  for (const review of reviews) {
    const key = `${review.wallet}:${review.skill_id}`;
    const existing = reviewMap.get(key);

    if (!existing) {
      reviewMap.set(key, review);
    } else {
      // Keep the review with higher potential score
      const existingScore = calculateReviewQuality(existing);
      const newScore = calculateReviewQuality(review);
      if (newScore.score > existingScore.score) {
        reviewMap.set(key, review);
      }
    }
  }

  const uniqueReviews = Array.from(reviewMap.values());
  let totalAmount = 0;
  let qualifiedCount = 0;
  const breakdown: Array<{
    skill_id: string;
    score: number;
    amount: number;
  }> = [];

  for (const review of uniqueReviews) {
    const result = calculateReviewQuality(review);
    if (result.qualifies) {
      totalAmount += result.airdrop_amount;
      qualifiedCount++;
      breakdown.push({
        skill_id: review.skill_id,
        score: result.score,
        amount: result.airdrop_amount,
      });
    }
  }

  return {
    total_amount: totalAmount,
    qualified_reviews: qualifiedCount,
    breakdown,
  };
}

/**
 * Gets airdrop tier information for display
 *
 * @returns Array of airdrop tiers
 */
export function getAirdropTiers(): AirdropTier[] {
  return [...AIRDROP_TIERS];
}
