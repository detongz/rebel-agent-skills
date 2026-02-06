// app/page.tsx - 首页
'use client';

import '@rainbow-me/rainbowkit/styles.css';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { config } from '@/lib/wagmi';
import ConnectButton from '@/components/ConnectButton';
import SkillCard from '@/components/SkillCard';
import { useEffect, useState } from 'react';

const queryClient = new QueryClient();

function HomePage() {
  const [skills, setSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [platform, setPlatform] = useState('all');
  const [sort, setSort] = useState('tips');

  useEffect(() => {
    fetchSkills();
  }, [platform, sort]);

  const fetchSkills = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (platform && platform !== 'all') params.set('platform', platform);
      if (sort) params.set('sort', sort);

      const url = params.toString() ? `/api/skills?${params.toString()}` : '/api/skills';
      const res = await fetch(url);
      const data = await res.json();
      setSkills(data.skills || []);
    } catch (error) {
      console.error('获取 Skills 失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <div className="app-shell">
            {/* 背景装饰 */}
            <div className="app-backdrop" aria-hidden="true" />

            {/* 导航栏：统一风格 */}
            <nav className="app-nav">
              <div className="nav-left">
                <div className="brand-mark">
                  <span className="brand-orb" />
                  <span className="brand-text">Agent Reward Hub</span>
                </div>
              </div>
              <div className="nav-right">
                <div className="nav-links-container">
                  <a href="#skills" className="nav-link">
                    Skills
                  </a>
                  <a href="/leaderboard" className="nav-link">
                    Leaderboard
                  </a>
                  <a href="/create" className="nav-link">
                    Create
                  </a>
                  <a href="https://github.com/detongz/rebel-agent-skills" target="_blank" rel="noreferrer" className="nav-link">
                    Learn More
                  </a>
                </div>
                <ConnectButton />
              </div>
            </nav>

            {/* 主体内容 */}
            <main className="app-main">
              {/* Hero Section：居中大标题 */}
              <section className="hero">
                <div className="hero-copy">
                  <span className="hero-kicker">Agent Reward Hub</span>
                  <h1 className="hero-title">
                    One-click for Creator Rewards
                  </h1>
                  <p className="hero-subtitle">
                    Cross-platform Agent Skill tipping protocol.
                    Support Coze, Claude Code, Manus, MiniMax and more.
                    One registration, rewards across all platforms.
                  </p>
                  <div className="hero-actions">
                    <a href="#skills" className="primary-btn">
                      Discover Skills
                    </a>
                    <a href="/create" className="ghost-btn">
                      Create Skill
                    </a>
                  </div>
                  <div className="hero-meta">
                    <span>Monad Testnet · $ASKL</span>
                    <span>98% Creator · 2% Burn/Treasury</span>
                  </div>
                </div>
              </section>

              {/* Skills 目录 */}
              <section id="skills" className="skills-section">
                <header className="skills-header">
                  <div>
                    <h2 className="skills-title">Skills Directory</h2>
                    <p className="skills-subtitle">
                      High-quality Skills aggregated from multiple Agent platforms. Tip creators with one click.
                    </p>
                  </div>
                  <div className="skills-filters">
                    <select
                      className="filter-select"
                      aria-label="Filter by platform"
                      value={platform}
                      onChange={(event) => setPlatform(event.target.value)}
                    >
                      <option value="all">All Platforms</option>
                      <option value="coze">Coze</option>
                      <option value="claude-code">Claude Code</option>
                      <option value="manus">Manus</option>
                      <option value="minimax">MiniMax</option>
                    </select>
                    <select
                      className="filter-select"
                      aria-label="Sort by"
                      value={sort}
                      onChange={(event) => setSort(event.target.value)}
                    >
                      <option value="tips">Most Tipped</option>
                      <option value="likes">Most Liked</option>
                      <option value="latest">Latest</option>
                    </select>
                  </div>
                </header>

                {loading ? (
                  <div className="loading-state">
                    <div className="loading-orb" />
                    <p className="loading-text">Loading Skills...</p>
                  </div>
                ) : skills.length === 0 ? (
                  <div className="empty-state">
                    <h3>No Skills Yet</h3>
                    <p>Be the first to create a Skill and turn your Agent capabilities into rewardable assets.</p>
                    <a href="/create" className="primary-btn">
                      Create Skill
                    </a>
                  </div>
                ) : (
                  <div className="skills-grid">
                    {skills.map((skill) => (
                      <SkillCard key={skill.id} skill={skill} onTipped={fetchSkills} />
                    ))}
                  </div>
                )}
              </section>
            </main>

            {/* 页脚 */}
            <footer className="app-footer">
              <div className="footer-left">
                <span>Agent Reward Hub · Monad Hackathon 2026</span>
                <span className="footer-dim">
                  Deployed on{" "}
                  <a
                    href="https://testnet-explorer.monad.xyz"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Monad Testnet
                  </a>
                </span>
              </div>
              <div className="footer-right">
                <span className="footer-pill">98% → Creator</span>
                <span className="footer-pill">2% → Burn/Treasury</span>
              </div>
            </footer>
          </div>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default HomePage;
