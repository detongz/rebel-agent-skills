'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface Agent {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
  total_reviews: number;
  average_rating: number;
  total_compute: number;
}

interface Evaluation {
  id: string;
  agent_id: string;
  evaluator_address: string;
  performance_score: number;
  reliability_score: number;
  accuracy_score: number;
  overall_score: number;
  comment: string;
  compute_used: number;
  created_at: string;
}

export default function AgentEvaluatePage() {
  const params = useParams();
  const agentId = params.id as string;
  const { isConnected, address } = useAccount();

  const [agent, setAgent] = useState<Agent | null>(null);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    performance_score: 5,
    reliability_score: 5,
    accuracy_score: 5,
    compute_used: 0,
    comment: '',
  });

  useEffect(() => {
    loadAgent();
    loadEvaluations();
  }, [agentId]);

  const loadAgent = async () => {
    try {
      // In production, fetch from API
      setAgent({
        id: agentId,
        name: `Agent ${agentId}`,
        description: 'Advanced AI agent for specialized tasks',
        capabilities: ['Code Generation', 'Data Analysis', 'Automation'],
        total_reviews: 0,
        average_rating: 0,
        total_compute: 0,
      });
    } catch (error) {
      console.error('Failed to load agent:', error);
    }
  };

  const loadEvaluations = async () => {
    try {
      setLoading(true);
      // In production, fetch from API
      setEvaluations([]);
    } catch (error) {
      console.error('Failed to load evaluations:', error);
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
      const res = await fetch(`/api/agents/${agentId}/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          evaluator_address: address,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          alert('Evaluation submitted successfully!');
          loadEvaluations();
          loadAgent();
          setFormData({
            performance_score: 5,
            reliability_score: 5,
            accuracy_score: 5,
            compute_used: 0,
            comment: '',
          });
        }
      }
    } catch (error) {
      console.error('Failed to submit evaluation:', error);
      alert('Failed to submit evaluation. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const overallScore = (
    (formData.performance_score + formData.reliability_score + formData.accuracy_score) / 3
  ).toFixed(1);

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
            <span className="hero-kicker">AGENT_EVALUATION_v1.0</span>
            <h1 className="hero-title">
              <span>EVALUATE</span> <span>AGENT</span>
            </h1>
            <p className="hero-subtitle">
              Rate agent performance and contribute to quality metrics
            </p>
          </div>
        </section>

        <section className="skills-section">
          {/* Agent Info */}
          {agent && (
            <div className="glass-card mb-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold font-['Orbitron'] text-[var(--neon-green)] mb-2">
                    {agent.name}
                  </h2>
                  <p className="text-[var(--text-secondary)]">{agent.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold font-['Orbitron'] text-[var(--neon-blue)]">
                    {agent.average_rating > 0 ? agent.average_rating.toFixed(1) : 'N/A'}★
                  </div>
                  <div className="text-sm text-[var(--text-muted)]">
                    {agent.total_reviews} evaluations
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {agent.capabilities.map((cap, i) => (
                  <span key={i} className="px-3 py-1 bg-[var(--neon-purple)]/10 text-[var(--neon-purple)] rounded text-sm">
                    {cap}
                  </span>
                ))}
              </div>

              {agent.total_compute > 0 && (
                <div className="text-sm text-[var(--text-muted)]">
                  💻 Total compute used: {agent.total_compute} units
                </div>
              )}
            </div>
          )}

          {/* Evaluation Form */}
          {isConnected ? (
            <div className="glass-card mb-8">
              <h3 className="text-xl font-['Orbitron'] text-[var(--neon-green)] mb-6">
                Submit Your Evaluation
              </h3>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Performance Score */}
                <div>
                  <label className="block text-sm font-['Rajdhani'] text-[var(--text-secondary)] mb-2">
                    Performance Score: {formData.performance_score}★
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormData({ ...formData, performance_score: star })}
                        className={`text-2xl transition-all ${
                          star <= formData.performance_score
                            ? 'text-[var(--warning-orange)]'
                            : 'text-[var(--text-muted)]'
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reliability Score */}
                <div>
                  <label className="block text-sm font-['Rajdhani'] text-[var(--text-secondary)] mb-2">
                    Reliability Score: {formData.reliability_score}★
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormData({ ...formData, reliability_score: star })}
                        className={`text-2xl transition-all ${
                          star <= formData.reliability_score
                            ? 'text-[var(--neon-blue)]'
                            : 'text-[var(--text-muted)]'
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                {/* Accuracy Score */}
                <div>
                  <label className="block text-sm font-['Rajdhani'] text-[var(--text-secondary)] mb-2">
                    Accuracy Score: {formData.accuracy_score}★
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormData({ ...formData, accuracy_score: star })}
                        className={`text-2xl transition-all ${
                          star <= formData.accuracy_score
                            ? 'text-[var(--neon-purple)]'
                            : 'text-[var(--text-muted)]'
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                {/* Compute Used */}
                <div>
                  <label className="block text-sm font-['Rajdhani'] text-[var(--text-secondary)] mb-2">
                    Compute Used (units)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.compute_used}
                    onChange={(e) => setFormData({ ...formData, compute_used: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] font-['Rajdhani']"
                  />
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-sm font-['Rajdhani'] text-[var(--text-secondary)] mb-2">
                    Your Evaluation Comment
                  </label>
                  <textarea
                    value={formData.comment}
                    onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                    placeholder="Share your experience with this agent... What tasks did it perform well? What could be improved?"
                    required
                    rows={5}
                    className="w-full px-4 py-3 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] font-['Rajdhani'] resize-none"
                  />
                  <div className="text-xs text-[var(--text-muted)] mt-1">
                    Detailed comments help improve agent quality
                  </div>
                </div>

                {/* Overall Score Preview */}
                <div className="p-4 bg-[var(--bg-surface)] rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--text-muted)]">Overall Score</span>
                    <span className="text-2xl font-bold font-['Orbitron'] text-[var(--neon-green)]">
                      {overallScore}★
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="success-btn w-full text-center text-lg py-4"
                >
                  {submitting ? '⏳ Submitting...' : '✓ Submit Evaluation'}
                </button>
              </form>
            </div>
          ) : (
            <div className="glass-card text-center py-20 mb-8">
              <p className="text-[var(--text-muted)] text-lg mb-6">
                Connect your wallet to evaluate this agent
              </p>
            </div>
          )}

          {/* Previous Evaluations */}
          <div className="glass-card">
            <h3 className="text-xl font-['Orbitron'] text-[var(--text-primary)] mb-6">
              Previous Evaluations
            </h3>

            {loading ? (
              <div className="loading-state">
                <div className="loading-orb"></div>
                <p className="loading-text">Loading evaluations...</p>
              </div>
            ) : evaluations.length === 0 ? (
              <div className="text-center text-[var(--text-muted)] py-8">
                <p>No evaluations yet. Be the first to evaluate this agent!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {evaluations.map((eval) => (
                  <div key={eval.id} className="p-4 bg-[var(--bg-surface)] rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex gap-4">
                        <div>
                          <div className="text-xs text-[var(--text-muted)]">Performance</div>
                          <div className="text-lg font-bold font-['Orbitron'] text-[var(--warning-orange)]">
                            {eval.performance_score}★
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-[var(--text-muted)]">Reliability</div>
                          <div className="text-lg font-bold font-['Orbitron'] text-[var(--neon-blue)]">
                            {eval.reliability_score}★
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-[var(--text-muted)]">Accuracy</div>
                          <div className="text-lg font-bold font-['Orbitron'] text-[var(--neon-purple)]">
                            {eval.accuracy_score}★
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold font-['Orbitron'] text-[var(--neon-green)]">
                          {eval.overall_score}★
                        </div>
                      </div>
                    </div>

                    {eval.comment && (
                      <p className="text-[var(--text-secondary)] mb-3">{eval.comment}</p>
                    )}

                    <div className="flex items-center justify-between text-sm text-[var(--text-muted)]">
                      <span>{eval.evaluator_address.slice(0, 8)}...</span>
                      <div className="flex items-center gap-4">
                        {eval.compute_used > 0 && (
                          <span>💻 {eval.compute_used} compute</span>
                        )}
                        <span>{new Date(eval.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
