'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import styles from './scan.module.css';

type ScanApiResponse = {
  success?: boolean;
  data?: {
    scan_id?: string;
    scanId?: string;
    status?: string;
    report_url?: string;
  };
  message?: string;
  error?: string;
};

function detectInputType(input: string): 'github_url' | 'npm_command' | 'unknown' {
  const trimmed = input.trim().toLowerCase();
  if (
    trimmed.startsWith('https://github.com/') ||
    trimmed.startsWith('github.com/') ||
    trimmed.startsWith('git@github.com:') ||
    trimmed.startsWith('https://gitlab.com/') ||
    trimmed.startsWith('https://bitbucket.org/')
  ) {
    return 'github_url';
  }
  if (
    trimmed.startsWith('npx ') ||
    trimmed.startsWith('npm install ') ||
    trimmed.startsWith('npm i ') ||
    trimmed.startsWith('pnpm add ') ||
    trimmed.startsWith('yarn add ')
  ) {
    return 'npm_command';
  }
  return 'unknown';
}

function phaseText(elapsedMs: number): string {
  if (elapsedMs < 5000) return 'Connecting to scanner backend…';
  if (elapsedMs < 15000) return 'Fetching repository files…';
  return 'Analyzing files for security issues…';
}

export default function ScanEntryPage() {
  const [repoUrl, setRepoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    if (!loading) {
      setElapsedMs(0);
      return;
    }
    const start = Date.now();
    const timer = setInterval(() => {
      setElapsedMs(Date.now() - start);
    }, 1000);
    return () => clearInterval(timer);
  }, [loading]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const inputType = detectInputType(repoUrl);
      const payload = inputType === 'npm_command'
        ? { repo_url: repoUrl, scan_type: 'npm' }
        : { repo_url: repoUrl, scan_type: 'github' };

      const res = await fetch('/api/security-scan/external', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as ScanApiResponse;

      if (!res.ok || data.success === false) {
        setError(data.message || data.error || 'Scan failed');
        return;
      }

      const scanId = data?.data?.scan_id || data?.data?.scanId;
      const reportUrl = data?.data?.report_url || (scanId ? `https://skill-security-scan.vercel.app/scan/report/${scanId}` : '');
      if (!reportUrl) {
        setError('Scan created but missing report URL');
        return;
      }

      window.location.href = reportUrl;
    } catch {
      setError('Network error. Please retry.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-shell">
      <div className="app-backdrop" aria-hidden="true" />
      <Navbar />
      <main className="app-main">
        <section className={styles.page}>
          <div className={`glass-card ${styles.card}`}>
            <p className={styles.wrapperBadge}>MySkills Wrapper Mode</p>

            <div className={styles.tierGrid}>
              <div className={styles.tierCard}>
                <div className={styles.tierHead}>
                  <span className={styles.tierDot} />
                  <strong>Free Scan · Available Now</strong>
                </div>
                <p>GitHub + npm/npx input, report page, and poster sharing are fully available.</p>
              </div>
              <div className={`${styles.tierCard} ${styles.tierCardSoon}`}>
                <div className={styles.tierHead}>
                  <span className={styles.tierSoonPill}>COMING SOON</span>
                  <strong>Advanced Scan · 0.01 MON</strong>
                </div>
                <p>Paid depth mode: dependency recursion, dynamic testing, semantic judge.</p>
              </div>
            </div>

            <h1 className={styles.title}>Scan MySkill</h1>
            <p className={styles.subtitle}>
              Support MCP, OpenClaw plugin, and npx command workflows. For agents, prioritize these integrations before manual UI scan.
            </p>
            <p className={styles.subnote}>
              v0.2.3 core engine: prompt-injection risk scanning on top of v0.2.2 GitHub + npm analysis.
            </p>

            <div className={styles.agentHint}>
              <strong>Agent-First Integration</strong>
              <p>MCP Server · OpenClaw Plugin · npx commands are supported and recommended for agent automation.</p>
              <a href="https://myskills.info/docs" target="_blank" rel="noreferrer">Read docs: myskills.info/docs</a>
            </div>

            <form onSubmit={onSubmit} className={styles.form}>
              <input
                className={styles.input}
                placeholder="https://github.com/your-org/your-skill (Monad Hackathon 2026)"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                required
                disabled={loading}
              />
              <button className="primary-btn" disabled={loading}>
                {loading ? 'Scanning...' : 'Start Scan'}
              </button>
            </form>

            {loading ? (
              <>
                <p className={styles.loadingHint}>
                  {phaseText(elapsedMs)} This can take about 20-40 seconds for larger repositories.
                </p>
                <div className={styles.progressBarTrack}>
                  <div className={styles.progressBarFill} />
                </div>
              </>
            ) : null}

            {error ? <p className={styles.error}>{error}</p> : null}

          </div>

          <div className={`glass-card ${styles.freeSpecWrap}`}>
            <div className={styles.freeSpec}>
              <div className={styles.freeSpecHead}>
                <h2>Free Scan: What Runs Today</h2>
                <span>Production Ready</span>
              </div>
              <div className={styles.freeSpecGrid}>
                <article className={styles.freeSpecCard}>
                  <h3>External CLI Scanners</h3>
                  <p><code>semgrep --config auto --json</code></p>
                  <p><code>gitleaks detect --no-git --redact</code></p>
                  <small>If CLI is missing, scan continues with graceful degradation.</small>
                </article>
                <article className={styles.freeSpecCard}>
                  <h3>LLM Prompt Injection Detection</h3>
                  <p>Semantic prompt-injection detection with an LLM layer.</p>
                  <small>Falls back to local PI rules when the external model is unavailable.</small>
                </article>
                <article className={styles.freeSpecCard}>
                  <h3>Built-In Local Rules</h3>
                  <p>Command Execution · Download+Execute · Secret Detection · PI Fallback</p>
                  <small>Rules include instruction override and prompt secret exfil checks.</small>
                </article>
                <article className={styles.freeSpecCard}>
                  <h3>Execution Priority</h3>
                  <p>1) Semgrep+Gitleaks (parallel) → 2) LLM prompt injection detection → 3) Local rules fallback</p>
                  <small>Ensures stable output even when external tools are partially unavailable.</small>
                </article>
              </div>
            </div>
          </div>

          <div className={`glass-card ${styles.visionCard}`}>
            <p className={styles.visionTitle}>Advanced Scan (Coming Soon)</p>
            <p className={styles.visionSubtitle}>Optional paid layer. Free scan above is the default path.</p>
            <div className={styles.visionGrid}>
              <div className={styles.visionItem}>
                <div className={styles.visionIcon}>📦</div>
                <div>
                  <strong>Dependency Scan</strong>
                  <p>npm/pip vulnerabilities</p>
                </div>
              </div>
              <div className={styles.visionItem}>
                <div className={styles.visionIcon}>🧪</div>
                <div>
                  <strong>Dynamic Testing</strong>
                  <p>Sandbox execution</p>
                </div>
              </div>
              <div className={styles.visionItem}>
                <div className={styles.visionIcon}>🤖</div>
                <div>
                  <strong>LLM-as-Judge</strong>
                  <p>Semantic evaluation</p>
                </div>
              </div>
              <div className={styles.visionItem}>
                <div className={styles.visionIcon}>📈</div>
                <div>
                  <strong>Benchmark Score</strong>
                  <p>pass@k metrics</p>
                </div>
              </div>
            </div>
            <p className={styles.referenceText}>
              Reference:{' '}
              <a
                href="https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents"
                target="_blank"
                rel="noreferrer"
              >
                Demystifying Evals for AI Agents
              </a>
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
