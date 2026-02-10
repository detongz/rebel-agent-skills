// components/SkillReviewForm.tsx - Review submission form component
'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { calculateReviewQuality, getAirdropTiers, type ReviewQualityInput } from '@/lib/review-quality';

interface SkillReviewFormProps {
  skillId: number | string;
  skillName: string;
  computeUsed?: number;
  onReviewSubmitted?: () => void;
}

export default function SkillReviewForm({
  skillId,
  skillName,
  computeUsed = 0,
  onReviewSubmitted
}: SkillReviewFormProps) {
  const { address, isConnected } = useAccount();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const maxCommentLength = 500;
  const commentLength = comment.length;

  // Calculate quality score in real-time using the algorithm
  const qualityResult = rating > 0 && commentLength >= 10
    ? calculateReviewQuality({
        stars: rating,
        comment,
        compute_used: computeUsed
      })
    : null;

  const qualityScore = qualityResult?.score ?? 0;
  const airdropAmount = qualityResult?.airdrop_amount ?? 0;
  const isAirdropEligible = qualityResult?.qualifies ?? false;
  const scoreReasons = qualityResult?.reasons ?? [];

  // Get airdrop tier info
  const airdropTiers = getAirdropTiers();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected || !address) {
      alert('Please connect your wallet first');
      return;
    }

    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    if (commentLength < 10) {
      alert('Please enter at least 10 characters for your review');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skill_id: skillId,
          rating,
          comment,
          reviewer_address: address,
          compute_used: computeUsed,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to submit review');
      }

      setSubmitted(true);
      if (onReviewSubmitted) onReviewSubmitted();

      // Reset form after 2 seconds
      setTimeout(() => {
        setRating(0);
        setComment('');
        setSubmitted(false);
      }, 2000);
    } catch (error) {
      console.error('Submit review error:', error);
      alert(error instanceof Error ? error.message : 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="review-form-container">
      <div className="review-form-header">
        <h3 className="review-form-title">// SUBMIT_REVIEW</h3>
        <p className="review-form-subtitle">Reviewing: {skillName}</p>
      </div>

      {!isConnected ? (
        <div className="review-form-connect-prompt">
          <p>Please connect your wallet to submit a review</p>
        </div>
      ) : submitted ? (
        <div className="review-form-success">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <h4>Review Submitted Successfully!</h4>
          <p>Quality Score: {qualityScore}% | Airdrop: ${airdropAmount.toFixed(2)} USDT</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="review-form">
          {/* Star Rating */}
          <div className="review-form-field">
            <label className="review-form-label">
              Rating <span className="required">*</span>
            </label>
            <div className="star-rating-container">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`star-button ${star <= (hoverRating || rating) ? 'star-active' : ''}`}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  aria-label={`Rate ${star} stars`}
                  disabled={isSubmitting}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill={star <= (hoverRating || rating) ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div className="review-form-field">
            <label className="review-form-label">
              Comment <span className="required">*</span>
            </label>
            <textarea
              className="review-textarea"
              placeholder="Share your experience with this skill... Include specific features, code examples, or detailed feedback for bonus points! (min 10 characters)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={maxCommentLength}
              disabled={isSubmitting}
              rows={4}
              required
            />
            <div className={`character-count ${commentLength >= maxCommentLength ? 'limit-reached' : ''}`}>
              {commentLength}/{maxCommentLength}
            </div>
          </div>

          {/* Quality Score Preview */}
          {rating > 0 && (
            <div className="quality-score-preview">
              <div className="quality-score-header">
                <span className="quality-score-label">Quality Score Preview</span>
                <span className={`quality-score-value ${isAirdropEligible ? 'eligible' : ''}`}>
                  {qualityScore}%
                </span>
              </div>
              <div className="quality-score-bar">
                <div
                  className="quality-score-fill"
                  style={{ width: `${qualityScore}%` }}
                />
              </div>

              {/* Score Breakdown */}
              {scoreReasons.length > 0 && (
                <div className="quality-score-details">
                  {scoreReasons.map((reason, idx) => (
                    <div key={idx} className={`score-detail-row ${reason.includes('+') && !reason.includes('0 points') ? 'bonus' : ''}`}>
                      <span>{reason}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Airdrop Info */}
              <div className="review-rewards-preview">
                <div className="reward-item">
                  <span className="reward-label">Potential Airdrop:</span>
                  <span className={`reward-value ${isAirdropEligible ? 'text-[var(--neon-green)]' : ''}`}>
                    ${airdropAmount.toFixed(2)} USDT
                  </span>
                </div>
                {computeUsed > 0 && (
                  <div className="reward-item">
                    <span className="reward-label">Compute Verified:</span>
                    <span className="reward-value">+10 pts</span>
                  </div>
                )}
                {isAirdropEligible && (
                  <div className="airdrop-badge">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2L2 7l10 5 10-5-10-5z" />
                      <path d="M2 17l10 5 10-5" />
                    </svg>
                    <span>Airdrop Eligible!</span>
                  </div>
                )}
                {!isAirdropEligible && rating > 0 && (
                  <div className="airdrop-hint">
                    {qualityScore < 50
                      ? 'Need 50+ quality score for airdrop'
                      : 'Airdrop tiers: $0.50 (50-69), $1.00 (70-89), $3.00 (90-100)'
                    }
                  </div>
                )}
              </div>

              {/* Airdrop Tier Reference */}
              <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  AIRDROP TIERS
                </div>
                {airdropTiers.map((tier) => (
                  <div key={tier.min_score} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', padding: '2px 0' }}>
                    <span style={{ color: qualityScore >= tier.min_score && qualityScore <= tier.max_score ? 'var(--neon-green)' : 'var(--text-muted)' }}>
                      {tier.min_score}-{tier.max_score} pts
                    </span>
                    <span style={{ color: qualityScore >= tier.min_score && qualityScore <= tier.max_score ? 'var(--neon-green)' : 'var(--text-muted)' }}>
                      ${tier.amount.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="review-submit-btn"
            disabled={isSubmitting || rating === 0 || commentLength < 10}
          >
            {isSubmitting ? (
              <>
                <svg className="spinning" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" opacity="0.25" />
                  <path d="M12 2a10 10 0 0 1 10 10" />
                </svg>
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 2L11 13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
                <span>Submit Review</span>
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
