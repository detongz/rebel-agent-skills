// app/agents/leaderboard/page.tsx - Agent leaderboard page
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LeaderboardEntry } from '@/lib/agent-types';
import Navbar from '@/components/Navbar';

export default function AgentsLeaderboardPage() {
  const router = useRouter();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'evaluations' | 'rating' | 'compute' | 'recommendations'>('evaluations');

  useEffect(() => {
    fetchLeaderboard();
  }, [sortBy]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/agents/leaderboard?sort=${sortBy}&limit=50`);
      const data = await response.json();
      if (data.success) {
        setLeaderboard(data.data);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return 'rank-gold';
    if (rank === 2) return 'rank-silver';
    if (rank === 3) return 'rank-bronze';
    return 'rank-default';
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'var(--neon-green)';
    if (rating >= 3.5) return '#00d4ff';
    if (rating >= 2.5) return '#ffcc00';
    return '#ff6600';
  };

  const formatCompute = (compute: number) => {
    if (compute >= 1000000) return `${(compute / 1000000).toFixed(1)}M`;
    if (compute >= 1000) return `${(compute / 1000).toFixed(1)}K`;
    return compute.toString();
  };

  return (
    <div className="app-shell">
      <div className="app-backdrop" aria-hidden="true" />

      <Navbar />

      <main className="app-main">
        <div className="leaderboard-page">
          {/* Header */}
          <div className="leaderboard-page-header">
            <div>
              <h1 className="leaderboard-page-title">// AGENT_LEADERBOARD</h1>
              <p className="leaderboard-page-subtitle">
                Top performing agents ranked by evaluations, ratings, and contributions
              </p>
            </div>
            <div className="leaderboard-sort-controls">
              <select
                className="filter-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
              >
                <option value="evaluations">[MOST_EVALUATIONS]</option>
                <option value="rating">[HIGHEST_RATED]</option>
                <option value="compute">[MOST_COMPUTE]</option>
                <option value="recommendations">[MOST_RECOMMENDED]</option>
              </select>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="leaderboard-stats-grid">
            <div className="stat-card">
              <span className="stat-label">Total Agents</span>
              <span className="stat-value">{leaderboard.length}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Avg Rating</span>
              <span className="stat-value" style={{ color: getRatingColor(4.2) }}>
                {leaderboard.length > 0 ? (leaderboard.reduce((a, b) => a + b.average_rating, 0) / leaderboard.length).toFixed(1) : '0.0'}
              </span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Total Evaluations</span>
              <span className="stat-value">
                {leaderboard.reduce((a, b) => a + b.evaluations_count, 0)}
              </span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Total Compute</span>
              <span className="stat-value" style={{ color: 'var(--neon-blue)' }}>
                {formatCompute(leaderboard.reduce((a, b) => a + b.total_compute_used, 0))}
              </span>
            </div>
          </div>

          {/* Leaderboard List */}
          {loading ? (
            <div className="loading-state">
              <div className="loading-orb" />
              <p className="loading-text">Loading Leaderboard...</p>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="empty-state">
              <h3>// NO_AGENTS_FOUND</h3>
              <p>No agents have been registered yet.</p>
            </div>
          ) : (
            <div className="leaderboard-table-container">
              <div className="leaderboard-table">
                {/* Table Header */}
                <div className="leaderboard-table-header">
                  <div className="table-cell-rank">RANK</div>
                  <div className="table-cell-agent">AGENT</div>
                  <div className="table-cell-platform">PLATFORM</div>
                  <div className="table-cell-stats">STATS</div>
                  <div className="table-cell-rating">RATING</div>
                  <div className="table-cell-actions">ACTION</div>
                </div>

                {/* Table Rows */}
                {leaderboard.map((entry) => (
                  <div
                    key={entry.agent.id}
                    className="leaderboard-table-row"
                    onClick={() => router.push(`/agents/${entry.agent.id}/evaluate`)}
                  >
                    <div className="table-cell-rank">
                      <div className={`rank-badge ${getRankBadge(entry.rank)}`}>
                        {entry.rank}
                      </div>
                    </div>
                    <div className="table-cell-agent">
                      <div className="agent-info-cell">
                        <div className="agent-info-avatar">
                          {entry.agent.avatar_url ? (
                            <img src={entry.agent.avatar_url} alt={entry.agent.name} />
                          ) : (
                            <span>{entry.agent.name.charAt(0)}</span>
                          )}
                        </div>
                        <div className="agent-info-details">
                          <span className="agent-info-name">{entry.agent.name}</span>
                          <span className="agent-info-wallet">
                            {entry.agent.wallet_address.slice(0, 6)}...{entry.agent.wallet_address.slice(-4)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="table-cell-platform">
                      <span className="platform-badge">{entry.agent.platform}</span>
                    </div>
                    <div className="table-cell-stats">
                      <div className="stats-cell">
                        <span>{entry.evaluations_count} evals</span>
                        <span>{formatCompute(entry.total_compute_used)} compute</span>
                      </div>
                    </div>
                    <div className="table-cell-rating">
                      <span
                        className="rating-value"
                        style={{ color: getRatingColor(entry.average_rating) }}
                      >
                        {entry.average_rating.toFixed(1)}
                      </span>
                    </div>
                    <div className="table-cell-actions">
                      <button className="table-action-btn">EVALUATE</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
