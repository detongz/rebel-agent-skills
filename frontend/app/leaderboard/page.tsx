// app/leaderboard/page.tsx - 排行榜页面
'use client';

import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { config } from '@/lib/wagmi';
import ConnectButton from '@/components/ConnectButton';

const queryClient = new QueryClient();

type SortBy = 'tips' | 'stars' | 'likes' | 'downloads';
type Platform = 'all' | 'coze' | 'claude-code' | 'manus' | 'minimax';

function LeaderboardPage() {
  const [skills, setSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortBy>('tips');
  const [platform, setPlatform] = useState<Platform>('all');

  useEffect(() => {
    fetchSkills();
  }, [sortBy, platform]);

  const fetchSkills = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        sort_by: sortBy,
        ...(platform !== 'all' && { platform }),
      });
      const res = await fetch(`/api/skills?${params}`);
      const data = await res.json();
      setSkills(data.skills || []);
    } catch (error) {
      console.error('获取 Skills 失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTier = (index: number) => {
    if (index < 3) return { tier: '铂金', color: 'from-gray-300 to-gray-400', border: 'border-gray-300' };
    if (index < 10) return { tier: '黄金', color: 'from-yellow-500 to-yellow-600', border: 'border-yellow-500' };
    if (index < 30) return { tier: '白银', color: 'from-gray-400 to-gray-500', border: 'border-gray-400' };
    return { tier: '青铜', color: 'from-orange-600 to-orange-700', border: 'border-orange-600' };
  };

  const formatNumber = (num: number | string) => {
    const n = typeof num === 'string' ? parseFloat(num) : num;
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toString();
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return (index + 1).toString();
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* 导航栏 */}
      <nav className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <a href="/" className="text-gray-300 hover:text-white transition">
                ← 返回
              </a>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🏆</span>
                <h1 className="text-xl font-bold">排行榜</h1>
              </div>
            </div>
            <ConnectButton />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-12 px-4 text-center border-b border-gray-800">
        <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Agent Skills 排行榜
        </h2>
        <p className="text-gray-400">发现最受欢迎的 Agent Skills</p>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 justify-center mt-8">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2"
          >
            <option value="tips">按打赏量排序</option>
            <option value="stars">按 GitHub Stars</option>
            <option value="likes">按点赞量排序</option>
            <option value="downloads">按下载量排序</option>
          </select>

          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value as Platform)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2"
          >
            <option value="all">全部平台</option>
            <option value="coze">Coze</option>
            <option value="claude-code">Claude Code</option>
            <option value="manus">Manus</option>
            <option value="minimax">MiniMax</option>
          </select>
        </div>

        {/* Tier Legend */}
        <div className="flex flex-wrap gap-4 justify-center mt-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gradient-to-r from-gray-300 to-gray-400"></div>
            <span className="text-gray-400">铂金 (Top 3)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gradient-to-r from-yellow-500 to-yellow-600"></div>
            <span className="text-gray-400">黄金 (Top 10)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gradient-to-r from-gray-400 to-gray-500"></div>
            <span className="text-gray-400">白银 (Top 30)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gradient-to-r from-orange-600 to-orange-700"></div>
            <span className="text-gray-400">青铜</span>
          </div>
        </div>
      </section>

      {/* Leaderboard */}
      <section className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
              <p className="mt-4 text-gray-400">加载中...</p>
            </div>
          ) : skills.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400">暂无数据</p>
            </div>
          ) : (
            <div className="space-y-3">
              {skills.map((skill, index) => {
                const tier = getTier(index);
                return (
                  <a
                    key={skill.id}
                    href={`/skill/${skill.id}`}
                    className={`block bg-gray-900/50 rounded-xl p-4 border-2 ${tier.border} hover:bg-gray-800/50 transition`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Rank */}
                      <div className="w-12 h-12 flex items-center justify-center text-2xl font-bold">
                        {getRankIcon(index)}
                      </div>

                      {/* Tier Badge */}
                      <div className={`px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${tier.color} text-white`}>
                        {tier.tier}
                      </div>

                      {/* Skill Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold">{skill.name}</h3>
                          <span className="px-2 py-0.5 bg-purple-500/10 text-purple-400 rounded text-xs">
                            {skill.platform}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400 line-clamp-1">{skill.description}</p>
                      </div>

                      {/* Stats */}
                      <div className="flex gap-4 text-sm">
                        <div className="text-center">
                          <p className="font-bold text-purple-400">
                            {formatNumber(skill.total_tips || '0')}
                          </p>
                          <p className="text-xs text-gray-500">ASKL</p>
                        </div>
                        <div className="text-center">
                          <p className="font-bold text-green-400">
                            {formatNumber(skill.github_stars || 0)}
                          </p>
                          <p className="text-xs text-gray-500">Stars</p>
                        </div>
                        <div className="text-center">
                          <p className="font-bold text-pink-400">
                            {skill.tip_count || 0}
                          </p>
                          <p className="text-xs text-gray-500">打赏</p>
                        </div>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 text-center text-gray-500">
        <p>Agent Reward Hub - Monad Hackathon 2026</p>
      </footer>
    </div>
  );
}

export default function Page() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <LeaderboardPage />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
