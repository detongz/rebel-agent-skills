import Navbar from '@/components/Navbar';

export default function SkillPage() {
  return (
    <div className="app-shell">
      <div className="app-backdrop" aria-hidden="true" />
      <Navbar />

      <main className="app-main">
        <section className="hero">
          <div className="hero-copy">
            <span className="hero-kicker">SECURITY_SCAN_v2.0</span>
            <h1 className="hero-title">
              <span>AGENT</span> <span>SKILL</span> <span>SCANNER</span>
            </h1>
            <p className="hero-subtitle">
              Real security scan for GitHub/NPM skills.
            </p>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 mb-12">
          <iframe
            src="https://skill-security-scan.vercel.app/scan"
            title="Skill Security Scan"
            className="w-full h-[600px] rounded-lg border border-[var(--border-card)] bg-black"
            allow="clipboard-read; clipboard-write"
          />
        </section>
      </main>
    </div>
  );
}
