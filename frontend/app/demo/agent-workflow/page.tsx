// app/demo/agent-workflow/page.tsx - MySkills CLI Demo
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

type Step = 'intro' | 'search' | 'scan' | 'result' | 'installing' | 'complete';

export default function MySkillsCLIDemo() {
  const [currentStep, setCurrentStep] = useState<Step>('intro');
  const [searchQuery, setSearchQuery] = useState('');
  const [scanUrl, setScanUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);

  const startDemo = () => setCurrentStep('search');
  const handleSearch = () => setCurrentStep('scan');

  const handleScan = async () => {
    setIsScanning(true);
    // Simulate scanning - in production this would call the real API
    await new Promise(resolve => setTimeout(resolve, 2500));
    setScanResult({
      score: 87,
      status: 'warning',
      vulnerabilities: 2,
      warnings: ['Tool "networkRequest" may be dangerous', 'lodash@4.17.21: moderate vulnerabilities']
    });
    setIsScanning(false);
    setCurrentStep('result');
  };

  const resetDemo = () => {
    setCurrentStep('intro');
    setSearchQuery('');
    setScanUrl('');
    setScanResult(null);
  };

  return (
    <div className="app-shell">
      <div className="app-backdrop" aria-hidden="true" />

      <Navbar />

      <main className="app-main">
        {/* Hero */}
        <section className="hero">
          <div className="hero-copy">
            <span className="hero-kicker">MCP_SERVER_v2.0</span>
            <h1 className="hero-title">
              <span>AGENT</span> <span>SKILL</span> <span>PROTOCOL</span><br />
              <span>ON MONAD</span>
            </h1>
            <p className="hero-subtitle">
              Where AI Agents Discover and Pay for Skills Automatically.
              Smart Matching Engine · Instant Settlement · 98% to Creators
            </p>
          </div>
        </section>

        {/* Step 1: Intro */}
        {currentStep === 'intro' && (
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold font-['Orbitron'] mb-4 text-[var(--neon-green)]">
                // MCP_SERVER
              </h2>
              <p className="text-[var(--text-muted)] mb-8">
                One MCP Server to connect AI agents with skill payments
              </p>
            </div>

            <div className="glass-card border border-[var(--neon-purple)]/30 mb-8">
              <div className="p-8">
                <h3 className="text-xl font-bold font-['Orbitron'] text-[var(--text-primary)] mb-4">
                  🤖 MCP Server
                </h3>
                <div className="bg-[var(--bg-void)] rounded-lg p-4 border border-white/5 mb-6">
                  <code className="text-[var(--neon-green)] font-mono text-sm block">
                    npx @myskills/mcp-server
                  </code>
                </div>
                <p className="text-[var(--text-muted)] text-sm">
                  Install MCP Server to let AI agents discover and pay for skills automatically.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-16">
              {/* Security First */}
              <div className="glass-card border border-[var(--neon-green)]/30">
                <div className="p-8">
                  <div className="text-4xl mb-4">🛡️</div>
                  <h3 className="text-lg font-bold font-['Orbitron'] text-[var(--text-primary)] mb-3">
                    Security Scanning
                  </h3>
                  <p className="text-[var(--text-muted)] text-sm mb-4">
                    Every skill is scanned for security before you install
                  </p>
                  <div className="bg-[var(--bg-void)] rounded-lg p-3 border border-white/5">
                    <code className="text-[var(--neon-green)] font-mono text-xs block">
                      npx myskills scan &lt;url&gt;
                    </code>
                  </div>
                </div>
              </div>

              {/* Monad Payments */}
              <div className="glass-card border border-[var(--neon-purple)]/30">
                <div className="p-8">
                  <div className="text-4xl mb-4">💰</div>
                  <h3 className="text-lg font-bold font-['Orbitron'] text-[var(--text-primary)] mb-3">
                    Tip Creators
                  </h3>
                  <p className="text-[var(--text-muted)] text-sm mb-4">
                    Support skill creators with Monad blockchain payments
                  </p>
                  <div className="bg-[var(--bg-void)] rounded-lg p-3 border border-white/5">
                    <code className="text-[var(--neon-purple)] font-mono text-xs block">
                      npx myskills tip &lt;skill&gt; 10
                    </code>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center">
              <button onClick={startDemo} className="primary-btn text-lg px-16 py-4">
                ▶ TRY_IT_OUT
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
                  // LIST_SKILLS
                </h2>
                <p className="text-[var(--text-muted)]">
                  MCP Server discovers and lists available agent skills
                </p>
              </div>

              <div className="px-8 pb-8">
                <div className="bg-[var(--bg-void)] rounded-lg p-4 border border-white/5 mb-6">
                  <code className="text-[var(--neon-blue)] font-mono text-sm block">
                    $ list_skills --query "{searchQuery || 'security audit'}"
                  </code>
                </div>

                <div className="text-[var(--text-muted)] text-sm mb-4">
                  MCP Server discovers skills across all platforms automatically
                </div>

                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g., 'smart contract audit' or 'gas optimization'"
                  className="w-full bg-[var(--bg-void)] border border-[var(--neon-blue)] rounded-lg px-4 py-3 text-[var(--text-primary)] font-mono focus:outline-none focus:border-[var(--neon-green)] mb-4"
                />

                <div className="flex gap-4">
                  <button onClick={handleSearch} className="primary-btn flex-1">
                    🔍 FIND SKILLS
                  </button>
                  <button onClick={() => setCurrentStep('intro')} className="ghost-btn">
                    ← BACK
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Scan */}
        {currentStep === 'scan' && (
          <div className="max-w-3xl mx-auto px-6">
            <div className="glass-card border border-[var(--neon-green)]/30">
              <div className="text-center mb-8 p-8">
                <h2 className="text-3xl font-bold font-['Orbitron'] mb-2 text-[var(--neon-green)]">
                  // SMART_MATCHING
                </h2>
                <p className="text-[var(--text-muted)]">
                  Find skills within your budget automatically
                </p>
              </div>

              <div className="px-8 pb-8">
                <div className="bg-[var(--bg-void)] rounded-lg p-4 border border-white/5 mb-6">
                  <code className="text-[var(--neon-green)] font-mono text-sm block">
                    $ find_skills_for_budget --max-price 0.01
                  </code>
                </div>

                <div className="text-[var(--text-muted)] text-sm mb-4">
                  Smart Matching Engine finds skills within your budget automatically
                </div>

                <input
                  type="text"
                  value={scanUrl}
                  onChange={(e) => setScanUrl(e.target.value)}
                  placeholder="Enter budget in MON (e.g., 0.01)"
                  className="w-full bg-[var(--bg-void)] border border-[var(--neon-green)] rounded-lg px-4 py-3 text-[var(--text-primary)] font-mono focus:outline-none focus:border-[var(--neon-green)] mb-4"
                />

                <div className="flex gap-4">
                  <button onClick={handleScan} disabled={isScanning || !scanUrl} className="success-btn flex-1 disabled:opacity-50">
                    {isScanning ? '⏳ FINDING...' : '🎯 FIND MATCHES'}
                  </button>
                  <button onClick={() => setCurrentStep('search')} className="ghost-btn">
                    ← BACK
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Result */}
        {currentStep === 'result' && scanResult && (
          <div className="max-w-3xl mx-auto px-6">
            <div className="glass-card">
              <div className="p-8">
                <h2 className="text-2xl font-bold font-['Orbitron'] mb-6 text-[var(--text-primary)]">
                  Scan Results
                </h2>

                <div className={`p-6 rounded-lg mb-6 border-2 ${
                  scanResult.status === 'safe'
                    ? 'bg-[var(--neon-green)]/10 border-[var(--neon-green)]'
                    : scanResult.status === 'warning'
                      ? 'bg-yellow-500/10 border-yellow-500'
                      : 'bg-red-500/10 border-red-500'
                }`}>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-5xl">
                      {scanResult.status === 'safe' ? '✅' : scanResult.status === 'warning' ? '⚠️' : '🚨'}
                    </div>
                    <div>
                      <div className="text-3xl font-bold font-['Orbitron']">
                        Security Score: {scanResult.score}/100
                      </div>
                      <div className="text-sm text-[var(--text-muted)]">
                        Status: {scanResult.status.toUpperCase()}
                      </div>
                    </div>
                  </div>

                  {scanResult.vulnerabilities > 0 && (
                    <div className="text-sm">
                      <span className="text-[var(--text-muted)]">Vulnerabilities found: </span>
                      <span className="text-yellow-500 font-bold">{scanResult.vulnerabilities}</span>
                    </div>
                  )}
                </div>

                {scanResult.warnings.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-bold font-['Orbitron'] text-[var(--neon-blue)] mb-3">
                      Warnings
                    </h3>
                    <ul className="space-y-2">
                      {scanResult.warnings.map((warning: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="text-yellow-500">⚠️</span>
                          <span className="text-[var(--text-secondary)]">{warning}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="bg-[var(--bg-void)] rounded-lg p-4 border border-white/5 mb-6">
                  <h3 className="text-sm font-mono text-[var(--neon-blue)] mb-3">💰 TIP CREATOR</h3>
                  <code className="text-[var(--neon-purple)] font-mono text-sm block">
                    tip_creator --skill-id &lt;id&gt; --amount 10
                  </code>
                </div>

                <div className="text-[var(--text-muted)] text-sm mb-4 text-center">
                  98% of tips go directly to creators • 2% to treasury
                </div>

                <div className="flex gap-4">
                  <button onClick={resetDemo} className="ghost-btn flex-1">
                    ↻ TRY_ANOTHER
                  </button>
                  <Link href="/" className="primary-btn flex-1 text-center">
                    HOME
                  </Link>
                </div>
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
          <span className="footer-pill">MCP_READY</span>
          <span className="footer-pill">SMART_MATCHING</span>
          <span className="footer-pill">98%_TO_CREATORS</span>
        </div>
      </footer>
    </div>
  );
}
