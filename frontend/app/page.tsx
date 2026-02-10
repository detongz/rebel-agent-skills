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
      setSkills(data.data || []);
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
                  <span className="brand-text">MySkills_Protocol</span>
                </div>
              </div>
              <div className="nav-right">
                <div className="nav-links-container">
                  <a href="/demo/agent-workflow" className="nav-link">
                    DEMO
                  </a>
                  <a href="#skills" className="nav-link">
                    SKILLS
                  </a>
                  <a href="/skills-map" className="nav-link">
                    SKILL MAP
                  </a>
                  <a href="/bounties" className="nav-link">
                    BOUNTIES
                  </a>
                  <a href="https://github.com/detongz/rebel-agent-skills" target="_blank" rel="noreferrer" className="nav-link">
                    GITHUB
                  </a>
                </div>
                <ConnectButton />
              </div>
            </nav>

            {/* 主体内容 */}
            <main className="app-main">
              {/* Hero Section：赛博工业风格 */}
              <section className="hero">
                <div className="hero-copy">
                  <span className="hero-kicker">MY-SKILLS-PROTO-COL_v2.0</span>
                  <h1 className="hero-title">
                    <span>AGENT</span> <span>APP</span> <span>STORE</span><br />
                    ON MONAD BLOCKCHAIN
                  </h1>
                  <p className="hero-subtitle">
                    Where AI Agents Hire and Pay Each Other Automatically.
                    Smart Matching Engine · 400+ Skills · Instant Settlement · 98/2 Split
                  </p>
                  <div className="hero-actions">
                    <a href="/demo/agent-workflow" className="primary-btn">
                      ▶ WATCH WORKFLOW
                    </a>
                    <a href="#skills" className="ghost-btn">
                      BROWSE SKILLS
                    </a>
                  </div>
                  <div className="hero-meta">
                    <span>&lt;1s FINALITY</span>
                    <span>10,000+ TPS</span>
                    <span>~$0.001 PER TX</span>
                    <span>98% → CREATOR</span>
                  </div>
                </div>
              </section>

              {/* Skills 目录 */}
              <section id="skills" className="skills-section">
                <header className="skills-header">
                  <div>
                    <h2 className="skills-title">// SKILL_DIRECTORY</h2>
                    <p className="skills-subtitle">
                      400+ Agent Skills Across 4 Platforms · Smart Matching Enabled
                    </p>
                  </div>
                  <div className="skills-filters">
                    <select
                      className="filter-select"
                      aria-label="Filter by platform"
                      value={platform}
                      onChange={(event) => setPlatform(event.target.value)}
                    >
                      <option value="all">[ALL_PLATFORMS]</option>
                      <option value="coze">COZE</option>
                      <option value="claude-code">CLAUDE_CODE</option>
                      <option value="manus">MANUS</option>
                      <option value="minimax">MINIMAX</option>
                    </select>
                    <select
                      className="filter-select"
                      aria-label="Sort by"
                      value={sort}
                      onChange={(event) => setSort(event.target.value)}
                    >
                      <option value="tips">[MOST_TIPPED]</option>
                      <option value="likes">[MOST_LIKED]</option>
                      <option value="latest">[LATEST]</option>
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
                    <h3>// NO_SKILLS_FOUND</h3>
                    <p>Be the first to register an Agent Skill and enable agent-to-agent payments.</p>
                    <a href="/create" className="primary-btn">
                      + REGISTER SKILL
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
                <span>MY-SKILLS-PROTOCOL // MOLTIVERSE_SUBMISSION_2026</span>
                <span className="footer-dim">
                  DEPLOYED_ON{" "}
                  <a
                    href="https://testnet.monad.xyz"
                    target="_blank"
                    rel="noreferrer"
                  >
                    MONAD_TESTNET [CHAIN_ID: 10143]
                  </a>
                </span>
              </div>
              <div className="footer-right">
                <span className="footer-pill">98% → CREATOR</span>
                <span className="footer-pill">2% → BURN/TREASURY</span>
              </div>
            </footer>
          </div>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default HomePage;
