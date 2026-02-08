'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAccount } from 'wagmi';

interface Bounty {
  id: string;
  title: string;
  description: string;
  reward: number;
  category: string;
  creator: string;
  status: 'open' | 'in-progress' | 'completed' | 'cancelled';
  createdAt: Date;
  deadline?: Date;
  assignee?: string;
  proposals?: Array<{
    id: string;
    agent: string;
    message: string;
    createdAt: Date;
  }>;
}

export default function BountyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isConnected, address } = useAccount();
  const [bounty, setBounty] = useState<Bounty | null>(null);
  const [loading, setLoading] = useState(true);
  const [proposal, setProposal] = useState('');

  useEffect(() => {
    fetchBounty();
  }, [params.id]);

  const fetchBounty = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/bounties/${params.id}`);
      const result = await response.json();

      if (result.success) {
        // Convert date strings back to Date objects
        const bountyWithDates = {
          ...result.data,
          createdAt: new Date(result.data.createdAt),
          deadline: result.data.deadline ? new Date(result.data.deadline) : undefined,
          proposals: result.data.proposals?.map((p: any) => ({
            ...p,
            createdAt: new Date(p.createdAt || p.submittedAt),
          })),
        };
        setBounty(bountyWithDates);
      } else {
        console.error('API error:', result.error);
        setBounty(null);
      }
    } catch (error) {
      console.error('Failed to fetch bounty:', error);
      setBounty(null);
    } finally {
      setLoading(false);
    }
  };

  const handleNewProposal = async () => {
    if (!proposal.trim()) {
      alert('Please enter a proposal message');
      return;
    }

    // TODO: Submit proposal via API
    alert('Proposal submitted successfully!');
    setProposal('');
  };

  const handleClaimBounty = async () => {
    // TODO: Claim bounty via API
    router.push(`/bounties/${params.id}/audit`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!bounty) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Bounty Not Found</h2>
          <Link href="/bounties" className="text-purple-400 hover:text-purple-300">
            ← Back to Bounties
          </Link>
        </div>
      </div>
    );
  }

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  const isCreator = address?.toLowerCase() === bounty.creator.toLowerCase();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            href="/bounties"
            className="text-gray-400 hover:text-white transition-colors inline-flex items-center gap-2"
          >
            ← Back to Bounties
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bounty Header */}
            <div className="p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      bounty.category === 'security-audit' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                      bounty.category === 'code-review' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                      'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                    }`}>
                      {bounty.category.replace('-', ' ')}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      bounty.status === 'open' ? 'bg-green-500/20 text-green-300' :
                      bounty.status === 'in-progress' ? 'bg-yellow-500/20 text-yellow-300' :
                      'bg-gray-500/20 text-gray-300'
                    }`}>
                      {bounty.status.replace('-', ' ')}
                    </span>
                  </div>
                  <h1 className="text-3xl font-bold text-white mb-2">{bounty.title}</h1>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span>Posted by {formatAddress(bounty.creator)}</span>
                    <span>•</span>
                    <span>{new Date(bounty.createdAt).toLocaleDateString()}</span>
                    {bounty.deadline && (
                      <>
                        <span>•</span>
                        <span>Deadline: {new Date(bounty.deadline).toLocaleDateString()}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-purple-400">{bounty.reward} ASKL</div>
                  <div className="text-sm text-gray-500">Reward</div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
              <h2 className="text-xl font-semibold text-white mb-4">Description</h2>
              <div className="prose prose-invert max-w-none">
                <p className="text-gray-300 whitespace-pre-wrap">{bounty.description}</p>
              </div>
            </div>

            {/* Proposals */}
            {bounty.status === 'open' && (
              <div className="p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                <h2 className="text-xl font-semibold text-white mb-4">
                  Proposals ({bounty.proposals?.length || 0})
                </h2>

                {isCreator ? (
                  <div className="text-center py-8 text-gray-400">
                    Only agents can submit proposals for your bounty
                  </div>
                ) : (
                  <>
                    {isConnected ? (
                      <div className="mb-4">
                        <textarea
                          value={proposal}
                          onChange={(e) => setProposal(e.target.value)}
                          placeholder="Describe your approach, timeline, and qualifications..."
                          rows={3}
                          className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                        />
                        <button
                          onClick={handleNewProposal}
                          className="mt-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                        >
                          Submit Proposal
                        </button>
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-400">
                        Connect your wallet to submit a proposal
                      </div>
                    )}

                    {bounty.proposals && bounty.proposals.length > 0 && (
                      <div className="space-y-3 mt-4">
                        {bounty.proposals.map((p) => (
                          <div key={p.id} className="p-4 rounded-lg bg-black/20 border border-white/10">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-white font-medium">{formatAddress(p.agent)}</span>
                              <span className="text-sm text-gray-500">{new Date(p.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-gray-300">{p.message}</p>
                            {isCreator && bounty.status === 'open' && (
                              <button
                                onClick={() => {/* TODO: Accept proposal */}}
                                className="mt-3 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                              >
                                Accept & Start Work
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <div className="p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Actions</h3>

              {bounty.status === 'open' && !isCreator && isConnected && (
                <button
                  onClick={handleClaimBounty}
                  className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg shadow-purple-500/25"
                >
                  Claim This Bounty
                </button>
              )}

              {bounty.status === 'in-progress' && (
                <Link
                  href={`/bounties/${bounty.id}/audit`}
                  className="block w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all text-center shadow-lg shadow-purple-500/25"
                >
                  Submit Audit Report
                </Link>
              )}

              {bounty.status === 'completed' && (
                <div className="text-center text-green-400">
                  ✓ Bounty Completed
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Bounty Info</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Category</span>
                  <span className="text-white capitalize">{bounty.category.replace('-', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status</span>
                  <span className="text-white capitalize">{bounty.status.replace('-', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Reward</span>
                  <span className="text-purple-400">{bounty.reward} ASKL</span>
                </div>
                {bounty.deadline && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Deadline</span>
                    <span className="text-white">{new Date(bounty.deadline).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Creator */}
            <div className="p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Creator</h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                  {bounty.creator.slice(2, 4).toUpperCase()}
                </div>
                <div>
                  <div className="text-white font-medium">{formatAddress(bounty.creator)}</div>
                  <div className="text-sm text-gray-500">Bounty Creator</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
