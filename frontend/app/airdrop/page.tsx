"use client";

import { useState, useEffect } from "react";
import { useAccount, useConnect } from "wagmi";
import { injected } from "wagmi/connectors";
import Link from "next/link";

interface EligibleReview {
  id: string;
  skillName: string;
  reviewContent: string;
  qualityScore: number;
  amount: number;
  currency: string;
  submittedAt: string;
}

interface LeaderboardEntry {
  rank: number;
  address: string;
  totalEarned: number;
  reviewCount: number;
  avgQuality: number;
  badge: 'gold' | 'silver' | 'bronze' | null;
}

interface HistoryEntry {
  id: string;
  txHash: string;
  reviewIds: string[];
  amount: number;
  currency: string;
  status: string;
  timestamp: string;
  explorerUrl: string;
}

export default function AirdropPage() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();

  const [eligibilityData, setEligibilityData] = useState<{
    eligibleReviews: EligibleReview[];
    summary: {
      totalAmount: number;
      reviewCount: number;
      avgQuality: number;
    };
    userRank: LeaderboardEntry | null;
  } | null>(null);

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [selectedReviews, setSelectedReviews] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [activeTab, setActiveTab] = useState<'eligible' | 'history' | 'leaderboard'>('eligible');

  useEffect(() => {
    if (isConnected && address) {
      fetchEligibility();
      fetchHistory();
    }
  }, [isConnected, address]);

  const fetchEligibility = async () => {
    if (!address) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/airdrop/eligibility?wallet=${address}`);
      const data = await res.json();

      if (data.success) {
        setEligibilityData(data.data);
        setLeaderboard(data.leaderboard || []);
      }
    } catch (error) {
      console.error('Error fetching eligibility:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    if (!address) return;

    try {
      const res = await fetch(`/api/airdrop/history?wallet=${address}`);
      const data = await res.json();

      if (data.success) {
        setHistory(data.data.history);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const toggleReviewSelection = (reviewId: string) => {
    const newSelected = new Set(selectedReviews);
    if (newSelected.has(reviewId)) {
      newSelected.delete(reviewId);
    } else {
      newSelected.add(reviewId);
    }
    setSelectedReviews(newSelected);
  };

  const selectAll = () => {
    if (!eligibilityData) return;
    const allIds = new Set(eligibilityData.eligibleReviews.map(r => r.id));
    setSelectedReviews(allIds);
  };

  const clearSelection = () => {
    setSelectedReviews(new Set());
  };

  const handleClaim = async () => {
    if (!address || selectedReviews.size === 0) return;

    try {
      setClaiming(true);
      const res = await fetch('/api/airdrop/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet: address,
          reviewIds: Array.from(selectedReviews),
        }),
      });

      const data = await res.json();

      if (data.success) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);

        await Promise.all([fetchEligibility(), fetchHistory()]);
        setSelectedReviews(new Set());
      }
    } catch (error) {
      console.error('Error claiming airdrop:', error);
    } finally {
      setClaiming(false);
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getQualityColor = (score: number) => {
    if (score >= 90) return 'text-[var(--neon-green)]';
    if (score >= 75) return 'text-[var(--neon-blue)]';
    if (score >= 60) return 'text-[var(--warning-orange)]';
    return 'text-[var(--text-muted)]';
  };

  const getBadgeIcon = (badge: string | null) => {
    if (badge === 'gold') return '🏆';
    if (badge === 'silver') return '🥈';
    if (badge === 'bronze') return '🥉';
    return null;
  };

  const totalSelectedAmount = eligibilityData
    ? eligibilityData.eligibleReviews
        .filter(r => selectedReviews.has(r.id))
        .reduce((sum, r) => sum + r.amount, 0)
    : 0;

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
            <Link href="/reviews" className="nav-link">REVIEWS</Link>
            {isConnected && (
              <Link href="/airdrop" className="nav-link text-[var(--neon-green)]">AIRDROP</Link>
            )}
          </div>
          <button
            onClick={() => connect({ connector: injected() })}
            className="primary-btn"
          >
            {isConnected ? formatAddress(address || '') : 'CONNECT'}
          </button>
        </div>
      </nav>

      <main className="app-main">
        <section className="hero">
          <div className="hero-copy">
            <span className="hero-kicker">REVIEW_AIRDROP_PROGRAM</span>
            <h1 className="hero-title">
              <span>EARN</span> <span>ASKL</span> <span>TOKENS</span>
            </h1>
            <p className="hero-subtitle">
              Review agent skills and earn ASKL tokens based on quality.
              High-quality reviews = Higher rewards.
            </p>
          </div>
        </section>

        {/* Confetti Animation */}
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4 animate-bounce">🎉</div>
              <div className="glass-card p-6 bg-[var(--neon-green)]/20 border-[var(--neon-green)]">
                <h3 className="font-['Orbitron'] text-2xl text-[var(--neon-green)]">CLAIM SUCCESSFUL!</h3>
                <p className="font-mono text-lg">{totalSelectedAmount} ASKL tokens claimed</p>
              </div>
            </div>
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(50)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 rounded-full animate-ping"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    backgroundColor: ['#00ff88', '#00d4ff', '#ff6600', '#ffd700'][Math.floor(Math.random() * 4)],
                    animationDelay: `${Math.random() * 0.5}s`,
                    animationDuration: `${0.5 + Math.random() * 0.5}s`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Wallet Connection */}
        {!isConnected ? (
          <div className="glass-card max-w-2xl mx-auto text-center p-12">
            <div className="text-6xl mb-6">🔗</div>
            <h2 className="font-['Orbitron'] text-2xl mb-4">Connect Your Wallet</h2>
            <p className="text-[var(--text-secondary)] mb-8">
              Connect your wallet to check your airdrop eligibility and claim rewards.
            </p>
            <button
              onClick={() => connect({ connector: injected() })}
              className="primary-btn"
            >
              CONNECT WALLET
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Summary Cards */}
            <div className="grid md:grid-cols-4 gap-4">
              <div className="glass-card text-center">
                <div className="text-3xl font-bold text-[var(--neon-green)] font-['Orbitron']">
                  {eligibilityData?.summary.totalAmount || 0}
                </div>
                <div className="text-sm text-[var(--text-muted)] font-['Rajdhani']">Eligible ASKL</div>
              </div>
              <div className="glass-card text-center">
                <div className="text-3xl font-bold text-[var(--neon-blue)] font-['Orbitron']">
                  {eligibilityData?.summary.reviewCount || 0}
                </div>
                <div className="text-sm text-[var(--text-muted)] font-['Rajdhani']">Qualifying Reviews</div>
              </div>
              <div className="glass-card text-center">
                <div className="text-3xl font-bold text-[var(--warning-orange)] font-['Orbitron']">
                  {eligibilityData?.summary.avgQuality.toFixed(1) || '0.0'}
                </div>
                <div className="text-sm text-[var(--text-muted)] font-['Rajdhani']">Avg Quality Score</div>
              </div>
              <div className="glass-card text-center">
                <div className="text-3xl font-bold text-[#ffd700] font-['Orbitron']">
                  #{eligibilityData?.userRank?.rank || '-'}
                </div>
                <div className="text-sm text-[var(--text-muted)] font-['Rajdhani']">Your Rank</div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="glass-card">
              <div className="flex gap-2 p-2 border-b border-[rgba(0,255,136,0.1)]">
                <button
                  onClick={() => setActiveTab('eligible')}
                  className={`flex-1 py-3 px-4 font-mono text-sm uppercase transition-all ${
                    activeTab === 'eligible'
                      ? 'text-[var(--neon-green)] border-b-2 border-[var(--neon-green)]'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                  }`}
                >
                  Eligible Reviews ({eligibilityData?.eligibleReviews.length || 0})
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`flex-1 py-3 px-4 font-mono text-sm uppercase transition-all ${
                    activeTab === 'history'
                      ? 'text-[var(--neon-green)] border-b-2 border-[var(--neon-green)]'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                  }`}
                >
                  Claim History ({history.length})
                </button>
                <button
                  onClick={() => setActiveTab('leaderboard')}
                  className={`flex-1 py-3 px-4 font-mono text-sm uppercase transition-all ${
                    activeTab === 'leaderboard'
                      ? 'text-[var(--neon-green)] border-b-2 border-[var(--neon-green)]'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                  }`}
                >
                  Leaderboard
                </button>
              </div>

              {/* Eligible Reviews Tab */}
              {activeTab === 'eligible' && (
                <div className="p-6">
                  {loading ? (
                    <div className="text-center py-12">
                      <div className="loading-orb mx-auto mb-4" />
                      <p className="loading-text">Loading eligibility data...</p>
                    </div>
                  ) : eligibilityData?.eligibleReviews.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-5xl mb-4">📝</div>
                      <h3 className="font-['Orbitron'] text-xl mb-2">No Eligible Reviews</h3>
                      <p className="text-[var(--text-muted)]">
                        Submit high-quality reviews to earn ASKL tokens.
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Selection Actions */}
                      <div className="flex items-center justify-between mb-6 pb-4 border-b border-[rgba(0,255,136,0.1)]">
                        <div className="flex gap-2">
                          <button
                            onClick={selectAll}
                            className="px-4 py-2 text-xs font-mono uppercase bg-[var(--bg-surface)] border border-[rgba(0,255,136,0.2)] rounded hover:border-[var(--neon-green)] transition-all"
                          >
                            Select All
                          </button>
                          <button
                            onClick={clearSelection}
                            className="px-4 py-2 text-xs font-mono uppercase bg-[var(--bg-surface)] border border-[rgba(0,255,136,0.2)] rounded hover:border-[var(--neon-green)] transition-all"
                          >
                            Clear
                          </button>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-[var(--text-muted)] font-mono">Selected Amount</div>
                          <div className="text-xl font-bold text-[var(--neon-green)] font-['Orbitron']">
                            {totalSelectedAmount} ASKL
                          </div>
                        </div>
                      </div>

                      {/* Reviews List */}
                      <div className="space-y-4">
                        {eligibilityData?.eligibleReviews.map((review) => (
                          <div
                            key={review.id}
                            onClick={() => toggleReviewSelection(review.id)}
                            className={`glass-card p-4 cursor-pointer transition-all ${
                              selectedReviews.has(review.id)
                                ? 'border-[var(--neon-green)] bg-[rgba(0,255,136,0.05)]'
                                : 'border-[rgba(0,255,136,0.1)] hover:border-[rgba(0,255,136,0.3)]'
                            }`}
                          >
                            <div className="flex items-start gap-4">
                              <input
                                type="checkbox"
                                checked={selectedReviews.has(review.id)}
                                onChange={() => toggleReviewSelection(review.id)}
                                className="mt-1 w-5 h-5 accent-[var(--neon-green)]"
                              />
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-['Orbitron'] text-lg">{review.skillName}</h4>
                                  <div className="text-right">
                                    <div className="text-xl font-bold text-[var(--neon-green)] font-['Orbitron']">
                                      {review.amount} ASKL
                                    </div>
                                  </div>
                                </div>
                                <p className="text-[var(--text-secondary)] text-sm mb-3 line-clamp-2">
                                  {review.reviewContent}
                                </p>
                                <div className="flex items-center gap-4 text-xs font-mono">
                                  <div>
                                    <span className="text-[var(--text-muted)]">Quality: </span>
                                    <span className={getQualityColor(review.qualityScore)}>
                                      {review.qualityScore}/100
                                    </span>
                                  </div>
                                  <div className="text-[var(--text-muted)]">
                                    {formatDate(review.submittedAt)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Claim Button */}
                      {selectedReviews.size > 0 && (
                        <div className="mt-6 pt-6 border-t border-[rgba(0,255,136,0.1)]">
                          <button
                            onClick={handleClaim}
                            disabled={claiming}
                            className="success-btn w-full text-center"
                          >
                            {claiming ? '⏳ PROCESSING...' : `💰 CLAIM ${totalSelectedAmount} ASKL`}
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* History Tab */}
              {activeTab === 'history' && (
                <div className="p-6">
                  {history.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-5xl mb-4">📋</div>
                      <h3 className="font-['Orbitron'] text-xl mb-2">No Claim History</h3>
                      <p className="text-[var(--text-muted)]">
                        Your claimed airdrops will appear here.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {history.map((entry) => (
                        <div key={entry.id} className="glass-card p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className={`px-3 py-1 rounded text-xs font-mono uppercase ${
                                entry.status === 'completed'
                                  ? 'bg-[var(--neon-green)]/10 text-[var(--neon-green)] border border-[var(--neon-green)]'
                                  : 'bg-[var(--warning-orange)]/10 text-[var(--warning-orange)] border border-[var(--warning-orange)]'
                              }`}>
                                {entry.status}
                              </div>
                              <div className="text-sm text-[var(--text-muted)] font-mono">
                                {formatDate(entry.timestamp)}
                              </div>
                            </div>
                            <div className="text-xl font-bold text-[var(--neon-green)] font-['Orbitron']">
                              {entry.amount} ASKL
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <div className="font-mono text-[var(--text-muted)]">
                              TX: {entry.txHash.slice(0, 10)}...{entry.txHash.slice(-8)}
                            </div>
                            <a
                              href={entry.explorerUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[var(--neon-blue)] hover:underline font-mono text-xs"
                            >
                              View on Explorer →
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Leaderboard Tab */}
              {activeTab === 'leaderboard' && (
                <div className="p-6">
                  <div className="space-y-3">
                    {leaderboard.map((entry) => (
                      <div
                        key={entry.address}
                        className={`glass-card p-4 transition-all ${
                          entry.address.toLowerCase() === address?.toLowerCase()
                            ? 'border-[var(--neon-green)] bg-[rgba(0,255,136,0.05)]'
                            : ''
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 flex items-center justify-center font-['Orbitron'] font-bold">
                            {entry.badge ? (
                              <span className="text-2xl">{getBadgeIcon(entry.badge)}</span>
                            ) : (
                              <span className="text-[var(--text-muted)]">#{entry.rank}</span>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="font-mono text-sm mb-1">
                              {entry.address.toLowerCase() === address?.toLowerCase()
                                ? 'You'
                                : formatAddress(entry.address)}
                            </div>
                            <div className="flex gap-4 text-xs text-[var(--text-muted)]">
                              <span>{entry.reviewCount} reviews</span>
                              <span>{entry.avgQuality.toFixed(1)} avg quality</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-[var(--neon-green)] font-['Orbitron']">
                              {entry.totalEarned} ASKL
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="py-12 text-center text-[var(--text-muted)] font-['Rajdhani']">
          <p className="mb-4">Review Airdrop Program • Earn ASKL Tokens</p>
          <div className="flex gap-4 justify-center text-sm">
            <Link href="/docs" className="text-[var(--neon-purple)] hover:underline">Documentation</Link>
            <a href="https://testnet.monad.xyz" target="_blank" className="text-[var(--neon-blue)] hover:underline">Monad Testnet</a>
            <a href="https://github.com" target="_blank" className="text-[var(--neon-green)] hover:underline">GitHub</a>
          </div>
        </footer>
      </main>
    </div>
  );
}
