// app/page.tsx - 首页
'use client';

import '@rainbow-me/rainbowkit/styles.css';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { config } from '@/lib/wagmi';
import Navbar from '@/components/Navbar';
import SkillCard from '@/components/SkillCard';
import { FormEvent, useEffect, useState } from 'react';

const queryClient = new QueryClient();

function HomePage() {
  const [skills, setSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('reviews');
  const [searchInput, setSearchInput] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const activePlatforms = new Set(
    skills
      .map((skill) => String(skill.platform || '').trim())
      .filter(Boolean)
  );
  const skillsCountLabel = loading ? '...' : String(total);
  const platformCountLabel = loading ? '...' : String(activePlatforms.size);

  useEffect(() => {
    fetchSkills();
  }, [sort, query, page, pageSize]);

  const fetchSkills = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (sort) params.set('sort', sort);
      if (query) params.set('q', query);
      params.set('page', String(page));
      params.set('pageSize', String(pageSize));

      const url = params.toString() ? `/api/skills?${params.toString()}` : '/api/skills';
      const res = await fetch(url);
      const data = await res.json();
      const rows = data.data || data.skills || [];
      const count = Number(data?.pagination?.total ?? data?.count ?? rows.length);
      const pages = Number(data?.pagination?.totalPages ?? Math.max(Math.ceil(count / pageSize), 1));
      setSkills(rows);
      setTotal(count);
      setTotalPages(pages);
    } catch (error) {
      console.error('获取 Skills 失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    setQuery(searchInput.trim());
  };

  const clearSearch = () => {
    setSearchInput('');
    setQuery('');
    setPage(1);
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
              {/* Hero Section */}
              <section className="hero">
                <div className="hero-copy">
                  <span className="hero-kicker">AGENT SKILL MARKETPLACE</span>
                  <h1 className="hero-title">
                    Discover Agent Skills<br />
                    <span style={{ fontSize: '0.6em', opacity: 0.8, color: '#10b981' }}>Secured. Verified. Ready.</span>
                  </h1>
                  <p className="hero-subtitle">
                    Find AI agent skills with built-in security scanning. Connect via MCP, scan before use, tip creators on Monad.
                  </p>
                  <div className="hero-actions">
                    <a href="#skills" className="primary-btn">
                      Browse Skills
                    </a>
                    <a href="/scan" className="ghost-btn">
                      Scan Repository
                    </a>
                  </div>
                  <div className="hero-meta">
                    <span>🛡️ Security Scanned</span>
                    <span>🤖 MCP Protocol</span>
                    <span>💰 98% to Creators</span>
                  </div>
                </div>
              </section>

              {/* Three Ways to Use - Combined with Value Props */}
              <section className="py-12 px-6">
                <div className="max-w-6xl mx-auto">
                  <div className="grid md:grid-cols-3 gap-6">
                    {/* MCP Server */}
                    <div className="bg-gradient-to-br from-purple-900/50 to-purple-950/30 border border-purple-500/30 rounded-xl p-6 hover:border-purple-400/50 transition-all">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-3xl">🤖</span>
                        <div>
                          <h3 className="text-lg font-bold text-white">For AI Agents</h3>
                          <span className="text-purple-400 text-xs">MCP Server</span>
                        </div>
                      </div>
                      <div className="bg-black/30 rounded-lg p-3 mb-4 font-mono">
                        <code className="text-purple-400 text-sm">npx @myskills/mcp-server</code>
                      </div>
                      <p className="text-gray-400 text-sm mb-3">
                        Connect Claude Desktop or any MCP-compatible AI agent to discover and use skills autonomously.
                      </p>
                      <a href="https://github.com/detongz/rebel-agent-skills/tree/main/packages/mcp-server" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 text-sm">
                        Setup Guide →
                      </a>
                    </div>

                    {/* Security Scanner */}
                    <div className="bg-gradient-to-br from-red-900/50 to-red-950/30 border border-red-500/30 rounded-xl p-6 hover:border-red-400/50 transition-all">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-3xl">🛡️</span>
                        <div>
                          <h3 className="text-lg font-bold text-white">Security Scanner</h3>
                          <span className="text-red-400 text-xs">Free API</span>
                        </div>
                      </div>
                      <div className="bg-black/30 rounded-lg p-3 mb-4 font-mono">
                        <code className="text-red-400 text-sm">POST /api/scan {"{ url }"}</code>
                      </div>
                      <p className="text-gray-400 text-sm mb-3">
                        Scan any skill repository for malicious code, secrets, and vulnerabilities before using it.
                      </p>
                      <a href="/scan" className="text-red-400 hover:text-red-300 text-sm">
                        Try Scanner →
                      </a>
                    </div>

                    {/* Web Interface */}
                    <div className="bg-gradient-to-br from-green-900/50 to-green-950/30 border border-green-500/30 rounded-xl p-6 hover:border-green-400/50 transition-all">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-3xl">🌐</span>
                        <div>
                          <h3 className="text-lg font-bold text-white">For Humans</h3>
                          <span className="text-green-400 text-xs">Web Interface</span>
                        </div>
                      </div>
                      <div className="bg-black/30 rounded-lg p-3 mb-4 font-mono">
                        <code className="text-green-400 text-sm">myskills.info</code>
                      </div>
                      <p className="text-gray-400 text-sm mb-3">
                        Browse skills, view security reports, read reviews, connect wallet, and support creators.
                      </p>
                      <a href="#skills" className="text-green-400 hover:text-green-300 text-sm">
                        Browse Skills →
                      </a>
                    </div>
                  </div>
                </div>
              </section>

              {/* Skills Directory */}
              <section id="skills" className="skills-section">
                <header className="skills-header">
                  <div>
                    <h2 className="skills-title">Skills Directory</h2>
                    <p className="skills-subtitle">
                      {skillsCountLabel}+ Agent Skills · Security Verified · MCP Ready
                    </p>
                  </div>
                  <div className="skills-filters">
                    <form className="skills-search" onSubmit={onSearch}>
                      <input
                        className="filter-input"
                        type="text"
                        placeholder="Search skills..."
                        value={searchInput}
                        onChange={(event) => setSearchInput(event.target.value)}
                        aria-label="Search skills"
                      />
                      <button className="filter-btn" type="submit">Search</button>
                      {query ? (
                        <button className="filter-btn ghost" type="button" onClick={clearSearch}>Clear</button>
                      ) : null}
                    </form>
                    <select
                      className="filter-select"
                      aria-label="Sort by"
                      value={sort}
                      onChange={(event) => {
                        setSort(event.target.value);
                        setPage(1);
                      }}
                    >
                      <option value="stars">🔥 [HOT_SKILLS]</option>
                      <option value="reviews">[MOST_REVIEWED]</option>
                      <option value="rating">[HIGHEST_RATED]</option>
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
                  <>
                    <div className="skills-grid">
                      {skills.map((skill) => (
                        <SkillCard key={skill.id} skill={skill} onTipped={fetchSkills} />
                      ))}
                    </div>
                    {totalPages > 1 && (
                      <div className="pagination-bar">
                        <button
                          className="filter-btn"
                          type="button"
                          disabled={page <= 1 || loading}
                          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                        >
                          Prev
                        </button>
                        <span className="pagination-text">
                          Page {page} / {totalPages}
                        </span>
                        <button
                          className="filter-btn"
                          type="button"
                          disabled={page >= totalPages || loading}
                          onClick={() => setPage((prev) => prev + 1)}
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </>
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
