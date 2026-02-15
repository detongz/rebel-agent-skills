'use client';

import { useState } from 'react';
import { useAccount, useSendTransaction, useBalance } from 'wagmi';
import { parseEther } from 'viem';
import Navbar from '@/components/Navbar';
import ConnectButton from '@/components/ConnectButton';
import styles from './skill.module.css';

const SCAN_URL = 'https://skill-security-scan.vercel.app/scan';
const TIP_AMOUNT = '0.001'; // 0.001 MON
const RECEIVING_ADDRESS = process.env.NEXT_PUBLIC_SCAN_TIP_ADDRESS || '0x2679Bb99E7Cc239787a74BF6c77c2278311c77a1';

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
  const { data: balance } = useBalance({ address });
  const { sendTransactionAsync, isPending } = useSendTransaction();

  const [repoUrl, setRepoUrl] = useState('');
  const [status, setStatus] = useState<'idle' | 'paying' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  // 自动跳转到扫描页面
  const redirectToScanner = (url: string) => {
    const encodedUrl = encodeURIComponent(url);
    window.location.href = `${SCAN_URL}?repo=${encodedUrl}`;
  };

  const handlePayAndScan = async () => {
    setError(null);

    if (!isValidGitUrl(repoUrl)) {
      setError('Please enter a valid GitHub/GitLab/Bitbucket URL');
      return;
    }

    if (!isConnected || !address) {
      setError('Please connect your wallet first');
      return;
    }

    if (balance && balance.value < parseEther(TIP_AMOUNT)) {
      setError(`Insufficient balance. Need ${TIP_AMOUNT} MON to scan.`);
      return;
    }

    setStatus('paying');

    try {
      const hash = await sendTransactionAsync({
        to: RECEIVING_ADDRESS as `0x${string}`,
        value: parseEther(TIP_AMOUNT),
      });

      console.log('Payment successful:', hash);
      setStatus('success');

      setTimeout(() => {
        redirectToScanner(repoUrl);
      }, 1500);
    } catch (err: any) {
      console.error('Payment failed:', err);
      setStatus('error');

      if (err?.message?.includes('User rejected') || err?.code === 4001) {
        setError('Transaction rejected by user');
      } else {
        setError(err?.message || 'Payment failed. Please try again.');
      }
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
              Pay {TIP_AMOUNT} MON to scan any GitHub skill for security issues.
              Static analysis + Prompt injection detection + Shareable reports.
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
                  <p className={styles.balanceLabel}>
                    Balance
                  </p>
                  <p className={styles.balanceValue}>
                    {balance ? `${parseFloat(balance.formatted).toFixed(4)} MON` : '...'}
                  </p>
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
                disabled={status === 'paying' || status === 'success'}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className={styles.errorMessage}>
                <p>{error}</p>
              </div>
            )}

            {/* Success Message */}
            {status === 'success' && (
              <div className={styles.successMessage}>
                <p>✓ Payment successful! Redirecting to scanner...</p>
              </div>
            )}

            {/* Pay Button */}
            <button
              onClick={handlePayAndScan}
              disabled={!isConnected || status === 'paying' || status === 'success'}
              className={`primary-btn ${styles.payButton}`}
            >
              {status === 'paying' ? (
                <span className={styles.buttonLoading}>
                  <span className="loading-orb" style={{ width: '20px', height: '20px', borderWidth: '2px' }} />
                  Confirming Payment...
                </span>
              ) : status === 'success' ? (
                '✓ Redirecting...'
              ) : (
                `Pay ${TIP_AMOUNT} MON & Start Scan`
              )}
            </button>

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
