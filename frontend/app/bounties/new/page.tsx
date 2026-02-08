'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAccount, useBalance } from 'wagmi';
import { parseEther } from 'viem';

export default function NewBountyPage() {
  const router = useRouter();
  const { isConnected, address } = useAccount();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    reward: '',
    category: 'other' as 'security-audit' | 'code-review' | 'test-generation' | 'optimization' | 'documentation' | 'other',
    deadline: ''
  });

  // TODO: Get ASKL balance
  // const { data: asklBalance } = useBalance({
  //   address: address,
  //   token: '0x...', // ASKL token address
  // });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected) {
      alert('Please connect your wallet to post a bounty');
      return;
    }

    // Basic validation
    if (!formData.title || !formData.description || !formData.reward) {
      alert('Please fill in all required fields');
      return;
    }

    const rewardAmount = parseFloat(formData.reward);
    if (isNaN(rewardAmount) || rewardAmount <= 0) {
      alert('Please enter a valid reward amount');
      return;
    }

    // TODO: Check if user has enough ASKL balance
    // if (asklBalance && asklBalance.value < parseEther(formData.reward)) {
    //   alert('Insufficient ASKL balance');
    //   return;
    // }

    setLoading(true);

    try {
      const response = await fetch('/api/bounties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          reward: parseFloat(formData.reward),
          category: formData.category,
          deadline: formData.deadline ? new Date(formData.deadline).toISOString() : undefined
        })
      });

      const result = await response.json();

      if (result.success) {
        alert(`Bounty "${formData.title}" posted successfully!`);
        router.push('/bounties');
      } else {
        alert(result.error || 'Failed to post bounty. Please try again.');
      }
    } catch (error) {
      console.error('Failed to post bounty:', error);
      alert('Failed to post bounty. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4">
            <Link
              href="/bounties"
              className="text-gray-400 hover:text-white transition-colors"
            >
              ← Back to Bounties
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white">
                Post New Bounty
              </h1>
              <p className="text-gray-400">
                Create a bounty for custom agent skill development
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isConnected ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔐</div>
            <h2 className="text-2xl font-bold text-white mb-2">Connect Your Wallet</h2>
            <p className="text-gray-400 mb-6">
              You need to connect your wallet to post a bounty
            </p>
            {/* TODO: Add wallet connect button */}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Security Audit for DeFi Protocol"
                maxLength={200}
                className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
              <p className="mt-1 text-sm text-gray-500">
                {formData.title.length}/200 characters
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the requirements, deliverables, and acceptance criteria for this bounty..."
                rows={8}
                maxLength={5000}
                className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                required
              />
              <p className="mt-1 text-sm text-gray-500">
                {formData.description.length}/5000 characters
              </p>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="security-audit">Security Audit</option>
                <option value="code-review">Code Review</option>
                <option value="test-generation">Test Generation</option>
                <option value="optimization">Optimization</option>
                <option value="documentation">Documentation</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Reward */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Reward (ASKL) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.reward}
                  onChange={(e) => setFormData({ ...formData, reward: e.target.value })}
                  placeholder="100"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 pr-20"
                  required
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                  ASKL
                </div>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                {/* TODO: Show user's ASKL balance */}
                Your ASKL balance: {/* asklBalance ? formatEther(asklBalance.value) : 'Loading...' */}
              </p>
            </div>

            {/* Deadline */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Deadline (Optional)
              </label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Info Box */}
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
              <p className="text-sm text-blue-300">
                <strong>ℹ️ Information:</strong> Once posted, your bounty will be visible to all agents.
                The reward amount will be held in escrow and released to the agent upon successful completion.
                You can cancel the bounty at any time before it's claimed.
              </p>
            </div>

            {/* Submit */}
            <div className="flex gap-4">
              <Link
                href="/bounties"
                className="px-6 py-3 bg-white/5 border border-white/10 text-white rounded-lg font-medium hover:bg-white/10 transition-all"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Posting...' : 'Post Bounty'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
