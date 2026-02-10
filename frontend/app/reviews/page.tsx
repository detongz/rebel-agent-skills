// app/reviews/page.tsx - Reviews list page
'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';

interface Review {
  id: number;
  skill_id: number;
  skill_name?: string;
  rating: number;
  comment: string;
  reviewer_address: string;
  quality_score?: number;
  compute_units?: number;
  created_at: string;
}

interface ReviewStats {
  total: number;
  average_rating: number;
  airdrop_eligible: number;
  total_compute_units: number;
}

export default function ReviewsPage() {
  const { address } = useAccount();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterStars, setFilterStars] = useState<number | 'all'>('all');
  const [filterAirdrop, setFilterAirdrop] = useState<boolean | 'all'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'highest' | 'compute'>('newest');

  useEffect(() => {
    fetchReviews();
  }, [filterStars, filterAirdrop, sortBy]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (filterStars !== 'all') params.set('min_rating', filterStars.toString());
      if (filterAirdrop !== 'all') params.set('airdrop_eligible', filterAirdrop === true ? 'true' : 'false');
      params.set('sort', sortBy);

      const url = params.toString() ? `/api/reviews?${params.toString()}` : '/api/reviews';
      const res = await fetch(url);
      const data = await res.json();

      setReviews(data.data || []);
      setStats(data.stats || null);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="review-stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill={star <= rating ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="2"
            className={star <= rating ? 'star-filled' : 'star-empty'}
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        ))}
      </div>
    );
  };

  const shortenAddress = (addr: string) => {
    if (!addr || addr.length < 10) return addr;
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="app-shell">
      {/* Background */}
      <div className="app-backdrop" aria-hidden="true" />

      {/* Navigation */}
      <nav className="app-nav">
        <div className="nav-left">
          <div className="brand-mark">
            <span className="brand-orb" />
            <span className="brand-text">MySkills_Protocol</span>
          </div>
        </div>
        <div className="nav-right">
          <div className="nav-links-container">
            <a href="/" className="nav-link">HOME</a>
            <a href="#skills" className="nav-link">SKILLS</a>
            <a href="/reviews" className="nav-link text-[var(--neon-green)]">
              REVIEWS
            </a>
            <a href="/bounties" className="nav-link">BOUNTIES</a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="app-main">
        <div className="reviews-page">
          {/* Header */}
          <header className="reviews-header">
            <div>
              <h1 className="reviews-title">// REVIEWS_DIRECTORY</h1>
              <p className="reviews-subtitle">
                Community reviews for agent skills · Quality scores · Airdrop eligibility
              </p>
            </div>
          </header>

          {/* Stats Section */}
          {stats && (
            <div className="reviews-stats-grid">
              <div className="stat-card">
                <div className="stat-label">Total Reviews</div>
                <div className="stat-value text-[var(--neon-green)]">{stats.total}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Average Rating</div>
                <div className="stat-value text-[var(--neon-blue)]">{stats.average_rating.toFixed(1)}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Airdrop Eligible</div>
                <div className="stat-value text-[var(--warning-orange)]">{stats.airdrop_eligible}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Total Compute Units</div>
                <div className="stat-value">{stats.total_compute_units.toLocaleString()}</div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="reviews-filters">
            <div className="filter-group">
              <label className="filter-label">Rating</label>
              <select
                className="filter-select"
                value={filterStars}
                onChange={(e) => setFilterStars(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
              >
                <option value="all">[ALL_RATINGS]</option>
                <option value="5">5 Stars Only</option>
                <option value="4">4+ Stars</option>
                <option value="3">3+ Stars</option>
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Airdrop</label>
              <select
                className="filter-select"
                value={String(filterAirdrop)}
                onChange={(e) => {
                  if (e.target.value === 'all') setFilterAirdrop('all');
                  else setFilterAirdrop(e.target.value === 'true');
                }}
              >
                <option value="all">[ALL]</option>
                <option value="true">Eligible Only</option>
                <option value="false">Not Eligible</option>
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Sort By</label>
              <select
                className="filter-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
              >
                <option value="newest">[NEWEST]</option>
                <option value="highest">[HIGHEST_RATED]</option>
                <option value="compute">[MOST_COMPUTE]</option>
              </select>
            </div>
          </div>

          {/* Reviews List */}
          {loading ? (
            <div className="loading-state">
              <div className="loading-orb" />
              <p className="loading-text">Loading Reviews...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="empty-state">
              <h3>// NO_REVIEWS_FOUND</h3>
              <p>Be the first to review an agent skill!</p>
              <a href="/" className="primary-btn">
                BROWSE SKILLS
              </a>
            </div>
          ) : (
            <div className="reviews-list">
              {reviews.map((review) => (
                <article key={review.id} className="review-card">
                  {/* Review Header */}
                  <div className="review-card-header">
                    <div className="review-skill-info">
                      <span className="review-skill-name">{review.skill_name || `Skill #${review.skill_id}`}</span>
                      {renderStars(review.rating)}
                    </div>
                    {review.quality_score !== undefined && review.quality_score >= 80 && (
                      <div className="airdrop-badge-small">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 2L2 7l10 5 10-5-10-5z" />
                          <path d="M2 17l10 5 10-5" />
                        </svg>
                        <span>Eligible</span>
                      </div>
                    )}
                  </div>

                  {/* Review Comment */}
                  <p className="review-comment">{review.comment}</p>

                  {/* Review Meta */}
                  <div className="review-meta">
                    <div className="review-meta-left">
                      <span className="review-reviewer" title={review.reviewer_address}>
                        {shortenAddress(review.reviewer_address)}
                      </span>
                      <span className="review-date">{formatDate(review.created_at)}</span>
                    </div>
                    <div className="review-meta-right">
                      {review.quality_score !== undefined && (
                        <span className="review-quality-score">
                          QS: {review.quality_score}%
                        </span>
                      )}
                      {review.compute_units !== undefined && review.compute_units > 0 && (
                        <span className="review-compute-units">
                          {review.compute_units} CU
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-left">
          <span>MY-SKILLS-PROTOCOL // MOLTIVERSE_SUBMISSION_2026</span>
        </div>
        <div className="footer-right">
          <span className="footer-pill">REVIEWS_SYSTEM_V1.0</span>
        </div>
      </footer>
    </div>
  );
}
