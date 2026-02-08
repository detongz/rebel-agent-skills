'use client';

import { useState, useEffect } from 'react';
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
}

export default function BountiesPage() {
  const { isConnected } = useAccount();
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    status: 'all' as 'all' | 'open' | 'in-progress' | 'completed',
    category: '',
    sortBy: 'newest' as 'newest' | 'reward' | 'deadline'
  });

  useEffect(() => {
    fetchBounties();
  }, [filter]);

  const fetchBounties = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (filter.status !== 'all') queryParams.append('status', filter.status);
      if (filter.category) queryParams.append('category', filter.category);
      if (filter.sortBy) queryParams.append('sortBy', filter.sortBy);

      const response = await fetch(`/api/bounties?${queryParams.toString()}`);
      const result = await response.json();

      if (result.success) {
        // Convert date strings back to Date objects
        const bountiesWithDates = result.data.map((bounty: any) => ({
          ...bounty,
          createdAt: new Date(bounty.createdAt),
          deadline: bounty.deadline ? new Date(bounty.deadline) : undefined,
        }));
        setBounties(bountiesWithDates);
      } else {
        console.error('API error:', result.error);
        setBounties([]);
      }
    } catch (error) {
      console.error('Failed to fetch bounties:', error);
      setBounties([]);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'security-audit': 'bg-red-500/20 text-red-300 border-red-500/30',
      'code-review': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      'test-generation': 'bg-green-500/20 text-green-300 border-green-500/30',
      'optimization': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      'documentation': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      'other': 'bg-gray-500/20 text-gray-300 border-gray-500/30'
    };
    return colors[category] || colors.other;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'open': 'bg-green-500/20 text-green-300',
      'in-progress': 'bg-yellow-500/20 text-yellow-300',
      'completed': 'bg-blue-500/20 text-blue-300',
      'cancelled': 'bg-red-500/20 text-red-300'
    };
    return colors[status] || 'bg-gray-500/20 text-gray-300';
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatDate = (date: Date) => {
    return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
      Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      'day'
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Agent Bounties
              </h1>
              <p className="text-gray-400">
                Post and claim bounties for custom agent skill development
              </p>
            </div>
            {isConnected && (
              <Link
                href="/bounties/new"
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg shadow-purple-500/25"
              >
                + Post Bounty
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="mb-8 p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Status
              </label>
              <select
                value={filter.status}
                onChange={(e) => setFilter({ ...filter, status: e.target.value as any })}
                className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Category
              </label>
              <select
                value={filter.category}
                onChange={(e) => setFilter({ ...filter, category: e.target.value })}
                className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">All Categories</option>
                <option value="security-audit">Security Audit</option>
                <option value="code-review">Code Review</option>
                <option value="test-generation">Test Generation</option>
                <option value="optimization">Optimization</option>
                <option value="documentation">Documentation</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Sort By
              </label>
              <select
                value={filter.sortBy}
                onChange={(e) => setFilter({ ...filter, sortBy: e.target.value as any })}
                className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="newest">Newest</option>
                <option value="reward">Highest Reward</option>
                <option value="deadline">Deadline</option>
              </select>
            </div>
            <div className="flex items-end">
              <div className="text-sm text-gray-400">
                {loading ? (
                  <span>Loading...</span>
                ) : (
                  <span>{bounties.length} bount{bounties.length === 1 ? 'y' : 'ies'} found</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bounty List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          </div>
        ) : bounties.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg mb-4">No bounties found</p>
            {isConnected && (
              <Link
                href="/bounties/new"
                className="inline-block px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all"
              >
                Post the First Bounty
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {bounties.map((bounty) => (
              <Link
                key={bounty.id}
                href={`/bounties/${bounty.id}`}
                className="block p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-purple-500/50 transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-white group-hover:text-purple-400 transition-colors">
                        {bounty.title}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(bounty.category)}`}>
                        {bounty.category.replace('-', ' ')}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(bounty.status)}`}>
                        {bounty.status.replace('-', ' ')}
                      </span>
                    </div>
                    <p className="text-gray-400 mb-4 line-clamp-2">
                      {bounty.description}
                    </p>
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <span>👤</span>
                        <span>{formatAddress(bounty.creator)}</span>
                      </div>
                      {bounty.deadline && (
                        <div className="flex items-center gap-2">
                          <span>⏰</span>
                          <span>{formatDate(bounty.deadline)}</span>
                        </div>
                      )}
                      {bounty.assignee && (
                        <div className="flex items-center gap-2">
                          <span>✅</span>
                          <span>Assigned to {formatAddress(bounty.assignee)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="ml-6 text-right">
                    <div className="text-2xl font-bold text-purple-400">
                      {bounty.reward} ASKL
                    </div>
                    <div className="text-sm text-gray-500">Reward</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
