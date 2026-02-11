// app/demo/agent-workflow/page.tsx - OpenClaw 技能发现演示
'use client';

import { useState } from 'react';
import Link from 'next/link';

// 模拟技能数据
const DEMO_SKILLS = [
  {
    id: 'solidity-auditor',
    name: 'Solidity Auditor',
    icon: '🛡️',
    platform: 'claude-code',
    description: 'AI-powered smart contract security audit with vulnerability detection',
    creator: '0xABC...123',
    npmPackage: '@myskills/solidity-auditor',
    installs: 2847,
    securityScore: 95,
    pricing: 'free',
  },
  {
    id: 'fuzzer-tool',
    name: 'Fuzzer Pro',
    icon: '🔬',
    platform: 'manus',
    description: 'Automated fuzzing tool for edge case discovery in smart contracts',
    creator: '0xDEF...456',
    npmPackage: '@myskills/fuzzer-pro',
    installs: 1523,
    securityScore: 88,
    pricing: 'free',
  },
  {
    id: 'gas-optimizer',
    name: 'Gas Optimizer',
    icon: '⚡',
    platform: 'coze',
    description: 'Optimizes gas usage and identifies efficiency improvements',
    creator: '0x789...XYZ',
    npmPackage: '@myskills/gas-optimizer',
    installs: 3421,
    securityScore: 92,
    pricing: 'free',
  },
];

type Step = 'intro' | 'search' | 'result' | 'install' | 'complete';

