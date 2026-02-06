// app/create/page.tsx - 创建 Skill 页面
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { config } from '@/lib/wagmi';
import ConnectButton from '@/components/ConnectButton';

const queryClient = new QueryClient();

function CreatePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    platform: 'claude-code',
    version: '1.0.0',
    paymentAddress: '',
    creatorAddress: '',
    npmPackage: '',
    repository: '',
    homepage: '',
    tags: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; skill?: any } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);

    try {
      const res = await fetch('/api/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          platform: formData.platform,
          version: formData.version,
          paymentAddress: formData.paymentAddress,
          creatorAddress: formData.creatorAddress || formData.paymentAddress,
          npmPackage: formData.npmPackage || undefined,
          repository: formData.repository || undefined,
          homepage: formData.homepage || undefined,
          tags: formData.tags ? formData.tags.split(',').map((t: string) => t.trim()) : undefined,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setResult({ success: true, message: 'Skill 创建成功！', skill: data.skill });
        // 3秒后跳转到首页
        setTimeout(() => router.push('/'), 3000);
      } else {
        setResult({ success: false, message: data.error || '创建失败' });
      }
    } catch (error) {
      console.error('创建失败:', error);
      setResult({ success: false, message: '网络错误，请稍后重试' });
    } finally {
      setSubmitting(false);
    }
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

      {/* Hero */}
      <section className="py-12 px-4 text-center border-b border-gray-800">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          创建新的 Skill
        </h1>
        <p className="text-gray-400">注册你的 Agent Skill 到 Agent Reward Hub</p>
      </section>

      {/* 表单 */}
      <section className="py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 基本信息 */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold">基本信息</h3>

                <div>
                  <label className="block text-sm font-medium mb-2">名称 *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
                    placeholder="Skill 名称"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">描述 *</label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500 resize-none"
                    placeholder="描述你的 Skill 功能"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">平台 *</label>
                    <select
                      value={formData.platform}
                      onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
                    >
                      <option value="claude-code">Claude Code</option>
                      <option value="coze">Coze</option>
                      <option value="manus">Manus</option>
                      <option value="minimax">MiniMax</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">版本</label>
                    <input
                      type="text"
                      value={formData.version}
                      onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
                      placeholder="1.0.0"
                    />
                  </div>
                </div>
              </div>

              {/* 收款信息 */}
              <div className="space-y-4 pt-6 border-t border-gray-800">
                <h3 className="text-lg font-bold">收款信息</h3>

                <div>
                  <label className="block text-sm font-medium mb-2">收款地址 *</label>
                  <input
                    type="text"
                    required
                    value={formData.paymentAddress}
                    onChange={(e) => setFormData({ ...formData, paymentAddress: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500 font-mono text-sm"
                    placeholder="0x..."
                  />
                  <p className="text-xs text-gray-500 mt-1">接收打赏的 Monad 钱包地址</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">创作者地址</label>
                  <input
                    type="text"
                    value={formData.creatorAddress}
                    onChange={(e) => setFormData({ ...formData, creatorAddress: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500 font-mono text-sm"
                    placeholder="与收款地址相同可留空"
                  />
                </div>
              </div>

              {/* 外部链接 */}
              <div className="space-y-4 pt-6 border-t border-gray-800">
                <h3 className="text-lg font-bold">外部链接（可选）</h3>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">npm 包名</label>
                    <input
                      type="text"
                      value={formData.npmPackage}
                      onChange={(e) => setFormData({ ...formData, npmPackage: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500 text-sm"
                      placeholder="@scope/package"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">GitHub</label>
                    <input
                      type="text"
                      value={formData.repository}
                      onChange={(e) => setFormData({ ...formData, repository: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500 text-sm"
                      placeholder="https://github.com/..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">官网</label>
                    <input
                      type="text"
                      value={formData.homepage}
                      onChange={(e) => setFormData({ ...formData, homepage: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500 text-sm"
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </div>

              {/* 标签 */}
              <div className="pt-6 border-t border-gray-800">
                <label className="block text-sm font-medium mb-2">标签（逗号分隔）</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
                  placeholder="react, ai, automation"
                />
              </div>

              {/* 结果提示 */}
              {result && (
                <div className={`p-4 rounded-xl ${result.success ? 'bg-green-900/30 border border-green-700' : 'bg-red-900/30 border border-red-700'}`}>
                  <p className={result.success ? 'text-green-400' : 'text-red-400'}>{result.message}</p>
                </div>
              )}

              {/* 提交按钮 */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? '创建中...' : '创建 Skill'}
              </button>
            </form>
          </div>

          {/* 说明 */}
          <div className="mt-6 bg-gray-900/50 rounded-xl p-6 text-sm text-gray-400">
            <p className="font-medium text-white mb-2">💡 提示：</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>所有带 * 的字段为必填项</li>
              <li>收款地址将用于接收 98% 的打赏金额</li>
              <li>填写 GitHub 仓库后，系统会自动获取 Stars 数据</li>
              <li>创建后需要链上注册才能获得完整功能</li>
            </ul>
          </div>
        </div>
      </section>
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
