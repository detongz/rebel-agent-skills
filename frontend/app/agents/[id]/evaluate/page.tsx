// app/agents/[id]/evaluate/page.tsx - Agent evaluation page
'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { useParams, useRouter } from 'next/navigation';
import { Agent, AgentEvaluation, LeaderboardEntry } from '@/lib/agent-types';

export default function AgentEvaluatePage() {
  const params = useParams();
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const agentId = params.id as string;

  const [agent, setAgent] = useState<Agent | null>(null);
  const [evaluations, setEvaluations] = useState<AgentEvaluation[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedCompareAgent, setSelectedCompareAgent] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState(false);

  // Form state
  const [ratings, setRatings] = useState({
    code_quality: 3,
    response_speed: 3,
    accuracy: 3,
    helpfulness: 3,
  });
  const [comment, setComment] = useState('');
  const [recommend, setRecommend] = useState(true);

  useEffect(() => {
    fetchData();
  }, [agentId]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [agentRes, evalsRes, leaderboardRes] = await Promise.all([
        fetch(`/api/agents/${agentId}`),
        fetch(`/api/agents/${agentId}/evaluations`),
        fetch('/api/agents/leaderboard?limit=10'),
      ]);

      const agentData = await agentRes.json();
      const evalsData = await evalsRes.json();
      const leaderboardData = await leaderboardRes.json();

      if (agentData.success) setAgent(agentData.data);
      if (evalsData.success) setEvaluations(evalsData.data);
      if (leaderboardData.success) setLeaderboard(leaderboardData.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected || !address) {
      alert('Please connect your wallet first');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`/api/agents/${agentId}/evaluations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          evaluator_wallet: address,
          ratings,
          comment,
          recommend,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert('Evaluation submitted successfully!');
        setComment('');
        setRatings({ code_quality: 3, response_speed: 3, accuracy: 3, helpfulness: 3 });
        setRecommend(true);
        fetchData();
      } else {
        alert(data.error || 'Failed to submit evaluation');
      }
    } catch (error) {
      console.error('Error submitting evaluation:', error);
      alert('Failed to submit evaluation');
    } finally {
      setSubmitting(false);
    }
  };

  const RatingSlider = ({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) => (
    <div className="rating-field">
      <div className="rating-header">
        <label className="rating-label">{label}</label>
        <span className="rating-value">{value.toFixed(1)}</span>
      </div>
      <input
        type="range"
        min="1"
        max="5"
        step="0.5"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="rating-slider"
      />
      <div className="rating-labels">
        <span>Poor</span>
        <span>Excellent</span>
      </div>
    </div>
  );

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'var(--neon-green)';
    if (rating >= 3.5) return '#00d4ff';
    if (rating >= 2.5) return '#ffcc00';
    return '#ff6600';
  };

  if (loading) {
    return (
      <div className="app-shell">
        <div className="app-backdrop" aria-hidden="true" />
        <div className="app-main" style={{ justifyContent: 'center', alignItems: 'center' }}>
          <div className="loading-orb" />
          <p className="loading-text">LOADING_AGENT_DATA...</p>
        </div>
      </div>
    );
  }

  const overallRating = ((ratings.code_quality + ratings.response_speed + ratings.accuracy + ratings.helpfulness) / 4).toFixed(1);

  return (
    <div className="app-shell">
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
          <a href="/" className="nav-link">HOME</a>
          <a href="/agents" className="nav-link">AGENTS</a>
          <a href="/agents/leaderboard" className="nav-link">LEADERBOARD</a>
        </div>
      </nav>

      <main className="app-main">
        <div className="evaluation-container">
          {/* Agent Profile Card */}
          <div className="agent-profile-card">
            <div className="agent-profile-header">
              <div className="agent-avatar-large">
                {agent?.avatar_url ? (
                  <img src={agent.avatar_url} alt={agent.name} />
                ) : (
                  <span>{agent?.name?.charAt(0) || '?'}</span>
                )}
              </div>
              <div className="agent-profile-info">
                <h1 className="agent-profile-name">{agent?.name || 'Unknown Agent'}</h1>
                <p className="agent-profile-description">{agent?.description || ''}</p>
                <div className="agent-platform-badge">{agent?.platform}</div>
              </div>
            </div>

            <div className="agent-stats-grid">
              <div className="agent-stat-box">
                <span className="agent-stat-value">{(agent as any)?.reviews_given || 0}</span>
                <span className="agent-stat-label">Reviews Given</span>
              </div>
              <div className="agent-stat-box">
                <span className="agent-stat-value" style={{ color: getRatingColor((agent as any)?.average_rating || 0) }}>
                  {((agent as any)?.average_rating || 0).toFixed(1)}
                </span>
                <span className="agent-stat-label">Avg Rating</span>
              </div>
              <div className="agent-stat-box">
                <span className="agent-stat-value">{((agent as any)?.total_compute_used || 0) / 1000}</span>
                <span className="agent-stat-label">Compute Used</span>
              </div>
              <div className="agent-stat-box">
                <span className="agent-stat-value">{evaluations.length}</span>
                <span className="agent-stat-label">Evaluations Received</span>
              </div>
            </div>
          </div>

          {/* Evaluation Form */}
          <div className="evaluation-form-card">
            <div className="evaluation-form-header">
              <h2 className="evaluation-form-title">// EVALUATE_AGENT</h2>
              <p className="evaluation-form-subtitle">
                Rate this agent on multiple criteria to help others make informed decisions
              </p>
            </div>

            {!isConnected ? (
              <div className="connect-wallet-prompt">
                <p>Connect your wallet to submit an evaluation</p>
                <button className="primary-btn" onClick={() => router.push('/')}>
                  CONNECT WALLET
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="evaluation-form">
                <RatingSlider
                  label="Code Quality"
                  value={ratings.code_quality}
                  onChange={(v) => setRatings({ ...ratings, code_quality: v })}
                />
                <RatingSlider
                  label="Response Speed"
                  value={ratings.response_speed}
                  onChange={(v) => setRatings({ ...ratings, response_speed: v })}
                />
                <RatingSlider
                  label="Accuracy"
                  value={ratings.accuracy}
                  onChange={(v) => setRatings({ ...ratings, accuracy: v })}
                />
                <RatingSlider
                  label="Helpfulness"
                  value={ratings.helpfulness}
                  onChange={(v) => setRatings({ ...ratings, helpfulness: v })}
                />

                <div className="overall-rating-display">
                  <span className="overall-rating-label">Overall Rating</span>
                  <span
                    className="overall-rating-value"
                    style={{ color: getRatingColor(parseFloat(overallRating)) }}
                  >
                    {overallRating}
                  </span>
                </div>

                <div className="form-group">
                  <label className="form-label">Comment</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Share your experience with this agent..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="recommend-toggle">
                  <label className="toggle-label">
                    <input
                      type="checkbox"
                      checked={recommend}
                      onChange={(e) => setRecommend(e.target.checked)}
                      className="toggle-checkbox"
                    />
                    <span className="toggle-slider" />
                    <span>Recommend this agent</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="submit-evaluation-btn"
                >
                  {submitting ? 'SUBMITTING...' : 'SUBMIT EVALUATION'}
                </button>
              </form>
            )}
          </div>

          {/* Evaluations List */}
          <div className="evaluations-list-card">
            <div className="evaluations-list-header">
              <h2 className="evaluations-list-title">// EVALUATIONS ({evaluations.length})</h2>
            </div>

            {evaluations.length === 0 ? (
              <div className="empty-evaluations">
                <p>No evaluations yet. Be the first to evaluate this agent!</p>
              </div>
            ) : (
              <div className="evaluations-list">
                {evaluations.map((evaluation) => (
                  <div key={evaluation.id} className="evaluation-item">
                    <div className="evaluation-item-header">
                      <span className="evaluation-author">
                        {evaluation.evaluator_name || `${evaluation.evaluator_wallet.slice(0, 6)}...${evaluation.evaluator_wallet.slice(-4)}`}
                      </span>
                      <span
                        className="evaluation-rating"
                        style={{ color: getRatingColor(evaluation.overall_rating) }}
                      >
                        {evaluation.overall_rating.toFixed(1)}
                      </span>
                    </div>

                    <div className="evaluation-ratings-breakdown">
                      <div className="rating-breakdown-item">
                        <span>Code</span>
                        <span>{evaluation.ratings.code_quality}</span>
                      </div>
                      <div className="rating-breakdown-item">
                        <span>Speed</span>
                        <span>{evaluation.ratings.response_speed}</span>
                      </div>
                      <div className="rating-breakdown-item">
                        <span>Accuracy</span>
                        <span>{evaluation.ratings.accuracy}</span>
                      </div>
                      <div className="rating-breakdown-item">
                        <span>Helpful</span>
                        <span>{evaluation.ratings.helpfulness}</span>
                      </div>
                    </div>

                    {evaluation.comment && (
                      <p className="evaluation-comment">"{evaluation.comment}"</p>
                    )}

                    <div className="evaluation-footer">
                      <span className="evaluation-date">
                        {new Date(evaluation.created_at).toLocaleDateString()}
                      </span>
                      {evaluation.recommend && (
                        <span className="recommend-badge">RECOMMENDED</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Leaderboard Preview */}
          <div className="leaderboard-card">
            <div className="leaderboard-header">
              <h2 className="leaderboard-title">// TOP_EVALUATORS</h2>
              <a href="/agents/leaderboard" className="view-all-link">VIEW ALL →</a>
            </div>

            <div className="leaderboard-list">
              {leaderboard.slice(0, 5).map((entry) => (
                <div key={entry.agent.id} className="leaderboard-item">
                  <div className="leaderboard-rank">{entry.rank}</div>
                  <div className="leaderboard-agent-info">
                    <span className="leaderboard-agent-name">{entry.agent.name}</span>
                    <span className="leaderboard-agent-stats">
                      {entry.evaluations_count} evals · {entry.average_rating.toFixed(1)} avg
                    </span>
                  </div>
                  <div className="leaderboard-rating" style={{ color: getRatingColor(entry.average_rating) }}>
                    {entry.average_rating.toFixed(1)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Comparison View */}
          {showComparison && selectedCompareAgent && (
            <div className="comparison-modal">
              <div className="comparison-content">
                <div className="comparison-header">
                  <h2>// AGENT_COMPARISON</h2>
                  <button onClick={() => setShowComparison(false)} className="close-btn">×</button>
                </div>
                <div className="comparison-grid">
                  <div className="comparison-agent">
                    <h3>{agent?.name}</h3>
                    <div className="comparison-stats">
                      <div>Rating: {evaluations.length > 0 ? (evaluations.reduce((sum, e) => sum + e.overall_rating, 0) / evaluations.length).toFixed(1) : 'N/A'}</div>
                      <div>Evaluations: {evaluations.length}</div>
                    </div>
                  </div>
                  <div className="comparison-vs">VS</div>
                  <div className="comparison-agent">
                    <h3>{leaderboard.find(l => l.agent.id === selectedCompareAgent)?.agent.name}</h3>
                    <div className="comparison-stats">
                      <div>
                        Rating: {leaderboard.find(l => l.agent.id === selectedCompareAgent)?.average_rating.toFixed(1)}
                      </div>
                      <div>
                        Evaluations: {leaderboard.find(l => l.agent.id === selectedCompareAgent)?.evaluations_count}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
