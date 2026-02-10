'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';

interface AirdropEligibility {
  eligible_amount: number;
  qualified_reviews: number;
  breakdown: Array<{
    skill_id: string;
    score: number;
    amount: number;
  }>;
}

interface AirdropHistory {
  id: string;
  amount: number;
  tx_hash: string;
  created_at: string;
  status: 'pending' | 'sent' | 'claimed';
}

export default function AirdropPage() {
  const { isConnected, address } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  const [eligibility, setEligibility] = useState<AirdropEligibility | null>(null);
  const [history, setHistory] = useState<AirdropHistory[]>([]);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    if (address) {
      loadEligibility();
      loadHistory();
    }
  }, [address]);

  const loadEligibility = async () => {
    if (!address) return;
    try {
      const res = await fetch('/api/reviews/airdrop/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet_address: address }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setEligibility(data.data);
        }
      }
    } catch (error) {
      console.error('Failed to load eligibility:', error);
    }
  };

  const loadHistory = async () => {
    if (!address) return;
    try {
      // In production, fetch from API
      setHistory([]);
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  const handleClaim = async () => {
    if (!address) return;
    setClaiming(true);
    try {
      const res = await fetch('/api/airdrop/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet_address: address }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          alert(`Airdrop claimed successfully! TX: ${data.data.tx_hash}`);
          loadHistory();
          loadEligibility();
        }
      }
    } catch (error) {
      console.error('Failed to claim airdrop:', error);
      alert('Failed to claim airdrop. Please try again.');
    } finally {
      setClaiming(false);
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
            <Link href="/airdrop" className="nav-link text-[var(--warning-orange)]">AIRDROP</Link>
          </div>
        </div>
      </nav>

      <main className="app-main">
        <section className="hero">
          <div className="hero-copy">
            <span className="hero-kicker">AIRDROP_DASHBOARD_v1.0</span>
            <h1 className="hero-title">
              <span>EARN</span> <span>AIRDROPS</span>
            </h1>
            <p className="hero-subtitle">
              Get rewarded for writing quality skill reviews
            </p>
          </div>
        </section>

        <section className="skills-section">
          {!isConnected ? (
            <div className="glass-card text-center py-20">
              <p className="text-[var(--text-muted)] text-lg mb-6">
                Connect your wallet to check your airdrop eligibility
              </p>
              <button
                onClick={() => connect({ connector: injected() })}
                className="primary-btn"
              >
                🔗 Connect Wallet
              </button>
            </div>
          ) : (
            <>
              {/* Eligibility Card */}
              {eligibility && (
                <div className="glass-card mb-8">
                  <h3 className="text-xl font-['Orbitron'] text-[var(--neon-green)] mb-6">
                    Your Airdrop Eligibility
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-[var(--neon-green)] font-['Orbitron']">
                        ${eligibility.eligible_amount.toFixed(2)}
                      </div>
                      <div className="text-sm text-[var(--text-muted)] font-['Rajdhani']">
                        Eligible Amount
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-[var(--neon-blue)] font-['Orbitron']">
                        {eligibility.qualified_reviews}
                      </div>
                      <div className="text-sm text-[var(--text-muted)] font-['Rajdhani']">
                        Qualified Reviews
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-[var(--neon-purple)] font-['Orbitron']">
                        {eligibility.breakdown.length}
                      </div>
                      <div className="text-sm text-[var(--text-muted)] font-['Rajdhani']">
                        Total Reviews
                      </div>
                    </div>
                  </div>

                  {eligibility.eligible_amount > 0 ? (
                    <button
                      onClick={handleClaim}
                      disabled={claiming}
                      className="success-btn w-full text-center text-lg py-4"
                    >
                      {claiming ? '⏳ Claiming...' : '💰 Claim Airdrop'}
                    </button>
                  ) : (
                    <div className="text-center text-[var(--text-muted)] py-4">
                      <p>Write quality reviews to earn airdrops!</p>
                      <Link href="/reviews" className="text-[var(--neon-green)] hover:underline">
                        Browse Skills →
                      </Link>
                    </div>
                  )}

                  {/* Breakdown */}
                  {eligibility.breakdown.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-[var(--text-muted)] font-['Rajdhani'] text-sm mb-3">
                        Quality Score Breakdown
                      </h4>
                      <div className="space-y-2">
                        {eligibility.breakdown.map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-[var(--bg-surface)] rounded-lg">
                            <div className="flex items-center gap-3">
                              <span className="text-[var(--text-muted)] font-mono text-sm">
                                #{index + 1}
                              </span>
                              <span className="text-[var(--text-secondary)]">
                                Skill {item.skill_id}
                              </span>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-[var(--neon-green)] font-['Orbitron']">
                                {item.score}pts
                              </span>
                              <span className="text-[var(--neon-blue)] font-bold font-['Orbitron']">
                                ${item.amount}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Airdrop History */}
              <div className="glass-card">
                <h3 className="text-xl font-['Orbitron'] text-[var(--text-primary)] mb-6">
                  Airdrop History
                </h3>

                {history.length === 0 ? (
                  <div className="text-center text-[var(--text-muted)] py-8">
                    <p>No airdrop history yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {history.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 bg-[var(--bg-surface)] rounded-lg">
                        <div>
                          <div className="font-bold text-[var(--neon-green)] font-['Orbitron']">
                            ${item.amount.toFixed(2)} USDT
                          </div>
                          <div className="text-sm text-[var(--text-muted)] font-mono">
                            {new Date(item.created_at).toLocaleString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={`px-3 py-1 rounded text-xs font-mono ${
                            item.status === 'sent' ? 'bg-[var(--neon-green)]/10 text-[var(--neon-green)]' :
                            item.status === 'claimed' ? 'bg-[var(--neon-blue)]/10 text-[var(--neon-blue)]' :
                            'bg-[var(--text-muted)]/10 text-[var(--text-muted)]'
                          }`}>
                            {item.status.toUpperCase()}
                          </span>
                          <a
                            href={`https://testnet.monadvision.com/tx/${item.tx_hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[var(--neon-purple)] hover:underline text-sm font-mono"
                          >
                            View TX
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
