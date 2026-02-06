// components/TipModal.tsx - 打赏弹窗组件
'use client';

import { useState } from 'react';
import { useAccount, useDisconnect } from 'wagmi';

interface TipModalProps {
  skill: any;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function TipModal({ skill, onClose, onSuccess }: TipModalProps) {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  const [amount, setAmount] = useState('10');
  const [message, setMessage] = useState('');
  const [tipping, setTipping] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; txHash?: string } | null>(null);

  const handleTip = async () => {
    if (!isConnected || !address) {
      setResult({ success: false, message: '请先连接钱包' });
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setResult({ success: false, message: '请输入有效的打赏金额' });
      return;
    }

    setTipping(true);
    setResult(null);

    try {
      const res = await fetch('/api/tip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skill_id: skill.id,
          amount: amountNum.toString(),
          message: message.trim() || undefined,
          from_address: address,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setResult({
          success: true,
          message: `✅ 打赏成功！感谢支持 ${skill.name} 的创作者！`,
          txHash: data.data.tx_hash,
        });
        if (onSuccess) onSuccess();
      } else {
        setResult({ success: false, message: `❌ ${data.error}` });
      }
    } catch (error) {
      console.error('打赏失败:', error);
      setResult({ success: false, message: '❌ 打赏失败，请稍后重试' });
    } finally {
      setTipping(false);
    }
  };

  const creatorReceived = (parseFloat(amount || '0') * 0.98).toFixed(2);
  const platformFee = (parseFloat(amount || '0') * 0.02).toFixed(2);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl max-w-md w-full border border-gray-700">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-800">
          <h3 className="text-xl font-bold">打赏创作者</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Skill Info */}
          <div className="flex items-center gap-3 mb-6 p-4 bg-gray-800/50 rounded-xl">
            {skill.logo_url && (
              <img src={skill.logo_url} alt={skill.name} className="w-12 h-12 rounded-lg" />
            )}
            <div>
              <p className="font-bold">{skill.name}</p>
              <p className="text-sm text-gray-400">{skill.description}</p>
            </div>
          </div>

          {/* Amount Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">打赏金额 (ASKL)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1"
              step="1"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
              placeholder="输入打赏金额"
            />
          </div>

          {/* Message Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">留言 (可选)</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500 resize-none"
              placeholder="给创作者留个言..."
            />
          </div>

          {/* Fee Breakdown */}
          <div className="bg-gray-800/50 rounded-xl p-4 mb-6">
            <p className="text-sm font-medium mb-3">分账明细</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">创作者收到</span>
                <span className="text-green-400 font-bold">{creatorReceived} ASKL (98%)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">平台费用</span>
                <span className="text-gray-400">{platformFee} ASKL (2%)</span>
              </div>
              <div className="border-t border-gray-700 pt-2 flex justify-between">
                <span className="font-medium">总计</span>
                <span className="font-bold">{amount} ASKL</span>
              </div>
            </div>
          </div>

          {/* Result Message */}
          {result && (
            <div className={`mb-4 p-4 rounded-xl ${
              result.success ? 'bg-green-900/30 border border-green-700' : 'bg-red-900/30 border border-red-700'
            }`}>
              <p className={result.success ? 'text-green-400' : 'text-red-400'}>{result.message}</p>
              {result.txHash && (
                <p className="text-xs text-gray-500 mt-2 break-all">
                  TX: {result.txHash}
                </p>
              )}
            </div>
          )}

          {/* Action Button */}
          {!isConnected ? (
            <div className="bg-yellow-900/30 border border-yellow-700 rounded-xl p-4 text-center">
              <p className="text-yellow-400 mb-2">请先连接钱包</p>
              <p className="text-sm text-gray-400">连接后即可打赏创作者</p>
            </div>
          ) : (
            <button
              onClick={handleTip}
              disabled={tipping || result?.success}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {tipping ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  处理中...
                </span>
              ) : result?.success ? (
                '已完成 ✓'
              ) : (
                `打赏 ${amount} ASKL`
              )}
            </button>
          )}

          {/* Creator Address */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              收款地址: {skill.payment_address}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
