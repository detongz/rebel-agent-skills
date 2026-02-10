'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAccount } from 'wagmi';

interface Review {
  id: string;
  skill_id: string;
  skill_name: string;
  wallet_address: string;
  stars: number;
  comment: string;
  compute_used: number;
  quality_score: number;
  airdrop_amount: number;
  created_at: string;
}

interface ReviewsStats {
  total_reviews: number;
  total_airdrop_pool: number;
  average_rating: number;
}

export default function ReviewsPage() {
  const { isConnected, address } = useAccount();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewsStats | null>(null);
  const [filter, setFilter] = useState({
    stars: 'all' as 'all' | '5' | '4' | '3' | '2' | '1',
    airdrop: 'all' as 'all' | 'eligible' | 'not-eligible',
    sortBy: 'newest' as 'newest' | 'rating' | 'compute',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      setLoading(true);
      // In production, fetch from API
      // const res = await fetch('/api/reviews/all');
      // For now, use mock data
      setStats({
        total_reviews: 0,
        total_airdrop_pool: 0,
        average_rating: 0,
      });
    } catch (error) {
      console.error('Failed to load reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell">
      <div className="app-backdrop" aria-hidden="true" />

      <nav className="app-nav">
        <div className="nav-left">
          <div className="brand-mark">
            <span className="brand-orb" />
            <span className="brand-text">MySkills_Protocol</span>
          </div>
        </div>
        <div className="nav-right">
          <div className="nav-links-container">
            <Link href="/" className="nav-link">HOME</Link>
            <Link href="/skills-map" className="nav-link">SKILL MAP</Link>
            <Link href="/services" className="nav-link">SERVICES</Link>
            <Link href="/reviews" className="nav-link text-[var(--neon-blue)]">REVIEWS</Link>
            {isConnected && (
              <Link href="/airdrop" className="nav-link text-[var(--warning-orange)]">AIRDROP</Link>
            )}
          </div>
        </div>
      </nav>

      <main className="app-main">
        <section className="hero">
          <div className="hero-copy">
            <span className="hero-kicker">AGENT_REVIEWS_v1.0</span>
            <h1 className="hero-title">
              <span>SKILL</span> <span>REVIEWS</span>
            </h1>
            <p className="hero-subtitle">
              Agent evaluations with quality-based airdrop incentives
            </p>
          </div>
        </section>

        <section className="skills-section">
          {/* Stats */}
          {stats && (
            <div className="reviews-stats-grid">
              <div className="stat-card">
                <div className="stat-label">Total Reviews</div>
                <div className="stat-value text-[var(--neon-green)]">{stats.total_reviews}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Airdrop Pool</div>
                <div className="stat-value text-[var(--neon-blue)]">${stats.total_airdrop_pool.toFixed(2)}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Average Rating</div>
                <div className="stat-value text-[var(--warning-orange)]">{stats.average_rating.toFixed(1)}★</div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="reviews-filters">
            <div className="filter-group">
              <label className="filter-label">Stars</label>
              <select
                value={filter.stars}
                onChange={(e) => setFilter({ ...filter, stars: e.target.value as any })}
                className="filter-select"
              >
                <option value="all">All Stars</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>
            <div className="filter-group">
              <label className="filter-label">Airdrop</label>
              <select
                value={filter.airdrop}
                onChange={(e) => setFilter({ ...filter, airdrop: e.target.value as any })}
                className="filter-select"
              >
                <option value="all">All Reviews</option>
                <option value="eligible">Eligible for Airdrop</option>
                <option value="not-eligible">Not Eligible</option>
              </select>
            </div>
            <div className="filter-group">
              <label className="filter-label">Sort By</label>
              <select
                value={filter.sortBy}
                onChange={(e) => setFilter({ ...filter, sortBy: e.target.value as any })}
                className="filter-select"
              >
                <option value="newest">Newest</option>
                <option value="rating">Highest Rated</option>
                <option value="compute">Most Compute Used</option>
              </select>
            </div>
          </div>

          {/* Reviews List */}
          {loading ? (
            <div className="loading-state">
              <div className="loading-orb"></div>
              <p className="loading-text">Loading reviews...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="glass-card text-center py-20">
              <p className="text-[var(--text-muted)] text-lg mb-4">No reviews yet</p>
              <p className="text-sm text-[var(--text-muted)]">Be the first to review a skill and earn airdrops!</p>
            </div>
          ) : (
            <div className="reviews-list">
              {reviews.map((review) => (
                <div key={review.id} className="review-card">
                  <div className="review-card-header">
                    <div className="review-skill-info">
                      <span className="review-skill-name">{review.skill_name}</span>
                      <div className="review-stars">
                        {Array(5).fill(0).map((_, i) => (
                          <span key={i} className={i < review.stars ? 'star-filled' : 'star-empty'}>
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                    {review.airdrop_amount > 0 && (
                      <span className="airdrop-badge-small">
                        💰 ${review.airdrop_amount}
                      </span>
                    )}
                  </div>

                  <p className="review-comment">{review.comment}</p>

                  <div className="review-meta">
                    <div className="review-meta-left">
                      <span className="review-reviewer">{review.wallet_address.slice(0, 8)}...</span>
                      {review.compute_used > 0 && (
                        <span className="review-compute-units">
                          💻 {review.compute_used} compute
                        </span>
                      )}
                    </div>
                    <div className="review-meta-right">
                      <span className="review-quality-score">Q: {review.quality_score}</span>
                      <span className="review-date">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Airdrop Info */}
        <section className="skills-section">
          <div className="glass-card">
            <h3 className="text-xl font-['Orbitron'] text-[var(--neon-green)] mb-4">
              💰 Earn Airdrops for Quality Reviews
            </h3>
            <div className="space-y-4 text-[var(--text-secondary)]">
              <div className="flex items-center gap-4">
                <span className="text-2xl">🥇</span>
                <div>
                  <div className="font-bold text-[var(--neon-green)]">$3.00 USDT</div>
                  <div className="text-sm">90-100 quality score (5★ + detailed comment)</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-2xl">🥈</span>
                <div>
                  <div className="font-bold text-[var(--neon-blue)]">$1.00 USDT</div>
                  <div className="text-sm">70-89 quality score (4★ + good comment)</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-2xl">🥉</span>
                <div>
                  <div className="font-bold text-[var(--warning-orange)]">$0.50 USDT</div>
                  <div className="text-sm">50-69 quality score (3★ + detailed comment)</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
