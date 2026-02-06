// components/TipModal.tsx - Tip Modal Component
'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';

interface TipModalProps {
  skill: any;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function TipModal({ skill, onClose, onSuccess }: TipModalProps) {
  const { address, isConnected } = useAccount();

  const [amount, setAmount] = useState('10');
  const [message, setMessage] = useState('');
  const [tipping, setTipping] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; txHash?: string } | null>(null);

  const handleTip = async () => {
    if (!isConnected || !address) {
      setResult({ success: false, message: 'Please connect your wallet first' });
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setResult({ success: false, message: 'Please enter a valid tip amount' });
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
          message: `Tip successful! Thank you for supporting ${skill.name}!`,
          txHash: data.data.tx_hash,
        });
        if (onSuccess) onSuccess();
      } else {
        setResult({ success: false, message: data.error });
      }
    } catch (error) {
      console.error('Tip failed:', error);
      setResult({ success: false, message: 'Tip failed, please try again later' });
    } finally {
      setTipping(false);
    }
  };

  const creatorReceived = (parseFloat(amount || '0') * 0.98).toFixed(2);
  const platformFee = (parseFloat(amount || '0') * 0.02).toFixed(2);

  return (
    <div className="tip-modal-overlay" onClick={onClose}>
      <div className="tip-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="tip-modal-header">
          <h3 className="text-xl font-bold">Tip Creator</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition text-xl"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="tip-modal-body">
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
            <label className="form-label">Tip Amount (ASKL)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1"
              step="1"
              className="form-input"
              placeholder="Enter tip amount"
            />
          </div>

          {/* Message Input */}
          <div className="mb-6">
            <label className="form-label">Message (Optional)</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="form-input resize-none"
              placeholder="Leave a message for the creator..."
            />
          </div>

          {/* Fee Breakdown */}
          <div className="fee-breakdown mb-6">
            <p className="text-sm font-medium mb-3">Fee Breakdown</p>
            <div className="fee-row">
              <span className="text-gray-400">Creator receives</span>
              <span className="text-green-400 font-bold">{creatorReceived} ASKL (98%)</span>
            </div>
            <div className="fee-row">
              <span className="text-gray-400">Platform fee</span>
              <span className="text-gray-400">{platformFee} ASKL (2%)</span>
            </div>
            <div className="fee-row fee-row-total">
              <span className="font-medium">Total</span>
              <span className="font-bold">{amount} ASKL</span>
            </div>
          </div>

          {/* Result Message */}
          {result && (
            <div className={`mb-4 p-4 rounded-xl ${
              result.success ? 'bg-green-900/30 border border-green-700' : 'bg-red-900/30 border border-red-700'
            }`}>
              <p className={result.success ? 'text-green-400' : 'text-red-400'}>{result.message}</p>
              {result.txHash && (
                <p className="text-xs text-gray-500 mt-2 break-all font-mono">
                  TX: {result.txHash}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="tip-modal-footer">
          {!isConnected ? (
            <div className="bg-yellow-900/30 border border-yellow-700 rounded-xl p-4 text-center">
              <p className="text-yellow-400 mb-2">Please connect your wallet first</p>
              <p className="text-sm text-gray-400">Connect to tip creators</p>
            </div>
          ) : (
            <button
              onClick={handleTip}
              disabled={tipping || result?.success}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {tipping ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="spinner" style={{ width: 16, height: 16 }}></div>
                  Processing...
                </span>
              ) : result?.success ? (
                'Completed ✓'
              ) : (
                `Tip ${amount} ASKL`
              )}
            </button>
          )}

          {/* Creator Address */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500 font-mono">
              Payment Address: {skill.payment_address}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
