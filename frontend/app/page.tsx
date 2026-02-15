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

              {/* Product Entry Points */}
              <section className="px-6 py-12">
                <div className="mx-auto max-w-6xl">
                  <header className="mb-7">
                    <p className="text-xs uppercase tracking-[0.28em] text-cyan-300/80">Start Here</p>
                    <h2 className="mt-2 text-3xl font-semibold text-white md:text-4xl">Choose the Workflow That Fits You</h2>
                    <p className="mt-3 max-w-3xl text-sm text-slate-300 md:text-base">
                      Agent-first by default, human-friendly when needed. Discover real skills from GitHub, run a security check, then
                      decide with confidence.
                    </p>
                  </header>

                  <div className="grid gap-5 md:grid-cols-5">
                    <article className="relative overflow-hidden rounded-2xl border border-cyan-400/30 bg-gradient-to-br from-cyan-500/15 via-slate-900 to-slate-950 p-6 md:col-span-3">
                      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-cyan-400/20 blur-2xl" aria-hidden="true" />
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <span className="inline-flex rounded-full border border-cyan-300/35 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan-200">
                            Recommended
                          </span>
                          <h3 className="mt-3 text-2xl font-semibold text-white">For AI Agents</h3>
                          <p className="mt-2 text-sm text-slate-300">
                            Use MCP Server, OpenClaw plugin, or npx commands. Let agents discover, evaluate, and call skills directly.
                          </p>
                        </div>
                        <span className="text-3xl" aria-hidden="true">🤖</span>
                      </div>
                      <div className="mt-5 grid gap-3 sm:grid-cols-3">
                        <code className="rounded-lg border border-white/15 bg-black/35 px-3 py-2 text-xs text-cyan-200">npx @myskills/mcp-server</code>
                        <code className="rounded-lg border border-white/15 bg-black/35 px-3 py-2 text-xs text-cyan-200">openclaw myskills list</code>
                        <code className="rounded-lg border border-white/15 bg-black/35 px-3 py-2 text-xs text-cyan-200">npx myskills search</code>
                      </div>
                      <div className="mt-5 flex flex-wrap gap-4 text-sm">
                        <a
                          href="https://github.com/detongz/rebel-agent-skills/tree/main/packages/mcp-server"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-cyan-300 hover:text-cyan-200"
                        >
                          Setup Guide →
                        </a>
                        <a
                          href="/docs"
                          className="font-medium text-cyan-300/90 hover:text-cyan-200"
                        >
                          Docs →
                        </a>
                      </div>
                    </article>

                    <article className="rounded-2xl border border-red-400/30 bg-gradient-to-br from-red-500/15 to-slate-950 p-6 md:col-span-2">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <span className="inline-flex rounded-full border border-red-300/30 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-red-200">
                            Free Core Scan
                          </span>
                          <h3 className="mt-3 text-xl font-semibold text-white">Security Scanner</h3>
                        </div>
                        <span className="text-3xl" aria-hidden="true">🛡️</span>
                      </div>
                      <p className="mt-3 text-sm text-slate-300">
                        Submit a GitHub URL or npm/npx package to generate a report and shareable poster.
                      </p>
                      <code className="mt-4 block rounded-lg border border-white/15 bg-black/35 px-3 py-2 text-xs text-red-200">
                        POST /api/scan {"{ repoUrl | npm | npx }"}
                      </code>
                      <a href="/scan" className="mt-5 inline-block text-sm font-medium text-red-300 hover:text-red-200">
                        Open Scanner →
                      </a>
                    </article>

                    <article className="rounded-2xl border border-emerald-400/30 bg-gradient-to-br from-emerald-500/15 to-slate-950 p-6 md:col-span-5">
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="min-w-0">
                          <h3 className="text-xl font-semibold text-white">For Humans: Directory, Reviews, Leaderboard</h3>
                          <p className="mt-2 text-sm text-slate-300">
                            Search real GitHub-based skills, read community reviews, and compare momentum on the leaderboard.
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          <a href="#skills" className="rounded-lg border border-emerald-300/35 px-4 py-2 text-sm font-medium text-emerald-200 hover:bg-emerald-400/10">
                            Browse Skills
                          </a>
                          <a href="/leaderboard" className="rounded-lg border border-white/25 px-4 py-2 text-sm font-medium text-white hover:bg-white/10">
                            View Leaderboard
                          </a>
                        </div>
                      </div>
                    </article>
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
