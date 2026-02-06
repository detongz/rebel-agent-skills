// app/page.tsx - 首页
'use client';

import '@rainbow-me/rainbowkit/styles.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { config } from '@/lib/wagmi';
import ConnectButton from '@/components/ConnectButton';
import SkillCard from '@/components/SkillCard';
import { useEffect, useState } from 'react';

const queryClient = new QueryClient();

function HomePage() {
  const [skills, setSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const res = await fetch('/api/skills');
      const data = await res.json();
      setSkills(data.skills || []);
    } catch (error) {
      console.error('获取 Skills 失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const syncGitHubStats = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch('/api/sync-github/stats');
      const data = await res.json();
      if (data.success) {
        setSyncResult(`✅ 同步完成: 更新 ${data.summary.updated} 个，跳过 ${data.summary.skipped} 个`);
        // 刷新列表
        await fetchSkills();
      } else {
        setSyncResult(`❌ 同步失败: ${data.error}`);
      }
    } catch (error) {
      console.error('同步失败:', error);
      setSyncResult('❌ 同步失败: 网络错误');
    } finally {
      setSyncing(false);
      // 3 秒后清除提示
      setTimeout(() => setSyncResult(null), 3000);
    }
  };

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <div className="min-h-screen bg-gray-950 text-white">
          {/* 导航栏 */}
          <nav className="border-b border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🎁</span>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Agent Reward Hub
                  </h1>
                </div>
                <div className="flex items-center gap-4">
                  <a href="/leaderboard" className="text-gray-300 hover:text-white transition">
                    排行榜
                  </a>
                  <a href="/create" className="text-gray-300 hover:text-white transition">
                    创建 Skill
                  </a>
                  <ConnectButton />
                </div>
              </div>
            </div>
          </nav>

          {/* Hero Section */}
          <section className="py-20 px-4 text-center">
            <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
              跨平台 Agent Skill 打赏协议
            </h2>
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              支持 Coze、Claude Code、Manus、MiniMax 等平台
            </p>
            <p className="text-gray-500 mb-8">
              创作者一次注册，多平台收益
            </p>
            <div className="flex gap-4 justify-center">
              <a
                href="#skills"
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-medium hover:opacity-90 transition"
              >
                浏览 Skills
              </a>
              <a
                href="/create"
                className="px-8 py-3 border border-gray-700 rounded-lg font-medium hover:bg-gray-900 transition"
              >
                创建 Skill
              </a>
            </div>
          </section>

          {/* Skills 目录 */}
          <section id="skills" className="py-16 px-4">
            <div className="max-w-7xl mx-auto">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-bold">Skills 目录</h3>
                <div className="flex gap-2 items-center">
                  <button
                    onClick={syncGitHubStats}
                    disabled={syncing}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {syncing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-500 border-t-transparent"></div>
                        <span>同步中...</span>
                      </>
                    ) : (
                      <>
                        <span>🔄</span>
                        <span>同步 GitHub</span>
                      </>
                    )}
                  </button>
                  {syncResult && (
                    <span className="text-sm text-gray-400">{syncResult}</span>
                  )}
                  <select className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2">
                    <option>全部平台</option>
                    <option value="coze">Coze</option>
                    <option value="claude-code">Claude Code</option>
                    <option value="manus">Manus</option>
                    <option value="minimax">MiniMax</option>
                  </select>
                  <select className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2">
                    <option>按打赏量排序</option>
                    <option>按点赞量排序</option>
                    <option>按最新发布</option>
                  </select>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-20">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
                  <p className="mt-4 text-gray-400">加载中...</p>
                </div>
              ) : skills.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-gray-400">还没有 Skills，快来创建第一个吧！</p>
                  <a href="/create" className="inline-block mt-4 text-purple-400 hover:text-purple-300">
                    创建 Skill →
                  </a>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {skills.map((skill) => (
                    <SkillCard key={skill.id} skill={skill} />
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* 页脚 */}
          <footer className="border-t border-gray-800 py-8 text-center text-gray-500">
            <p>Agent Reward Hub - Monad Hackathon 2026</p>
            <p className="mt-2 text-sm">
              部署在 <a href="https://testnet-explorer.monad.xyz" target="_blank" className="text-purple-400 hover:text-purple-300">Monad Testnet</a>
            </p>
          </footer>
        </div>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default HomePage;
