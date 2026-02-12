// components/TipModal.tsx - Tip Modal Component (Feature disabled)
'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';

interface TipModalProps {
  skill: any;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function TipModal({ skill, onClose, onSuccess }: TipModalProps) {
  const { isConnected } = useAccount();
  const [amount, setAmount] = useState('10');
  const [message, setMessage] = useState('');
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleTip = async () => {
    // Feature is currently disabled
    setResult({ success: false, message: 'Tip feature is currently disabled for this demo. Skills are now managed through database only.' });
    return;
  };

  return (
    <div className="tip-modal-overlay" onClick={onClose}>
      <div className="tip-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="tip-modal-header">
          <h3 className="text-xl font-bold">Support Creator</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition text-xl"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="tip-modal-body">
          {/* Info Message */}
          <div className="bg-yellow-900/30 border border-yellow-700 rounded-xl p-6 text-center mb-6">
            <p className="text-yellow-100">
              💬 Tip Feature Coming Soon
            </p>
            <p className="text-sm text-gray-300">
              The tip feature is being updated to work with our new database-driven system.
              Soon you'll be able to directly support your favorite creators.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="tip-modal-footer">
          <div className="text-center">
            <p className="text-xs text-gray-500">
              Skill ID: {skill.id || skill.skill_id}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
