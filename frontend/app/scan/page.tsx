'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import styles from './scan.module.css';

type ScanApiResponse = {
  success?: boolean;
  data?: {
    scan_id?: string;
    scanId?: string;
    status?: string;
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
  const router = useRouter();
  const [repoUrl, setRepoUrl] = useState('https://github.com/bowenliang123/md_exporter');
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
      if (!scanId) {
        setError('Scan created but missing scan ID');
        return;
      }

      router.push(`/scan/report/${scanId}`);
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
            <p className={styles.badge}>Security Scan v0.2.3</p>
            <h1 className={styles.title}>Scan Your Skill Repo</h1>
            <p className={styles.subtitle}>
              Paste a GitHub URL, or npm/npx command, to generate a shareable security report and poster.
            </p>
            <p className={styles.subnote}>
              v0.2.3: Adds prompt-injection risk scanning on top of the v0.2.2 GitHub + npm analysis.
            </p>

            <form onSubmit={onSubmit} className={styles.form}>
              <input
                className={styles.input}
                placeholder="https://github.com/org/repo or npx package-name"
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
        </section>
      </main>
    </div>
  );
}
