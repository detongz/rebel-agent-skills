'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import Navbar from '@/components/Navbar';
import ConnectButton from '@/components/ConnectButton';
import styles from './skill.module.css';

const SCAN_URL = 'https://skill-security-scan.vercel.app/scan';
const ADVANCED_SCAN_PRICE = '0.01';

// 检测是否是有效的 Git 链接
function isValidGitUrl(input: string): boolean {
  const trimmed = input.trim().toLowerCase();
  return (
    trimmed.startsWith('https://github.com/') ||
    trimmed.startsWith('github.com/') ||
    trimmed.startsWith('git@github.com:') ||
    trimmed.startsWith('https://gitlab.com/') ||
    trimmed.startsWith('https://bitbucket.org/')
  );
}

export default function SkillPage() {
  const { address, isConnected } = useAccount();

  const [repoUrl, setRepoUrl] = useState('');
  const [status, setStatus] = useState<'idle' | 'redirecting' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  // 自动跳转到扫描页面
  const redirectToScanner = (url: string) => {
    const encodedUrl = encodeURIComponent(url);
    window.location.href = `${SCAN_URL}?repo=${encodedUrl}`;
  };

  const handleFreeScan = async () => {
    setError(null);

    if (!isValidGitUrl(repoUrl)) {
      setError('Please enter a valid GitHub/GitLab/Bitbucket URL');
      return;
    }

    setStatus('redirecting');
    try {
      setTimeout(() => redirectToScanner(repoUrl), 400);
    } catch (err: any) {
      console.error('Redirect failed:', err);
      setStatus('error');
      setError(err?.message || 'Failed to redirect. Please try again.');
    }
  };

  return (
    <div className="app-shell">
      <div className="app-backdrop" aria-hidden="true" />
      <Navbar />

      <main className="app-main">
        {/* Hero Section */}
        <section className="hero">
          <div className="hero-copy">
            <span className="hero-kicker">SECURITY_SCAN_v2.0</span>
            <h1 className="hero-title">
              <span>AGENT</span> <span>SKILL</span> <span>SCANNER</span>
            </h1>
            <p className="hero-subtitle">
              Free scan now via skill-security-scan. Advanced LLM/recursive scan
              will launch at {ADVANCED_SCAN_PRICE} MON (coming soon).
            </p>
          </div>
        </section>

        {/* Payment Card */}
        <section className={styles.paymentSection}>
          <div className={`glass-card ${styles.paymentCard}`}>
            {/* Wallet Status */}
            {!isConnected ? (
              <div className={styles.walletWarning}>
                <p className={styles.walletWarningText}>
                  ⚠️ Wallet Not Connected
                </p>
                <div className={styles.connectWrapper}>
                  <ConnectButton />
                </div>
              </div>
            ) : (
              <div className={styles.walletStatus}>
                <div>
                  <p className={styles.walletConnectedLabel}>
                    ● Connected to Monad Testnet
                  </p>
                  <p className={styles.walletAddress}>
                    {address?.slice(0, 10)}...{address?.slice(-8)}
                  </p>
                </div>
                <div className={styles.balanceSection}>
                  <p className={styles.balanceLabel}>Mode</p>
                  <p className={styles.balanceValue}>FREE SCAN</p>
                </div>
              </div>
            )}

            {/* Input Field */}
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>
                GitHub Repository URL
              </label>
              <input
                type="text"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/org/repo"
                className={styles.urlInput}
                disabled={status === 'redirecting'}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className={styles.errorMessage}>
                <p>{error}</p>
              </div>
            )}

            {/* Success Message */}
            {status === 'redirecting' && (
              <div className={styles.successMessage}>
                <p>✓ Redirecting to scanner...</p>
              </div>
            )}

            <div className={styles.actionRow}>
              <button
                onClick={handleFreeScan}
                disabled={status === 'redirecting'}
                className={`primary-btn ${styles.payButton}`}
              >
                {status === 'redirecting' ? 'Redirecting...' : 'Start Free Scan'}
              </button>

              <button
                type="button"
                disabled
                className={`${styles.advancedButton}`}
                title="Coming soon"
              >
                Advanced Scan ({ADVANCED_SCAN_PRICE} MON) · Coming Soon
              </button>
            </div>

            {/* Footer Info */}
            <div className={styles.footerInfo}>
              <p>
                Powered by{' '}
                <a
                  href={SCAN_URL}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.footerLink}
                >
                  skill-security-scan
                </a>
              </p>
            </div>
          </div>
        </section>

        <section className={styles.flowSection}>
          <h2 className={styles.flowTitle}>Complete User Flow</h2>
          <div className={styles.flowGrid}>
            <div className={styles.flowCard}><strong>/scan</strong><span>扫描入口</span></div>
            <div className={styles.flowArrow}>→</div>
            <div className={styles.flowCard}><strong>/scan/report</strong><span>详细报告</span></div>
            <div className={styles.flowArrow}>→</div>
            <div className={styles.flowCard}><strong>/scan/poster</strong><span>海报分享</span></div>
          </div>
          <p className={styles.flowNote}>
            Share poster QR and open report with <code>?src=poster_qr</code>.
          </p>
        </section>

        {/* Features Section */}
        <section className={styles.featuresSection}>
          {/* Basic Features */}
          <div className={styles.featureGroup}>
            <h2 className={styles.featureTitle}>
              // Basic Scan (Active)
            </h2>
            <div className={`skills-grid ${styles.basicGrid}`}>
              <FeatureCard
                icon="🔍"
                title="Static Analysis"
                desc="Semgrep + Gitleaks"
              />
              <FeatureCard
                icon="🛡️"
                title="PI Detection"
                desc="Prompt injection risks"
              />
              <FeatureCard
                icon="📊"
                title="Share Report"
                desc="Poster + QR code"
              />
            </div>
          </div>

          {/* Advanced Features (Coming Soon) */}
          <div className={styles.featureGroup}>
            <h2 className={`${styles.featureTitle} ${styles.featureTitlePurple}`}>
              // Advanced Scan (Coming Soon)
            </h2>
            <div className={`skills-grid ${styles.advancedGrid}`}>
              <FeatureCard
                icon="📦"
                title="Dependency Scan"
                desc="npm/pip vulnerabilities"
                disabled
              />
              <FeatureCard
                icon="🧪"
                title="Dynamic Testing"
                desc="Sandbox execution"
                disabled
              />
              <FeatureCard
                icon="🤖"
                title="LLM-as-Judge"
                desc="Semantic evaluation"
                disabled
              />
              <FeatureCard
                icon="📈"
                title="Benchmark Score"
                desc="pass@k metrics"
                disabled
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

// Feature Card Component
function FeatureCard({
  icon,
  title,
  desc,
  disabled = false
}: {
  icon: string;
  title: string;
  desc: string;
  disabled?: boolean;
}) {
  return (
    <div
      className={`skill-card ${disabled ? styles.featureCardDisabled : ''}`}
    >
      <div className={styles.featureIcon}>{icon}</div>
      <h3 className={styles.featureCardTitle}>
        {title}
      </h3>
      <p className={styles.featureCardDesc}>
        {desc}
      </p>
    </div>
  );
}
