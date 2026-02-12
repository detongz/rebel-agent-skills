// app/skill/[id]/page.tsx - Skill Detail Page
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAccount, useWriteContract } from 'wagmi';
import { parseEther } from 'viem';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { config, CONTRACT_ABI, CONTRACT_ADDRESS } from '@/lib/wagmi';
import Navbar from '@/components/Navbar';

const queryClient = new QueryClient();

function SkillDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { writeContractAsync, isPending } = useWriteContract();
  const skillId = params.id as string;

  const [skill, setSkill] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tips, setTips] = useState<any[]>([]);

  useEffect(() => {
    if (skillId) {
      fetchSkill();
      fetchTips();
    }
  }, [skillId]);

  const fetchSkill = async () => {
    try {
      const res = await fetch(`/api/skills/${skillId}`);
      if (!res.ok) {
        router.push('/');
        return;
      }
      const data = await res.json();
      setSkill(data.skill);
    } catch (error) {
      console.error('Failed to fetch skill:', error);
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchTips = async () => {
    try {
      const res = await fetch(`/api/tip?skill_id=${skillId}&limit=10`);
      const data = await res.json();
      setTips(data.tips || []);
    } catch (error) {
      console.error('Failed to fetch tips:', error);
    }
  };

  const handleTip = async () => {
    if (!isConnected || !address) {
      alert('Please connect your wallet first');
      return;
    }

    if (!skill.skill_id) {
      alert('Skill ID is missing, cannot tip');
      return;
    }

    if (CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000') {
      alert('Contract not configured. Please set NEXT_PUBLIC_CONTRACT_ADDRESS');
      return;
    }

    const input = window.prompt('Enter tip amount (ASKL)', '1');
    if (!input) return;

    let amountWei: bigint;
    try {
      amountWei = parseEther(input);
    } catch (error) {
      alert('Invalid amount format');
      return;
    }

    if (amountWei <= 0n) {
      alert('Please enter an amount greater than 0');
      return;
    }

    try {
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'tipSkill',
        args: [skill.skill_id as `0x${string}`, amountWei],
      });

      await fetch('/api/tip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skill_id: skill.id,
          amount: amountWei.toString(),
          message: '',
          from_address: address,
          tx_hash: hash,
        }),
      });

      fetchSkill();
      fetchTips();
      alert('Tip submitted successfully!');
    } catch (error) {
      console.error('Tip failed:', error);
      alert('Tip failed, please try again later');
    }
  };

  if (loading) {
    return (
      <div className="app-shell">
        <div className="app-backdrop" aria-hidden="true" />
        <div className="loading-state">
          <div className="loading-orb" />
          <p className="loading-text">Loading Skill...</p>
        </div>
      </div>
    );
  }

  if (!skill) {
    return (
      <div className="app-shell">
        <div className="app-backdrop" aria-hidden="true" />
        <div className="empty-state">
          <h3>Skill Not Found</h3>
          <p>The skill you're looking for doesn't exist.</p>
          <button className="primary-btn" onClick={() => router.push('/')}>
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const formatNumber = (num: number | string) => {
    const n = typeof num === 'string' ? parseFloat(num) / 1e18 : num;
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toString();
  };

  const parseTags = (tags: any) => {
    try {
      return typeof tags === 'string' ? JSON.parse(tags) : tags;
    } catch {
      return [];
    }
  };

  const tags = parseTags(skill.tags);

  return (
    <div className="app-shell">
      <div className="app-backdrop" aria-hidden="true" />

      <Navbar />

      <main className="app-main">
        <section className="hero">
          <div className="hero-copy">
            <span className="hero-kicker">{skill.platform}</span>
            <h1 className="hero-title">{skill.name}</h1>
            <p className="hero-subtitle">
              {skill.description}
            </p>
            <div className="hero-actions">
              <button
                onClick={handleTip}
                disabled={isPending}
                className="primary-btn"
                style={{ opacity: isPending ? 0.5 : 1 }}
              >
                {isPending ? 'Submitting...' : '💰 Tip this Skill'}
              </button>
              <a
                href={skill.repository}
                target="_blank"
                rel="noreferrer"
                className="ghost-btn"
              >
                View Source
              </a>
            </div>
          </div>
        </section>

        <section className="skills-section">
          <header className="skills-header">
            <div>
              <h2 className="skills-title">Skill Details</h2>
              <p className="skills-subtitle">
                Full information about this Agent Skill
              </p>
            </div>
          </header>

          <div style={{ display: 'grid', gap: '24px', maxWidth: '800px' }}>
            {/* Stats Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '16px',
            }}>
              <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
                <p style={{ fontSize: '28px', fontWeight: 700, color: 'var(--accent-purple)' }}>
                  {formatNumber(skill.total_tips || '0')}
                </p>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Total Tips (ASKL)</p>
              </div>
              <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
                <p style={{ fontSize: '28px', fontWeight: 700, color: 'var(--accent-green)' }}>
                  {skill.tip_count || 0}
                </p>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Tip Count</p>
              </div>
              {skill.github_stars > 0 && (
                <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
                  <p style={{ fontSize: '28px', fontWeight: 700, color: 'var(--accent-blue)' }}>
                    {formatNumber(skill.github_stars)}
                  </p>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>GitHub Stars</p>
                </div>
              )}
              {skill.platform_likes > 0 && (
                <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
                  <p style={{ fontSize: '28px', fontWeight: 700, color: 'var(--accent-pink)' }}>
                    {formatNumber(skill.platform_likes)}
                  </p>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Platform Likes</p>
                </div>
              )}
            </div>

            {/* External Links */}
            <div className="glass-card" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>External Links</h3>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                {skill.npm_package && (
                  <a
                    href={`https://www.npmjs.com/package/${skill.npm_package}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="nav-link"
                  >
                    📦 npm
                  </a>
                )}
                {skill.repository && (
                  <a
                    href={skill.repository}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="nav-link"
                  >
                    🔗 GitHub
                  </a>
                )}
                {skill.homepage && (
                  <a
                    href={skill.homepage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="nav-link"
                  >
                    🌐 Homepage
                  </a>
                )}
              </div>
            </div>

            {/* Tags */}
            {Array.isArray(tags) && tags.length > 0 && (
              <div className="glass-card" style={{ padding: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Tags</h3>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {tags.map((tag: string, idx: number) => (
                    <span
                      key={idx}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        background: 'var(--glass-bg-strong)',
                        border: '1px solid var(--glass-border)',
                        fontSize: '13px',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Payment Info */}
            <div className="glass-card" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Payment Information</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Creator Address</span>
                  <span style={{ fontFamily: 'monospace' }}>{skill.creator_address?.slice(0, 10)}...{skill.creator_address?.slice(-8)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Payment Address</span>
                  <span style={{ fontFamily: 'monospace' }}>{skill.payment_address?.slice(0, 10)}...{skill.payment_address?.slice(-8)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Fee Distribution</span>
                  <span style={{ color: 'var(--accent-green)' }}>98% Creator · 2% Platform</span>
                </div>
              </div>
            </div>

            {/* Recent Tips */}
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Recent Tips</h3>
              {tips.length === 0 ? (
                <div className="glass-card" style={{ padding: '32px', textAlign: 'center' }}>
                  <p style={{ color: 'var(--text-muted)' }}>No tips yet. Be the first to tip!</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {tips.map((tip) => (
                    <div key={tip.id} className="glass-card" style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div>
                          <p style={{ fontWeight: 600, color: 'var(--accent-green)' }}>
                            {formatNumber(tip.amount)} ASKL
                          </p>
                          {tip.message && (
                            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                              "{tip.message}"
                            </p>
                          )}
                        </div>
                        <div style={{ textAlign: 'right', fontSize: '12px' }}>
                          <p style={{ color: 'var(--text-muted)' }}>
                            {new Date(tip.created_at).toLocaleDateString('en-US')}
                          </p>
                          <p style={{ fontFamily: 'monospace', color: 'var(--text-dim)' }}>
                            {tip.from_address?.slice(0, 6)}...{tip.from_address?.slice(-4)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default function Page() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <SkillDetailPage />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
