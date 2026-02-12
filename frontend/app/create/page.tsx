// app/create/page.tsx - Create Skill Page
'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, useAccount, useWriteContract } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { config, CONTRACT_ABI, CONTRACT_ADDRESS } from '@/lib/wagmi';
import { keccak256, toBytes } from 'viem';
import Navbar from '@/components/Navbar';

const queryClient = new QueryClient();

function CreatePage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { writeContractAsync, isPending } = useWriteContract();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    platform: 'claude-code',
    version: '1.0.0',
    paymentAddress: '',
    npmPackage: '',
    repository: '',
    homepage: '',
    tags: '',
  });

  const paymentAddress = form.paymentAddress || address || '';

  const skillId = useMemo(() => {
    if (!form.name || !form.platform || !form.version) return '';
    const data = `${form.name}:${form.version}:${form.platform}`;
    return keccak256(toBytes(data));
  }, [form.name, form.platform, form.version]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.name || !form.description || !form.platform || !paymentAddress) {
      alert('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      // On-chain registration if contract is configured
      if (CONTRACT_ADDRESS !== '0x0000000000000000000000000000000000000000' && isConnected) {
        await writeContractAsync({
          address: CONTRACT_ADDRESS as `0x${string}`,
          abi: CONTRACT_ABI,
          functionName: 'registerSkill',
          args: [skillId as `0x${string}`, form.name, paymentAddress as `0x${string}`],
        });
      }

      const res = await fetch('/api/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skill_id: skillId,
          name: form.name,
          description: form.description,
          platform: form.platform,
          version: form.version,
          paymentAddress,
          creatorAddress: address || paymentAddress,
          npmPackage: form.npmPackage || null,
          repository: form.repository || null,
          homepage: form.homepage || null,
          tags: form.tags
            ? form.tags
                .split(',')
                .map((tag) => tag.trim())
                .filter(Boolean)
            : [],
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert('Skill created successfully!');
        router.push('/#skills');
      } else {
        alert(data.error || 'Creation failed');
      }
    } catch (error) {
      console.error('Failed to create Skill:', error);
      alert('Failed to create Skill. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="app-shell">
      <div className="app-backdrop" aria-hidden="true" />
      <Navbar />

      <main className="app-main">
        <section className="hero">
          <div className="hero-copy">
            <span className="hero-kicker">Create Skill</span>
            <h1 className="hero-title">Register Your Agent Capability</h1>
            <p className="hero-subtitle">
              On-chain registration + metadata storage. One registration enables cross-platform users to discover and tip your Skill.
            </p>
          </div>
        </section>

        <section className="skills-section">
          <header className="skills-header">
            <div>
              <h2 className="skills-title">Skill Information</h2>
              <p className="skills-subtitle">
                Fields marked with * are required. Connect your wallet to submit on-chain registration.
              </p>
            </div>
          </header>

          <form className="skill-form" onSubmit={handleSubmit}>
            <label className="skill-form-field">
              <span>Skill Name *</span>
              <input
                className="skill-input"
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                placeholder="e.g., Claude Code Copilot"
                required
              />
            </label>

            <label className="skill-form-field">
              <span>Description *</span>
              <textarea
                className="skill-textarea"
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                placeholder="Describe your Skill's capabilities"
                rows={4}
                required
              />
            </label>

            <label className="skill-form-field">
              <span>Platform *</span>
              <select
                className="filter-select"
                value={form.platform}
                onChange={(event) => setForm({ ...form, platform: event.target.value })}
              >
                <option value="coze">Coze</option>
                <option value="claude-code">Claude Code</option>
                <option value="manus">Manus</option>
                <option value="minimax">MiniMax</option>
              </select>
            </label>

            <label className="skill-form-field">
              <span>Version</span>
              <input
                className="skill-input"
                value={form.version}
                onChange={(event) => setForm({ ...form, version: event.target.value })}
                placeholder="1.0.0"
              />
            </label>

            <label className="skill-form-field">
              <span>Payment Address *</span>
              <input
                className="skill-input"
                value={paymentAddress}
                onChange={(event) =>
                  setForm({ ...form, paymentAddress: event.target.value })
                }
                placeholder="0x..."
                required
              />
            </label>

            <label className="skill-form-field">
              <span>npm Package</span>
              <input
                className="skill-input"
                value={form.npmPackage}
                onChange={(event) => setForm({ ...form, npmPackage: event.target.value })}
                placeholder="@scope/package"
              />
            </label>

            <label className="skill-form-field">
              <span>Repository</span>
              <input
                className="skill-input"
                value={form.repository}
                onChange={(event) => setForm({ ...form, repository: event.target.value })}
                placeholder="https://github.com/..."
              />
            </label>

            <label className="skill-form-field">
              <span>Homepage</span>
              <input
                className="skill-input"
                value={form.homepage}
                onChange={(event) => setForm({ ...form, homepage: event.target.value })}
                placeholder="https://..."
              />
            </label>

            <label className="skill-form-field">
              <span>Tags (comma-separated)</span>
              <input
                className="skill-input"
                value={form.tags}
                onChange={(event) => setForm({ ...form, tags: event.target.value })}
                placeholder="productivity, coding, AI"
              />
            </label>

            <div className="skill-form-footer">
              <div className="skill-form-meta">
                <span>Skill ID</span>
                <span className="skill-form-id">
                  {skillId ? skillId.slice(0, 18) + '...' : 'Generated after entering name'}
                </span>
              </div>
              <button
                className="primary-btn"
                type="submit"
                disabled={submitting || isPending}
              >
                {submitting || isPending ? 'Submitting...' : 'Create & Register'}
              </button>
            </div>
          </form>
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
          <CreatePage />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