export default function OpenClawDemo() {
  const [currentStep, setCurrentStep] = useState<Step>('intro');
  const [selectedSkill, setSelectedSkill] = useState(DEMO_SKILLS[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [isInstalling, setIsInstalling] = useState(false);
  const [installProgress, setInstallProgress] = useState(0);

  const startDemo = () => {
    setCurrentStep('search');
  };

  const handleSearch = () => {
    setCurrentStep('result');
  };

  const handleScan = async () => {
    setIsScanning(true);
    // 模拟扫描延迟
    await new Promise(resolve => setTimeout(resolve, 2000));
    setScanResult({
      status: 'safe',
      vulnerabilities: 0,
      warnings: 1,
      score: 95,
    });
    setIsScanning(false);
  };

  const handleInstall = async () => {
    setIsInstalling(true);
    const interval = setInterval(() => {
      setInstallProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    setTimeout(() => {
      setIsInstalling(false);
      setCurrentStep('complete');
    }, 2500);
  };

  const resetDemo = () => {
    setCurrentStep('intro');
    setSelectedSkill(DEMO_SKILLS[0]);
    setSearchQuery('');
    setScanResult(null);
    setInstallProgress(0);
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
            <Link href="/bounties" className="nav-link">BOUNTIES</Link>
            <Link href="/demo/agent-workflow" className="nav-link text-[var(--neon-green)]">DEMO</Link>
          </div>
        </div>
      </nav>

      <main className="app-main">
        {/* Hero */}
        <section className="hero">
          <div className="hero-copy">
            <span className="hero-kicker">OPINCLAW_INTEGRATION_v1.0</span>
            <h1 className="hero-title">
              <span>DISCOVER</span> <span>&</span> <span>INSTALL</span><br />
              <span>AGENT_SKILLS</span>
            </h1>
            <p className="hero-subtitle">
              Three ways to find and install agent skills: OpenClaw Plugin · Web Search · npx
            </p>
          </div>
        </section>

        {/* Step 1: Intro - Entry Points */}
        {currentStep === 'intro' && (
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold font-['Orbitron'] mb-4 text-[var(--neon-green)]">
                // THREE_ENTRY_POINTS
              </h2>
              <p className="text-[var(--text-muted)] text-lg">
                Choose your preferred way to discover and install agent skills
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {/* OpenClaw Plugin */}
              <div className="glass-card border-2 border-[var(--neon-purple)] hover:border-[var(--neon-purple)] transition-all">
                <div className="text-center">
                  <div className="text-6xl mb-4">🤖</div>
                  <div className="inline-block px-4 py-1 bg-[var(--neon-purple)]/20 rounded-full text-[var(--neon-purple)] text-sm font-mono mb-4">
                    RECOMMENDED
                  </div>
                  <h3 className="text-2xl font-bold font-['Orbitron'] text-[var(--neon-purple)] mb-3">
                    OpenClaw Plugin
                  </h3>
                  <p className="text-[var(--text-muted)] mb-6">
                    Install directly from OpenClaw CLI. Search, discover, and install skills without leaving your terminal.
                  </p>
                  <div className="bg-[var(--bg-void)] rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-[var(--text-muted)] font-mono">TERMINAL</span>
                      <span className="text-xs text-[var(--neon-purple)]">COPY</span>
                    </div>
                    <code className="text-[var(--neon-green)] font-mono text-sm">
                      openclaw plugins install @myskills/openclaw
                    </code>
                  </div>
                  <div className="text-left space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-[var(--neon-green)]">
                      <span>✓</span>
                      <span>In-app skill discovery</span>
                    </div>
                    <div className="flex items-center gap-2 text-[var(--neon-green)]">
                      <span>✓</span>
                      <span>One-command install</span>
                    </div>
                    <div className="flex items-center gap-2 text-[var(--neon-green)]">
                      <span>✓</span>
                      <span>Auto dependency resolve</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Web Search */}
              <div className="glass-card border-2 border-[var(--neon-blue)] hover:border-[var(--neon-blue)] transition-all">
                <div className="text-center">
                  <div className="text-6xl mb-4">🌐</div>
                  <h3 className="text-2xl font-bold font-['Orbitron'] text-[var(--neon-blue)] mb-3">
                    Web Index
                  </h3>
                  <p className="text-[var(--text-muted)] mb-6">
                    Browse 400+ skills on our website. Filter by platform, category, and security rating.
                  </p>
                  <div className="bg-[var(--bg-void)] rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-[var(--text-muted)] font-mono">URL</span>
                      <a href="https://myskills2026.ddttupupo.buzz" target="_blank" className="text-xs text-[var(--neon-blue)]">VISIT →</a>
                    </div>
                    <code className="text-[var(--neon-blue)] font-mono text-sm">
                      myskills2026.ddttupupo.buzz
                    </code>
                  </div>
                  <div className="text-left space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-[var(--neon-green)]">
                      <span>✓</span>
                      <span>Visual skill browser</span>
                    </div>
                    <div className="flex items-center gap-2 text-[var(--neon-green)]">
                      <span>✓</span>
                      <span>Advanced filtering</span>
                    </div>
                    <div className="flex items-center gap-2 text-[var(--neon-green)]">
                      <span>✓</span>
                      <span>Security ratings</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* npx Install */}
              <div className="glass-card border-2 border-[var(--warning-orange)] hover:border-[var(--warning-orange)] transition-all">
                <div className="text-center">
                  <div className="text-6xl mb-4">⚡</div>
                  <h3 className="text-2xl font-bold font-['Orbitron'] text-[var(--warning-orange)] mb-3">
                    Direct npx
                  </h3>
                  <p className="text-[var(--text-muted)] mb-6">
                    Install any skill directly via npm. Works with any Node.js project, no configuration needed.
                  </p>
                  <div className="bg-[var(--bg-void)] rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-[var(--text-muted)] font-mono">TERMINAL</span>
                      <span className="text-xs text-[var(--warning-orange)]">COPY</span>
                    </div>
                    <code className="text-[var(--warning-orange)] font-mono text-sm">
                      npx @myskills/skill-name
                    </code>
                  </div>
                  <div className="text-left space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-[var(--neon-green)]">
                      <span>✓</span>
                      <span>No registration needed</span>
                    </div>
                    <div className="flex items-center gap-2 text-[var(--neon-green)]">
                      <span>✓</span>
                      <span>Instant installation</span>
                    </div>
                    <div className="flex items-center gap-2 text-[var(--neon-green)]">
                      <span>✓</span>
                      <span>Global availability</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center">
              <button onClick={startDemo} className="primary-btn text-lg px-12 py-4">
                ▶ START_DEMO
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Search */}
        {currentStep === 'search' && (
          <div className="max-w-4xl mx-auto px-6">
            <div className="glass-card border-2 border-[var(--neon-blue)]">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold font-['Orbitron'] mb-2 text-[var(--neon-blue)]">
                  // SKILL_DISCOVERY
                </h2>
                <p className="text-[var(--text-muted)]">
                  Search our index of 400+ agent skills across all platforms
                </p>
              </div>

              {/* Search Input */}
              <div className="bg-[var(--bg-void)] rounded-lg p-6 mb-8">
                <label className="block text-sm text-[var(--text-muted)] mb-3 font-mono">
                  ENTER_REQUIREMENT
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g., 'smart contract audit' or 'gas optimization'"
                  className="w-full bg-[var(--bg-deep)] border border-[var(--neon-blue)] rounded-lg px-4 py-3 text-[var(--text-primary)] font-mono focus:outline-none focus:border-[var(--neon-green)]"
                />
                <div className="mt-4 flex gap-3">
                  <button onClick={handleSearch} className="primary-btn flex-1">
                    🔍 SEARCH_SKILLS
                  </button>
                  <button onClick={() => setCurrentStep('intro')} className="ghost-btn">
                    ← BACK
                  </button>
                </div>
              </div>

              {/* Search Filters */}
              <div className="grid md:grid-cols-4 gap-4 mb-8">
                <div className="bg-[var(--bg-surface)] rounded-lg p-4 border border-[var(--neon-green)]">
                  <div className="text-2xl mb-2">🛡️</div>
                  <div className="text-sm font-bold text-[var(--neon-green)]">SECURITY_SCAN</div>
                  <div className="text-xs text-[var(--text-muted)]">Verified skills</div>
                </div>
                <div className="bg-[var(--bg-surface)] rounded-lg p-4 border border-[var(--neon-blue)]">
                  <div className="text-2xl mb-2">⭐</div>
                  <div className="text-sm font-bold text-[var(--neon-blue)]">TOP_RATED</div>
                  <div className="text-xs text-[var(--text-muted)]">4+ stars only</div>
                </div>
                <div className="bg-[var(--bg-surface)] rounded-lg p-4 border border-[var(--neon-purple)]">
                  <div className="text-2xl mb-2">🔥</div>
                  <div className="text-sm font-bold text-[var(--neon-purple)]">TRENDING</div>
                  <div className="text-xs text-[var(--text-muted)]">Most installed</div>
                </div>
                <div className="bg-[var(--bg-surface)] rounded-lg p-4 border border-[var(--warning-orange)]">
                  <div className="text-2xl mb-2">💰</div>
                  <div className="text-sm font-bold text-[var(--warning-orange)]">FREE_ONLY</div>
                  <div className="text-xs text-[var(--text-muted)]">No payment needed</div>
                </div>
              </div>

              {/* Platform Pills */}
              <div className="flex flex-wrap gap-2 justify-center">
                {['Claude Code', 'Manus', 'Coze', 'MiniMax'].map((platform) => (
                  <button
                    key={platform}
                    className="px-4 py-2 bg-[var(--bg-surface)] border border-[var(--neon-green)] rounded-full text-sm text-[var(--neon-green)] hover:bg-[var(--neon-green)] hover:text-[var(--bg-void)] transition-all"
                  >
                    {platform.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Result + Install */}
        {currentStep === 'result' && (
          <div className="max-w-4xl mx-auto px-6">
            <div className="glass-card">
              {/* Skill Detail */}
              <div className="flex items-start gap-6 mb-8 pb-8 border-b border-white/10">
                <div className="text-7xl">{selectedSkill.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-3 py-1 bg-[var(--neon-purple)]/20 rounded-full text-[var(--neon-purple)] text-sm font-mono">
                      {selectedSkill.platform.toUpperCase()}
                    </span>
                    <span className="text-[var(--text-muted)] font-mono text-sm">
                      {selectedSkill.installs.toLocaleString()} installs
                    </span>
                  </div>
                  <h2 className="text-3xl font-bold font-['Orbitron'] text-[var(--text-primary)] mb-2">
                    {selectedSkill.name}
                  </h2>
                  <p className="text-[var(--text-secondary)] mb-4">
                    {selectedSkill.description}
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-[var(--text-muted)]">Creator:</span>
                    <span className="font-mono text-[var(--neon-purple)]">{selectedSkill.creator}</span>
                  </div>
                </div>
              </div>

              {/* Security Score */}
              <div className="bg-[var(--bg-void)] rounded-lg p-6 mb-8">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold font-['Orbitron'] text-[var(--neon-green)] mb-1">
                      🛡️ SECURITY_SCORE
                    </h3>
                    <p className="text-sm text-[var(--text-muted)]">
                      Community-vetted · Code reviewed · No known vulnerabilities
                    </p>
                  </div>
                  <div className="text-4xl font-bold font-['Orbitron'] text-[var(--neon-green)]">
                    {selectedSkill.securityScore}/100
                  </div>
                </div>

                {!scanResult ? (
                  <button
                    onClick={handleScan}
                    disabled={isScanning}
                    className="w-full py-3 bg-[var(--neon-green)]/10 border border-[var(--neon-green)] rounded-lg text-[var(--neon-green)] font-mono hover:bg-[var(--neon-green)] hover:text-[var(--bg-void)] transition-all disabled:opacity-50"
                  >
                    {isScanning ? '⏳ SCANNING...' : '🔍 RUN_DEEP_SCAN (Optional)'}
                  </button>
                ) : (
                  <div className="p-4 bg-[var(--neon-green)]/10 border border-[var(--neon-green)] rounded-lg">
                    <div className="flex items-center gap-3 text-[var(--neon-green)] mb-3">
                      <span className="text-2xl">✅</span>
                      <span className="font-bold font-['Orbitron']">SCAN_COMPLETE</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-[var(--text-muted)]">Status:</span>
                        <span className="ml-2 text-[var(--neon-green)]">SAFE</span>
                      </div>
                      <div>
                        <span className="text-[var(--text-muted)]">Vulnerabilities:</span>
                        <span className="ml-2 text-[var(--neon-green)]">0</span>
                      </div>
                      <div>
                        <span className="text-[var(--text-muted)]">Warnings:</span>
                        <span className="ml-2 text-[var(--warning-orange)]">{scanResult.warnings}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Install Commands */}
              <div className="bg-[var(--bg-void)] rounded-lg p-6">
                <h3 className="text-xl font-bold font-['Orbitron'] text-[var(--neon-blue)] mb-4">
                  ⚡ INSTALL_OPTIONS
                </h3>

                <div className="space-y-4">
                  {/* OpenClaw Install */}
                  <div className="p-4 bg-[var(--bg-deep)] rounded-lg border border-[var(--neon-purple)]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-[var(--neon-purple)] font-mono">OPENCLAW</span>
                      <span className="text-xs text-[var(--text-muted)]">RECOMMENDED</span>
                    </div>
                    <code className="text-[var(--neon-green)] font-mono text-sm">
                      openclaw plugins install {selectedSkill.npmPackage}
                    </code>
                  </div>

                  {/* npx Install */}
                  <div className="p-4 bg-[var(--bg-deep)] rounded-lg border border-[var(--warning-orange)]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-[var(--warning-orange)] font-mono">NPX_DIRECT</span>
                      <span className="text-xs text-[var(--text-muted)]">NO_SETUP</span>
                    </div>
                    <code className="text-[var(--warning-orange)] font-mono text-sm">
                      npx {selectedSkill.npmPackage}
                    </code>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mt-8">
                <button onClick={handleInstall} disabled={isInstalling} className="success-btn flex-1">
                  {isInstalling ? '⏳ INSTALLING...' : `⚡ INSTALL_${selectedSkill.name.toUpperCase().replace(' ', '_')}`}
                </button>
                <button onClick={() => setCurrentStep('search')} className="ghost-btn">
                  ← BACK
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Installing */}
        {isInstalling && (
          <div className="max-w-2xl mx-auto px-6">
            <div className="glass-card text-center">
              <div className="text-6xl mb-6 animate-bounce">📦</div>
              <h2 className="text-2xl font-bold font-['Orbitron'] text-[var(--neon-blue)] mb-4">
                INSTALLING_SKILL
              </h2>

              <div className="mb-6">
                <div className="h-3 bg-[var(--metal-dark)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[var(--neon-blue)] to-[var(--neon-purple)] transition-all duration-300"
                    style={{ width: `${installProgress}%` }}
                  />
                </div>
                <div className="mt-2 text-[var(--neon-blue)] font-mono text-sm">
                  {installProgress}%
                </div>
              </div>

              <div className="text-left bg-[var(--bg-void)] rounded-lg p-4 font-mono text-sm text-[var(--text-muted)]">
                <div className="text-[var(--neon-green)]">$ npx {selectedSkill.npmPackage}</div>
                <div className="mt-2">ℹ Fetching package metadata...</div>
                <div className={installProgress > 20 ? 'text-[var(--text-secondary)]' : 'opacity-50'}>
                  ✓ Downloading {selectedSkill.npmPackage}@latest...
                </div>
                <div className={installProgress > 40 ? 'text-[var(--text-secondary)]' : 'opacity-50'}>
                  ✓ Verifying checksum...
                </div>
                <div className={installProgress > 60 ? 'text-[var(--text-secondary)]' : 'opacity-50'}>
                  ✓ Extracting files...
                </div>
                <div className={installProgress > 80 ? 'text-[var(--text-secondary)]' : 'opacity-50'}>
                  ✓ Installing dependencies...
                </div>
                <div className={installProgress >= 100 ? 'text-[var(--neon-green)]' : 'opacity-50'}>
                  ✓ Skill ready to use!
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Complete */}
        {currentStep === 'complete' && (
          <div className="max-w-3xl mx-auto px-6 text-center">
            <div className="glass-card border-2 border-[var(--neon-green)]">
              <div className="text-8xl mb-6">🎉</div>
              <h2 className="text-4xl font-bold font-['Orbitron'] mb-4 bg-gradient-to-r from-[var(--neon-green)] to-[var(--neon-blue)] bg-clip-text text-transparent">
                SKILL_INSTALLED!
              </h2>
              <p className="text-[var(--text-muted)] text-lg mb-8">
                {selectedSkill.name} is now ready to use in your agent workflow
              </p>

              <div className="bg-[var(--bg-void)] rounded-lg p-6 mb-8 text-left">
                <h3 className="text-lg font-bold font-['Orbitron'] text-[var(--neon-blue)] mb-4">
                  📚 QUICK_START
                </h3>
                <div className="space-y-3 font-mono text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-[var(--neon-green)]">1.</span>
                    <code className="text-[var(--text-secondary)]">import {selectedSkill.npmPackage.split('/')[1]}</code>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[var(--neon-green)]">2.</span>
                    <code className="text-[var(--text-secondary)]">const skill = new Skill()</code>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[var(--neon-green)]">3.</span>
                    <code className="text-[var(--text-secondary)]">await skill.execute(input)</code>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4 mb-8">
                <div className="p-4 bg-[var(--bg-surface)] rounded-lg">
                  <div className="text-2xl mb-2">📖</div>
                  <div className="font-bold text-[var(--neon-blue)]">Docs</div>
                  <div className="text-xs text-[var(--text-muted)]">Full API reference</div>
                </div>
                <div className="p-4 bg-[var(--bg-surface)] rounded-lg">
                  <div className="text-2xl mb-2">💬</div>
                  <div className="font-bold text-[var(--neon-purple)]">Community</div>
                  <div className="text-xs text-[var(--text-muted)]">Get help fast</div>
                </div>
                <div className="p-4 bg-[var(--bg-surface)] rounded-lg">
                  <div className="text-2xl mb-2">🐛</div>
                  <div className="font-bold text-[var(--warning-orange)]">Report</div>
                  <div className="text-xs text-[var(--text-muted)]">Found a bug?</div>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <button onClick={resetDemo} className="ghost-btn">
                  ↻ TRY_ANOTHER
                </button>
                <Link href="/" className="primary-btn">
                  ← BACK_HOME
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <div className="footer-left">
          <span>MY-SKILLS-PROTOCOL // MOLTIVERSE_SUBMISSION_2026</span>
        </div>
        <div className="footer-right">
          <span className="footer-pill">OPENCLAW_ENABLED</span>
          <span className="footer-pill">NPX_READY</span>
        </div>
      </footer>
    </div>
  );
}
