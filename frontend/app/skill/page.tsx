'use client';

import Navbar from '@/components/Navbar';

export default function SkillPage() {
  return (
    <div className="app-shell">
      <div className="app-backdrop" aria-hidden="true" />
      <Navbar />

      <main className="app-main">
        <section className="hero">
          <div className="hero-copy">
            <span className="hero-kicker">SECURITY_SCAN_v1.0</span>
            <h1 className="hero-title">
              <span>AGENT</span> <span>SKILL</span> <span>SCANNER</span>
            </h1>
            <p className="hero-subtitle">
              Security scanning and verification for Agent Skills
            </p>
          </div>
        </section>

        <section className="skills-section">
          <div className="glass-card text-center py-20">
            <p className="text-[var(--text-muted)] text-lg mb-4">
              SCAN_AGENT_SKILLS_FOR_SECURITY_VULNERABILITIES
            </p>
            <p className="text-[var(--text-secondary)] mb-8">
              Enter a skill ID or GitHub repository URL to scan
            </p>
            <div className="max-w-md mx-auto">
              <input
                type="text"
                placeholder="Enter skill ID or GitHub URL..."
                className="w-full px-4 py-3 bg-[var(--bg-deep)] border border-[var(--glass-border)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--neon-green)]"
              />
              <button className="primary-btn mt-4 w-full">
                🛡️ START SCAN
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
