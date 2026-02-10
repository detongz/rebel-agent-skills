// components/SkillReviewForm.tsx - Review submission form component
'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';

interface SkillReviewFormProps {
  skillId: number;
  skillName: string;
  onReviewSubmitted?: () => void;
}

export default function SkillReviewForm({ skillId, skillName, onReviewSubmitted }: SkillReviewFormProps) {
  const { address, isConnected } = useAccount();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const maxCommentLength = 500;
  const commentLength = comment.length;

  // Quality score calculation based on rating and comment quality
  const calculateQualityScore = () => {
    if (rating === 0) return 0;
    let score = rating * 20; // Base: 1 star = 20%, 5 stars = 100%

    // Bonus for detailed comments
    if (commentLength >= 50) score += 5;
    if (commentLength >= 150) score += 5;
    if (commentLength >= 300) score += 5;

    return Math.min(score, 100);
  };

  const qualityScore = calculateQualityScore();

  // Compute units = quality score * rating multiplier
  const calculateComputeUnits = () => {
    if (rating === 0) return 0;
    return Math.floor(qualityScore * rating * 0.1);
  };

  const computeUnits = calculateComputeUnits();

  // Airdrop eligibility: 4+ stars with meaningful comment (50+ chars)
  const isAirdropEligible = rating >= 4 && commentLength >= 50;

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
          <p>Thank you for your feedback. Quality score: {qualityScore}%</p>
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
              placeholder="Share your experience with this skill... (min 10 characters)"
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
              <div className="quality-score-details">
                <div className="score-detail-row">
                  <span>Base (Rating × 20):</span>
                  <span>{rating * 20}%</span>
                </div>
                {commentLength >= 50 && (
                  <div className="score-detail-row bonus">
                    <span>Comment Bonus:</span>
                    <span>+15%</span>
                  </div>
                )}
              </div>

              {/* Compute Units & Airdrop */}
              <div className="review-rewards-preview">
                <div className="reward-item">
                  <span className="reward-label">Compute Units Earned:</span>
                  <span className="reward-value">{computeUnits} CU</span>
                </div>
                {isAirdropEligible && (
                  <div className="airdrop-badge">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2L2 7l10 5 10-5-10-5z" />
                      <path d="M2 17l10 5 10-5" />
                      <path d="M2 12l10 5 10-5" />
                    </svg>
                    <span>Airdrop Eligible!</span>
                  </div>
                )}
                {!isAirdropEligible && rating > 0 && (
                  <div className="airdrop-hint">
                    <span>
                      {rating < 4
                        ? 'Rate 4+ stars to qualify for airdrop'
                        : 'Add 50+ characters to qualify for airdrop'}
                    </span>
                  </div>
                )}
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
