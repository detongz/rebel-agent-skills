// app/leaderboard/page.tsx - Leaderboard Page
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { config } from '@/lib/wagmi';
import Navbar from '@/components/Navbar';

const queryClient = new QueryClient();

type SortBy = 'tips' | 'stars' | 'likes' | 'downloads';
type Platform = 'all' | 'coze' | 'claude-code' | 'manus' | 'minimax';

function LeaderboardPage() {
  const router = useRouter();
  const [skills, setSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortBy>('tips');
  const [platform, setPlatform] = useState<Platform>('all');

  useEffect(() => {
    fetchSkills();
  }, [sortBy, platform]);

  const fetchSkills = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (sortBy) params.set('sort', sortBy);
      if (platform !== 'all') params.set('platform', platform);

      const res = await fetch(`/api/skills?${params}`);
      const data = await res.json();
      setSkills(data.skills || []);
    } catch (error) {
      console.error('Failed to fetch skills:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number | string) => {
    const n = typeof num === 'string' ? parseFloat(num) / 1e18 : num;
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toString();
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `#${index + 1}`;
  };

  return (
    <div className="app-shell">
      <div className="app-backdrop" aria-hidden="true" />

      <Navbar />

      <main className="app-main">
        <section className="hero">
          <div className="hero-copy">
            <span className="hero-kicker">🏆 Leaderboard</span>
            <h1 className="hero-title">Top Agent Skills</h1>
            <p className="hero-subtitle">
              Discover the most rewarded and popular Agent Skills across all platforms.
            </p>
          </div>
        </section>

        <section className="skills-section">
          <header className="skills-header">
            <div>
              <h2 className="skills-title">Rankings</h2>
              <p className="skills-subtitle">
                Skills ranked by {sortBy === 'tips' ? 'total tips received' : sortBy === 'stars' ? 'GitHub stars' : sortBy === 'likes' ? 'platform likes' : 'downloads'}
              </p>
            </div>
            <div className="skills-filters">
              <select
                className="filter-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
              >
                <option value="tips">Most Tipped</option>
                <option value="stars">GitHub Stars</option>
                <option value="likes">Most Liked</option>
                <option value="downloads">Downloads</option>
              </select>

              <select
                className="filter-select"
                value={platform}
                onChange={(e) => setPlatform(e.target.value as Platform)}
              >
                <option value="all">All Platforms</option>
                <option value="coze">Coze</option>
                <option value="claude-code">Claude Code</option>
                <option value="manus">Manus</option>
                <option value="minimax">MiniMax</option>
              </select>
            </div>
          </header>

          {loading ? (
            <div className="loading-state">
              <div className="loading-orb" />
              <p className="loading-text">Loading rankings...</p>
            </div>
          ) : skills.length === 0 ? (
            <div className="empty-state">
              <h3>No Skills Yet</h3>
              <p>No skills found. Be the first to create a Skill!</p>
            </div>
          ) : (
            <div className="skills-grid">
              {skills.map((skill, index) => (
                <div
                  key={skill.id}
                  className="skill-card"
                  onClick={() => router.push(`/skill/${skill.id}`)}
                  style={{ position: 'relative' }}
                >
                  {/* Rank Badge */}
                  <div style={{
                    position: 'absolute',
                    top: '-10px',
                    left: '-10px',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: index < 3
                      ? 'linear-gradient(135deg, #ffd700, #ff8c00)'
                      : 'var(--glass-bg-strong)',
                    border: '2px solid var(--glass-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: index < 3 ? '18px' : '14px',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                  }}>
                    {getRankIcon(index)}
                  </div>

                  {/* Platform & Creator */}
                  <div className="skill-card-header">
                    <span className="skill-platform-pill">
                      {skill.platform}
                    </span>
                    <span className="skill-creator" title={skill.payment_address}>
                      {skill.payment_address?.slice(0, 6)}...{skill.payment_address?.slice(-4)}
                    </span>
                  </div>

                  {/* Name and Description */}
                  <h3 className="skill-title">{skill.name}</h3>
                  <p className="skill-description">{skill.description}</p>

                  {/* Stats */}
                  <div className="skill-stats">
                    {skill.github_stars > 0 && (
                      <span title="GitHub Stars">{formatNumber(skill.github_stars)} ⭐</span>
                    )}
                    {skill.platform_likes > 0 && (
                      <span title="Likes">{formatNumber(skill.platform_likes)}</span>
                    )}
                    {skill.tip_count > 0 && (
                      <span title="Tip Count">{skill.tip_count} tips</span>
                    )}
                    <span title="Total Tips" className="skill-tips">
                      {formatNumber(skill.total_tips || '0')} ASKL
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default function Page() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <LeaderboardPage />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
