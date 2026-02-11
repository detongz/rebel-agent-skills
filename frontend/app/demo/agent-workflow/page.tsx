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
  },
];

type Step = 'intro' | 'search' | 'result' | 'installing' | 'complete';

export default function OpenClawDemo() {
  const [currentStep, setCurrentStep] = useState<Step>('intro');
  const [selectedSkill, setSelectedSkill] = useState(DEMO_SKILLS[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [installProgress, setInstallProgress] = useState(0);

  const startDemo = () => setCurrentStep('search');
  const handleSearch = () => setCurrentStep('result');

  const handleScan = async () => {
    setIsScanning(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setScanResult({ status: 'safe', vulnerabilities: 0, warnings: 1, score: 95 });
    setIsScanning(false);
  };

  const handleInstall = async () => {
    setCurrentStep('installing');
    const interval = setInterval(() => {
      setInstallProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 5;
      });
    }, 100);
    setTimeout(() => {
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
            <span className="hero-kicker">OPENCLAW_INTEGRATION_v1.0</span>
            <h1 className="hero-title">
              <span>DISCOVER</span> <span>&</span> <span>INSTALL</span><br />
              <span>AGENT_SKILLS</span>
            </h1>
            <p className="hero-subtitle">
              Three ways to find and install agent skills
            </p>
          </div>
        </section>

        {/* Step 1: Entry Points */}
        {currentStep === 'intro' && (
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold font-['Orbitron'] mb-4 text-[var(--neon-green)]">
                // THREE_ENTRY_POINTS
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-16">
              {/* OpenClaw Plugin */}
              <div className="glass-card border border-[var(--neon-purple)]/30 hover:border-[var(--neon-purple)] transition-all group">
                <div className="text-center p-8">
                  <div className="text-6xl mb-6">🤖</div>
                  <div className="inline-block px-4 py-1 bg-[var(--neon-purple)]/20 border border-[var(--neon-purple)] rounded-full text-[var(--neon-purple)] text-xs font-mono mb-4">
                    RECOMMENDED
                  </div>
                  <h3 className="text-xl font-bold font-['Orbitron'] text-[var(--text-primary)] mb-3">
                    OpenClaw
                  </h3>
                  <p className="text-[var(--text-muted)] text-sm mb-6">
                    Install directly from OpenClaw CLI
                  </p>
                  <div className="bg-[var(--bg-void)] rounded-lg p-4 border border-white/5">
                    <code className="text-[var(--neon-purple)] font-mono text-sm block">
                      openclaw plugins install @myskills/openclaw
                    </code>
                  </div>
                </div>
              </div>

              {/* Web Index */}
              <div className="glass-card border border-[var(--neon-blue)]/30 hover:border-[var(--neon-blue)] transition-all group">
                <div className="text-center p-8">
                  <div className="text-6xl mb-6">🌐</div>
                  <h3 className="text-xl font-bold font-['Orbitron'] text-[var(--text-primary)] mb-3">
                    Web Index
                  </h3>
                  <p className="text-[var(--text-muted)] text-sm mb-6">
                    Browse and search 400+ skills
                  </p>
                  <div className="bg-[var(--bg-void)] rounded-lg p-4 border border-white/5">
                    <code className="text-[var(--neon-blue)] font-mono text-sm block">
                      myskills2026.ddttupupo.buzz
                    </code>
                  </div>
                  <a href="https://myskills2026.ddttupupo.buzz" target="_blank" className="inline-block mt-4 text-[var(--neon-blue)] text-sm hover:underline">
                    Visit →
                  </a>
                </div>
              </div>

              {/* npx Install */}
              <div className="glass-card border border-[var(--warning-orange)]/30 hover:border-[var(--warning-orange)] transition-all group">
                <div className="text-center p-8">
                  <div className="text-6xl mb-6">⚡</div>
                  <h3 className="text-xl font-bold font-['Orbitron'] text-[var(--text-primary)] mb-3">
                    Direct npx
                  </h3>
                  <p className="text-[var(--text-muted)] text-sm mb-6">
                    Install any skill via npm
                  </p>
                  <div className="bg-[var(--bg-void)] rounded-lg p-4 border border-white/5">
                    <code className="text-[var(--warning-orange)] font-mono text-sm block">
                      npx @myskills/skill-name
                    </code>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center">
              <button onClick={startDemo} className="primary-btn text-lg px-16 py-4">
                ▶ START_DEMO
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Search */}
        {currentStep === 'search' && (
          <div className="max-w-3xl mx-auto px-6">
            <div className="glass-card border border-[var(--neon-blue)]/30">
              <div className="text-center mb-8 p-8">
                <h2 className="text-3xl font-bold font-['Orbitron'] mb-2 text-[var(--neon-blue)]">
                  // SKILL_DISCOVERY
                </h2>
                <p className="text-[var(--text-muted)]">
                  Search our index of 400+ agent skills
                </p>
              </div>

              <div className="px-8 pb-8">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g., 'smart contract audit' or 'gas optimization'"
                  className="w-full bg-[var(--bg-void)] border border-[var(--neon-blue)] rounded-lg px-4 py-3 text-[var(--text-primary)] font-mono focus:outline-none focus:border-[var(--neon-green)] mb-4"
                />

                <div className="flex flex-wrap gap-2 mb-6">
                  {['Claude Code', 'Manus', 'Coze', 'MiniMax'].map((platform) => (
                    <button
                      key={platform}
                      className="px-4 py-2 bg-[var(--bg-surface)] border border-[var(--neon-green)]/30 rounded-full text-sm text-[var(--neon-green)] hover:bg-[var(--neon-green)] hover:text-[var(--bg-void)] transition-all"
                    >
                      {platform.toUpperCase()}
                    </button>
                  ))}
                </div>

                <div className="flex gap-4">
                  <button onClick={handleSearch} className="primary-btn flex-1">
                    🔍 SEARCH
                  </button>
                  <button onClick={() => setCurrentStep('intro')} className="ghost-btn">
                    ← BACK
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Result */}
        {currentStep === 'result' && (
          <div className="max-w-3xl mx-auto px-6">
            <div className="glass-card">
              <div className="p-8 pb-6 border-b border-white/10">
                <div className="flex items-start gap-6">
                  <div className="text-6xl">{selectedSkill.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-3 py-1 bg-[var(--neon-purple)]/20 rounded text-[var(--neon-purple)] text-xs font-mono">
                        {selectedSkill.platform.toUpperCase()}
                      </span>
                      <span className="text-[var(--text-muted)] font-mono text-xs">
                        {selectedSkill.installs.toLocaleString()} installs
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold font-['Orbitron'] text-[var(--text-primary)] mb-2">
                      {selectedSkill.name}
                    </h2>
                    <p className="text-[var(--text-secondary)] text-sm">
                      {selectedSkill.description}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-8">
                <h3 className="text-lg font-bold font-['Orbitron'] text-[var(--neon-green)] mb-4">
                  🛡️ SECURITY_SCORE: {selectedSkill.securityScore}/100
                </h3>

                {!scanResult ? (
                  <button
                    onClick={handleScan}
                    disabled={isScanning}
                    className="w-full py-3 mb-8 bg-[var(--neon-green)]/10 border border-[var(--neon-green)] rounded-lg text-[var(--neon-green)] font-mono hover:bg-[var(--neon-green)] hover:text-[var(--bg-void)] transition-all disabled:opacity-50"
                  >
                    {isScanning ? '⏳ SCANNING...' : '🔍 RUN_DEEP_SCAN'}
                  </button>
                ) : (
                  <div className="mb-8 p-4 bg-[var(--neon-green)]/10 border border-[var(--neon-green)] rounded-lg">
                    <div className="flex items-center gap-2 text-[var(--neon-green)] mb-2">
                      <span>✅</span>
                      <span className="font-mono text-sm">SCAN_COMPLETE: SAFE</span>
                    </div>
                  </div>
                )}

                <h3 className="text-lg font-bold font-['Orbitron'] text-[var(--neon-blue)] mb-4">
                  ⚡ INSTALL
                </h3>

                <div className="space-y-3 mb-8">
                  <div className="p-4 bg-[var(--bg-void)] rounded-lg border border-[var(--neon-purple)]/30">
                    <div className="text-xs text-[var(--neon-purple)] font-mono mb-2">OPENCLAW</div>
                    <code className="text-[var(--neon-green)] font-mono text-sm">
                      openclaw plugins install {selectedSkill.npmPackage}
                    </code>
                  </div>
                  <div className="p-4 bg-[var(--bg-void)] rounded-lg border border-[var(--warning-orange)]/30">
                    <div className="text-xs text-[var(--warning-orange)] font-mono mb-2">NPX</div>
                    <code className="text-[var(--warning-orange)] font-mono text-sm">
                      npx {selectedSkill.npmPackage}
                    </code>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button onClick={handleInstall} className="success-btn flex-1">
                    ⚡ INSTALL
                  </button>
                  <button onClick={() => setCurrentStep('search')} className="ghost-btn">
                    ← BACK
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Installing */}
        {currentStep === 'installing' && (
          <div className="max-w-2xl mx-auto px-6">
            <div className="glass-card text-center p-12">
              <div className="text-6xl mb-6">📦</div>
              <h2 className="text-2xl font-bold font-['Orbitron'] text-[var(--neon-blue)] mb-6">
                INSTALLING...
              </h2>

              <div className="h-3 bg-[var(--metal-dark)] rounded-full overflow-hidden mb-4">
                <div
                  className="h-full bg-gradient-to-r from-[var(--neon-blue)] to-[var(--neon-purple)] transition-all duration-300"
                  style={{ width: `${installProgress}%` }}
                />
              </div>

              <div className="bg-[var(--bg-void)] rounded-lg p-4 font-mono text-sm text-left">
                <div className="text-[var(--neon-green)]">$ npx {selectedSkill.npmPackage}</div>
                <div className="mt-2 space-y-1">
                  <div className={installProgress > 20 ? 'text-[var(--text-secondary)]' : 'text-[var(--text-muted)] opacity-50'}>
                    ✓ Downloading package...
                  </div>
                  <div className={installProgress > 40 ? 'text-[var(--text-secondary)]' : 'text-[var(--text-muted)] opacity-50'}>
                    ✓ Verifying checksum...
                  </div>
                  <div className={installProgress > 60 ? 'text-[var(--text-secondary)]' : 'text-[var(--text-muted)] opacity-50'}>
                    ✓ Installing dependencies...
                  </div>
                  <div className={installProgress > 80 ? 'text-[var(--text-secondary)]' : 'text-[var(--text-muted)] opacity-50'}>
                    ✓ Setting up...
                  </div>
                  <div className={installProgress >= 100 ? 'text-[var(--neon-green)]' : 'text-[var(--text-muted)] opacity-50'}>
                    ✓ Complete!
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Complete */}
        {currentStep === 'complete' && (
          <div className="max-w-2xl mx-auto px-6 text-center">
            <div className="glass-card border-2 border-[var(--neon-green)] p-12">
              <div className="text-7xl mb-6">🎉</div>
              <h2 className="text-3xl font-bold font-['Orbitron] mb-4 text-[var(--neon-green)]">
                SKILL_INSTALLED!
              </h2>
              <p className="text-[var(--text-muted)] mb-8">
                {selectedSkill.name} is ready to use
              </p>

              <div className="bg-[var(--bg-void)] rounded-lg p-6 mb-8 text-left">
                <h3 className="text-sm font-mono text-[var(--neon-blue)] mb-4">📚 QUICK_START</h3>
                <div className="space-y-2 font-mono text-sm">
                  <div className="text-[var(--neon-green)]">1. import Skill from '{selectedSkill.npmPackage}'</div>
                  <div className="text-[var(--neon-green)]">2. const skill = new Skill()</div>
                  <div className="text-[var(--neon-green)]">3. await skill.execute(input)</div>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <button onClick={resetDemo} className="ghost-btn">
                  ↻ TRY_AGAIN
                </button>
                <Link href="/" className="primary-btn">
                  HOME
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
