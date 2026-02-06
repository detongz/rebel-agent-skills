// app/skill/[id]/page.tsx - Skill 详情页
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { config } from '@/lib/wagmi';
import ConnectButton from '@/components/ConnectButton';
import TipModal from '@/components/TipModal';

const queryClient = new QueryClient();

function SkillDetailPage() {
  const params = useParams();
  const router = useRouter();
  const skillId = params.id as string;

  const [skill, setSkill] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showTipModal, setShowTipModal] = useState(false);
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
      console.error('获取 Skill 失败:', error);
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
      console.error('获取打赏记录失败:', error);
    }
  };

  const handleTipSuccess = () => {
    // 刷新数据
    fetchSkill();
    fetchTips();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-400">加载中...</p>
        </div>
      </div>
    );
  }

  if (!skill) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <p className="text-gray-400">Skill 不存在</p>
      </div>
    );
  }

  const formatNumber = (num: number | string) => {
    const n = typeof num === 'string' ? parseFloat(num) : num;
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toString();
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* 导航栏 */}
      <nav className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-gray-300 hover:text-white transition"
            >
              <span>←</span>
              <span>返回首页</span>
            </button>
            <ConnectButton />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start gap-6 mb-8">
            {skill.logo_url && (
              <img
                src={skill.logo_url}
                alt={skill.name}
                className="w-24 h-24 rounded-2xl"
              />
            )}
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-4xl font-bold mb-2">{skill.name}</h1>
                  <p className="text-xl text-gray-400 mb-4">{skill.description}</p>
                </div>
                <button
                  onClick={() => setShowTipModal(true)}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-medium hover:opacity-90 transition"
                >
                  💰 打赏
                </button>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-4 mb-4">
                <span className="px-3 py-1 bg-purple-900/30 border border-purple-700 rounded-full text-sm">
                  {skill.platform}
                </span>
                {skill.version && (
                  <span className="px-3 py-1 bg-gray-800 rounded-full text-sm">
                    v{skill.version}
                  </span>
                )}
              </div>

              {/* 外部链接 */}
              <div className="flex gap-4 text-sm">
                {skill.npm_package && (
                  <a
                    href={`https://www.npmjs.com/package/${skill.npm_package}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition"
                  >
                    📦 npm
                  </a>
                )}
                {skill.repository && (
                  <a
                    href={skill.repository}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition"
                  >
                    🔗 GitHub
                  </a>
                )}
                {skill.homepage && (
                  <a
                    href={skill.homepage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition"
                  >
                    🌐 官网
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* 统计数据 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-900/50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-purple-400">{formatNumber(skill.download_count || 0)}</p>
              <p className="text-sm text-gray-500">下载量</p>
            </div>
            <div className="bg-gray-900/50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-green-400">{formatNumber(skill.github_stars || 0)}</p>
              <p className="text-sm text-gray-500">GitHub Stars</p>
            </div>
            <div className="bg-gray-900/50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-pink-400">{formatNumber(skill.total_tips || '0')} ASKL</p>
              <p className="text-sm text-gray-500">累计打赏</p>
            </div>
            <div className="bg-gray-900/50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-orange-400">{skill.tip_count || 0}</p>
              <p className="text-sm text-gray-500">打赏次数</p>
            </div>
          </div>

          {/* 标签 */}
          {skill.tags && (() => {
            try {
              const tags = typeof skill.tags === 'string' ? JSON.parse(skill.tags) : skill.tags;
              if (Array.isArray(tags) && tags.length > 0) {
                return (
                  <div className="mb-8">
                    <h3 className="text-lg font-bold mb-3">标签</h3>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag: string, idx: number) => (
                        <span key={idx} className="px-3 py-1 bg-gray-800 rounded-full text-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              }
            } catch (e) {
              console.error('Failed to parse tags:', e);
            }
            return null;
          })()}

          {/* 收款信息 */}
          <div className="bg-gray-900/50 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-bold mb-4">收款信息</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">创作者地址</span>
                <span className="font-mono text-xs">{skill.creator_address}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">收款地址</span>
                <span className="font-mono text-xs">{skill.payment_address}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">分账比例</span>
                <span className="text-green-400">98% 创作者 / 2% 平台</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 打赏记录 */}
      <section className="py-8 px-4 border-t border-gray-800">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">最近打赏</h2>
          {tips.length === 0 ? (
            <p className="text-gray-500 text-center py-8">还没有打赏，快来第一个打赏吧！</p>
          ) : (
            <div className="space-y-3">
              {tips.map((tip) => (
                <div key={tip.id} className="bg-gray-900/50 rounded-xl p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-green-400">{tip.amount} ASKL</p>
                      {tip.message && (
                        <p className="text-gray-400 text-sm mt-1">"{tip.message}"</p>
                      )}
                    </div>
                    <div className="text-right text-sm">
                      <p className="text-gray-500">
                        {new Date(tip.created_at).toLocaleDateString('zh-CN')}
                      </p>
                      <p className="text-xs text-gray-600 font-mono">
                        {tip.from_address.slice(0, 6)}...{tip.from_address.slice(-4)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Tip Modal */}
      {showTipModal && (
        <TipModal
          skill={skill}
          onClose={() => setShowTipModal(false)}
          onSuccess={handleTipSuccess}
        />
      )}
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
