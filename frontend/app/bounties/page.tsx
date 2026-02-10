'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAccount } from 'wagmi';

interface Bounty {
  id: string;
  title: string;
  description: string;
  reward: number;
  category: string;
  creator: string;
  status: 'open' | 'in-progress' | 'completed' | 'cancelled';
  createdAt: Date;
  deadline?: Date;
  assignee?: string;
}

export default function BountiesPage() {
  const { isConnected } = useAccount();
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    status: 'all' as 'all' | 'open' | 'in-progress' | 'completed',
    category: '',
    sortBy: 'newest' as 'newest' | 'reward' | 'deadline'
  });

  useEffect(() => {
    fetchBounties();
  }, [filter]);

  const fetchBounties = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (filter.status !== 'all') queryParams.append('status', filter.status);
      if (filter.category) queryParams.append('category', filter.category);
      if (filter.sortBy) queryParams.append('sortBy', filter.sortBy);

      const response = await fetch(`/api/bounties?${queryParams.toString()}`);
      const result = await response.json();

      if (result.success) {
        const bountiesWithDates = result.data.map((bounty: any) => ({
          ...bounty,
          createdAt: new Date(bounty.createdAt),
          deadline: bounty.deadline ? new Date(bounty.deadline) : undefined,
        }));
        setBounties(bountiesWithDates);
      } else {
        console.error('API error:', result.error);
        setBounties([]);
      }
    } catch (error) {
      console.error('Failed to fetch bounties:', error);
      setBounties([]);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryStyle = (category: string) => {
    const styles: Record<string, { bg: string; color: string; border: string }> = {
      'security-audit': { bg: 'rgba(255, 102, 0, 0.1)', color: 'var(--warning-orange)', border: 'rgba(255, 102, 0, 0.3)' },
      'code-review': { bg: 'rgba(0, 212, 255, 0.1)', color: 'var(--neon-blue)', border: 'rgba(0, 212, 255, 0.3)' },
      'test-generation': { bg: 'rgba(0, 255, 136, 0.1)', color: 'var(--neon-green)', border: 'rgba(0, 255, 136, 0.3)' },
      'optimization': { bg: 'rgba(147, 51, 234, 0.1)', color: '#9333ea', border: 'rgba(147, 51, 234, 0.3)' },
      'documentation': { bg: 'rgba(255, 255, 0, 0.1)', color: '#ffff00', border: 'rgba(255, 255, 0, 0.3)' },
      'other': { bg: 'rgba(128, 128, 128, 0.1)', color: 'var(--text-muted)', border: 'rgba(128, 128, 128, 0.3)' }
    };
    return styles[category] || styles.other;
  };

  const getStatusStyle = (status: string) => {
    const styles: Record<string, { bg: string; color: string; text: string }> = {
      'open': { bg: 'rgba(0, 255, 136, 0.1)', color: 'var(--neon-green)', text: 'OPEN' },
      'in-progress': { bg: 'rgba(255, 255, 0, 0.1)', color: '#ffff00', text: 'IN_PROGRESS' },
      'completed': { bg: 'rgba(0, 212, 255, 0.1)', color: 'var(--neon-blue)', text: 'COMPLETED' },
      'cancelled': { bg: 'rgba(255, 102, 0, 0.1)', color: 'var(--warning-orange)', text: 'CANCELLED' }
    };
    return styles[status] || styles.open;
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatDate = (date: Date) => {
    return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
      Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      'day'
    );
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
            <Link href="/bounties" className="nav-link text-[var(--neon-green)]">BOUNTIES</Link>
          </div>
        </div>
      </nav>

      <main className="app-main">
        <section className="hero">
          <div className="hero-copy">
            <span className="hero-kicker">BOUNTY_MARKETPLACE_v1.0</span>
            <h1 className="hero-title">
              <span>AGENT</span> <span>BOUNTIES</span>
            </h1>
            <p className="hero-subtitle">
              Post and claim bounties for custom agent skill development
            </p>
            <div className="hero-actions">
              {isConnected && (
                <Link href="/bounties/new" className="primary-btn">
                  + POST_BOUNTY
                </Link>
              )}
            </div>
          </div>
        </section>

        <section className="skills-section">
          <div className="skills-header">
            <div>
              <h2 className="skills-title">// AVAILABLE_BOUNTIES</h2>
              <p className="skills-subtitle">
                Earn rewards by completing agent skill development tasks
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="bounty-filters">
            <select
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value as any })}
              className="filter-select"
            >
              <option value="all">[ALL_STATUS]</option>
              <option value="open">OPEN</option>
              <option value="in-progress">IN_PROGRESS</option>
              <option value="completed">COMPLETED</option>
            </select>
            <select
              value={filter.category}
              onChange={(e) => setFilter({ ...filter, category: e.target.value })}
              className="filter-select"
            >
              <option value="">[ALL_CATEGORIES]</option>
              <option value="security-audit">SECURITY_AUDIT</option>
              <option value="code-review">CODE_REVIEW</option>
              <option value="test-generation">TEST_GENERATION</option>
              <option value="optimization">OPTIMIZATION</option>
              <option value="documentation">DOCUMENTATION</option>
            </select>
            <select
              value={filter.sortBy}
              onChange={(e) => setFilter({ ...filter, sortBy: e.target.value as any })}
              className="filter-select"
            >
              <option value="newest">[NEWEST]</option>
              <option value="reward">[HIGHEST_REWARD]</option>
              <option value="deadline">[DEADLINE]</option>
            </select>
            <div className="bounty-count">
              {loading ? 'LOADING...' : `${bounties.length}_BOUNTIES`}
            </div>
          </div>

          {/* Bounty List */}
          {loading ? (
            <div className="loading-state">
              <div className="loading-orb"></div>
              <p className="loading-text">Loading bounties...</p>
            </div>
          ) : bounties.length === 0 ? (
            <div className="glass-card text-center py-20">
              <p className="text-[var(--text-muted)] text-lg mb-4">NO_BOUNTIES_FOUND</p>
              {isConnected && (
                <Link href="/bounties/new" className="primary-btn">
                  + POST_FIRST_BOUNTY
                </Link>
              )}
            </div>
          ) : (
            <div className="skills-grid">
              {bounties.map((bounty) => {
                const categoryStyle = getCategoryStyle(bounty.category);
                const statusStyle = getStatusStyle(bounty.status);

                return (
                  <Link
                    key={bounty.id}
                    href={`/bounties/${bounty.id}`}
                    className="skill-card"
                  >
                    <div className="skill-card-header">
                      <span
                        className="skill-platform-pill"
                        style={{
                          background: categoryStyle.bg,
                          color: categoryStyle.color,
                          border: `1px solid ${categoryStyle.border}`,
                        }}
                      >
                        {bounty.category.replace('-', '_').toUpperCase()}
                      </span>
                      <span
                        className="skill-creator"
                        title={bounty.creator}
                      >
                        {formatAddress(bounty.creator)}
                      </span>
                    </div>

                    <h3 className="skill-title">{bounty.title}</h3>
                    <p className="skill-description">{bounty.description}</p>

                    {/* Status Badge */}
                    <div className="flex gap-2 mb-4">
                      <span
                        className="px-3 py-1 rounded text-xs font-mono border"
                        style={{
                          background: statusStyle.bg,
                          color: statusStyle.color,
                          borderColor: statusStyle.color,
                        }}
                      >
                        {statusStyle.text}
                      </span>
                      {bounty.deadline && (
                        <span className="text-xs text-[var(--text-muted)] font-mono">
                          ⏰ {formatDate(bounty.deadline)}
                        </span>
                      )}
                    </div>

                    {/* Creator/Assignee Info */}
                    <div className="flex items-center gap-4 text-sm mb-4 text-[var(--text-muted)]">
                      <div className="flex items-center gap-2">
                        <span>👤</span>
                        <span>{formatAddress(bounty.creator)}</span>
                      </div>
                      {bounty.assignee && (
                        <div className="flex items-center gap-2">
                          <span>✅</span>
                          <span>{formatAddress(bounty.assignee)}</span>
                        </div>
                      )}
                    </div>

                    {/* Reward */}
                    <div className="skill-stats">
                      <span className="skill-tips">
                        {parseFloat(bounty.reward.toString()).toFixed(2)} ASKL
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
