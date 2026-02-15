'use client';

import { useState } from 'react';
import { useAccount, useSendTransaction, useBalance } from 'wagmi';
import { parseEther } from 'viem';
import Navbar from '@/components/Navbar';
import ConnectButton from '@/components/ConnectButton';

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
        <section className="max-w-2xl mx-auto px-6" style={{ marginTop: '-2rem' }}>
          <div className="glass-card p-8">
            {/* Wallet Status */}
            {!isConnected ? (
              <div className="text-center mb-6">
                <div className="p-6 rounded-lg" style={{
                  background: 'rgba(255, 102, 0, 0.05)',
                  border: '1px solid rgba(255, 102, 0, 0.2)'
                }}>
                  <p style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    color: 'var(--warning-orange)',
                    marginBottom: '16px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em'
                  }}>
                    ⚠️ Wallet Not Connected
                  </p>
                  <div className="flex justify-center">
                    <ConnectButton />
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-6 p-4 rounded-lg" style={{
                background: 'rgba(0, 255, 136, 0.03)',
                border: '1px solid rgba(0, 255, 136, 0.2)'
              }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '10px',
                      color: 'var(--neon-green)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em'
                    }}>
                      ● Connected to Monad Testnet
                    </p>
                    <p style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      color: 'var(--text-muted)',
                      marginTop: '4px'
                    }}>
                      {address?.slice(0, 10)}...{address?.slice(-8)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '10px',
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase'
                    }}>
                      Balance
                    </p>
                    <p style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '18px',
                      fontWeight: '700',
                      color: 'var(--text-primary)'
                    }}>
                      {balance ? `${parseFloat(balance.formatted).toFixed(4)} MON` : '...'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Input Field */}
            <div className="mb-6">
              <label style={{
                display: 'block',
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: '8px'
              }}>
                GitHub Repository URL
              </label>
              <input
                type="text"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/org/repo"
                style={{
                  width: '100%',
                  height: '48px',
                  padding: '0 16px',
                  background: 'var(--bg-void)',
                  border: '1px solid rgba(0, 255, 136, 0.2)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'all var(--transition-base)'
                }}
                disabled={status === 'paying' || status === 'success'}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--neon-green)';
                  e.target.style.boxShadow = '0 0 20px rgba(0, 255, 136, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(0, 255, 136, 0.2)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 rounded-lg" style={{
                background: 'rgba(255, 0, 0, 0.05)',
                border: '1px solid rgba(255, 0, 0, 0.2)'
              }}>
                <p style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  color: '#ff6b6b'
                }}>
                  {error}
                </p>
              </div>
            )}

            {/* Success Message */}
            {status === 'success' && (
              <div className="mb-6 p-4 rounded-lg" style={{
                background: 'rgba(0, 255, 136, 0.05)',
                border: '1px solid rgba(0, 255, 136, 0.3)'
              }}>
                <p style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  color: 'var(--neon-green)'
                }}>
                  ✓ Payment successful! Redirecting to scanner...
                </p>
              </div>
            )}

            {/* Pay Button */}
            <button
              onClick={handlePayAndScan}
              disabled={!isConnected || status === 'paying' || status === 'success'}
              className="primary-btn w-full"
              style={{
                height: '56px',
                fontSize: '14px',
                opacity: (!isConnected || status === 'paying' || status === 'success') ? 0.5 : 1,
                cursor: (!isConnected || status === 'paying' || status === 'success') ? 'not-allowed' : 'pointer'
              }}
            >
              {status === 'paying' ? (
                <span className="flex items-center justify-center gap-3">
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
            <div className="mt-6 text-center">
              <p style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                color: 'var(--text-faint)',
                letterSpacing: '0.05em'
              }}>
                Powered by{' '}
                <a
                  href={SCAN_URL}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: 'var(--neon-blue)' }}
                >
                  skill-security-scan
                </a>
              </p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="max-w-4xl mx-auto px-6 mt-12">
          {/* Basic Features */}
          <div className="mb-8">
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '14px',
              fontWeight: '700',
              color: 'var(--neon-green)',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              marginBottom: '16px',
              textAlign: 'center'
            }}>
              // Basic Scan (Active)
            </h2>
            <div className="skills-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
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
          <div>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '14px',
              fontWeight: '700',
              color: 'var(--neon-purple)',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              marginBottom: '16px',
              textAlign: 'center'
            }}>
              // Advanced Scan (Coming Soon)
            </h2>
            <div className="skills-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', opacity: 0.5 }}>
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
      className="skill-card"
      style={{
        padding: '20px',
        textAlign: 'center',
        opacity: disabled ? 0.6 : 1,
        borderStyle: disabled ? 'dashed' : 'solid'
      }}
    >
      <div style={{ fontSize: '28px', marginBottom: '12px' }}>{icon}</div>
      <h3 style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '12px',
        fontWeight: '700',
        color: disabled ? 'var(--text-muted)' : 'var(--text-primary)',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        marginBottom: '6px'
      }}>
        {title}
      </h3>
      <p style={{
        fontFamily: 'var(--font-tech)',
        fontSize: '12px',
        color: 'var(--text-muted)',
        margin: 0
      }}>
        {desc}
      </p>
    </div>
  );
}
