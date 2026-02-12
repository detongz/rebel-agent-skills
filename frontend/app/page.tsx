// app/page.tsx - 首页
'use client';

import '@rainbow-me/rainbowkit/styles.css';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { config } from '@/lib/wagmi';
import Navbar from '@/components/Navbar';
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
            <Navbar />

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

              {/* Three Ways to Use - 清晰说明三个入口 */}
              <section className="py-16 px-6">
                <div className="max-w-6xl mx-auto">
                  <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                      Use MySkills Your Way
                    </h2>
                    <p className="text-gray-400 text-lg">
                      Three ways to discover and support agent skills
                    </p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    {/* MCP Server */}
                    <div className="bg-gradient-to-br from-purple-900/50 to-purple-950/30 border border-purple-500/30 rounded-xl p-6 hover:border-purple-400/50 transition-all">
                      <div className="text-4xl mb-4">🤖</div>
                      <h3 className="text-xl font-bold text-white mb-2">For AI Agents (MCP)</h3>
                      <div className="bg-black/30 rounded-lg p-3 mb-4">
                        <code className="text-purple-400 text-sm">npx @myskills/mcp-server</code>
                      </div>
                      <p className="text-gray-400 mb-4 text-sm">
                        Connect Claude Desktop to search 400+ skills and tip creators on Monad
                      </p>
                      <a href="https://github.com/detongz/rebel-agent-skills/tree/main/packages/mcp-server" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 text-sm font-medium">
                        View Docs →
                      </a>
                    </div>

                    {/* OpenClaw Plugin */}
                    <div className="bg-gradient-to-br from-blue-900/50 to-blue-950/30 border border-blue-500/30 rounded-xl p-6 hover:border-blue-400/50 transition-all">
                      <div className="text-4xl mb-4">⚡</div>
                      <h3 className="text-xl font-bold text-white mb-2">For OpenClaw</h3>
                      <div className="bg-black/30 rounded-lg p-3 mb-4">
                        <code className="text-blue-400 text-sm">openclaw plugins install ./openclaw</code>
                      </div>
                      <p className="text-gray-400 mb-3 text-sm">
                        1. 安装插件（一次）
                        </p>
                        <p className="text-gray-400 mb-3 text-sm">
                        2. 开始使用 MySkills 命令：
                        </p>
                        <div className="bg-[rgba(0,0,0,0.3)] rounded p-2 mt-2">
                          <code className="text-blue-400 text-xs font-mono block">
                            openclaw myskills list --platform all --sort tips<br/>
                            openclaw myskills find --requirement "security audit"<br/>
                            openclaw myskills tip --skill-id 0x123 --amount 10 --message "Great work!"
                          </code>
                        </div>
                        <p className="text-gray-400 mb-3 text-sm">
                        💡 浏览400+技能，找到适合的agent skill并打赏
                        </p>
                      <a href="https://github.com/detongz/rebel-agent-skills/tree/main/openclaw" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                        Setup Guide →
                      </a>
                    </div>

                    {/* Web UI */}
                    <div className="bg-gradient-to-br from-green-900/50 to-green-950/30 border border-green-500/30 rounded-xl p-6 hover:border-green-400/50 transition-all">
                      <div className="text-4xl mb-4">🌐</div>
                      <h3 className="text-xl font-bold text-white mb-2">For Humans (Web)</h3>
                      <div className="bg-black/30 rounded-lg p-3 mb-4">
                        <code className="text-green-400 text-sm">myskills2026.ddttupupo.buzz</code>
                      </div>
                      <p className="text-gray-400 mb-4 text-sm">
                        Browse skills → Connect wallet → Tip creators directly
                      </p>
                      <a href="#skills" className="text-green-400 hover:text-green-300 text-sm font-medium">
                        Browse Skills →
                      </a>
                    </div>
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
                      <option value="stars">🔥 [HOT_SKILLS]</option>
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
