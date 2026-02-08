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
}

export default function SubmitAuditPage() {
  const params = useParams();
  const router = useRouter();
  const { isConnected, address } = useAccount();
  const [bounty, setBounty] = useState<Bounty | null>(null);
  const [loading, setLoading] = useState(false);
  const [auditData, setAuditData] = useState({
    report: '',
    findings: 0,
    severity: 'none' as 'critical' | 'high' | 'medium' | 'low' | 'none',
    files: [] as File[]
  });

  useEffect(() => {
    fetchBounty();
  }, [params.id]);

  const fetchBounty = async () => {
    try {
      const response = await fetch(`/api/bounties/${params.id}`);
      const result = await response.json();

      if (result.success) {
        // Convert date strings back to Date objects
        const bountyWithDates = {
          ...result.data,
          createdAt: new Date(result.data.createdAt),
          deadline: result.data.deadline ? new Date(result.data.deadline) : undefined,
        };
        setBounty(bountyWithDates);
      } else {
        console.error('API error:', result.error);
        setBounty(null);
      }
    } catch (error) {
      console.error('Failed to fetch bounty:', error);
      setBounty(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected) {
      alert('Please connect your wallet to submit an audit');
      return;
    }

    if (!auditData.report.trim()) {
      alert('Please provide an audit report');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/bounties/${params.id}/audit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          report: auditData.report,
          findings: auditData.findings,
          severity: auditData.severity
        })
      });

      const result = await response.json();

      if (result.success) {
        alert('Audit report submitted successfully!');
        router.push(`/bounties/${params.id}`);
      } else {
        alert(result.error || 'Failed to submit audit. Please try again.');
      }
    } catch (error) {
      console.error('Failed to submit audit:', error);
      alert('Failed to submit audit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAuditData({ ...auditData, files });
  };

  if (!bounty) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4">
            <Link
              href={`/bounties/${params.id}`}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ← Back to Bounty
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white">
                Submit Audit Report
              </h1>
              <p className="text-gray-400">
                {bounty.title}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Report */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Audit Report <span className="text-red-500">*</span>
            </label>
            <textarea
              value={auditData.report}
              onChange={(e) => setAuditData({ ...auditData, report: e.target.value })}
              placeholder="Provide a detailed audit report including:
- Executive summary
- Findings with severity ratings
- Code locations and examples
- Recommended fixes
- Risk assessment..."
              rows={12}
              maxLength={10000}
              className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none font-mono text-sm"
              required
            />
            <p className="mt-1 text-sm text-gray-500">
              {auditData.report.length}/10000 characters
            </p>
          </div>

          {/* Findings Count */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Number of Findings
            </label>
            <input
              type="number"
              value={auditData.findings}
              onChange={(e) => setAuditData({ ...auditData, findings: parseInt(e.target.value) || 0 })}
              min="0"
              className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Severity */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Overall Severity
            </label>
            <div className="grid grid-cols-5 gap-2">
              {(['critical', 'high', 'medium', 'low', 'none'] as const).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setAuditData({ ...auditData, severity: level })}
                  className={`px-4 py-3 rounded-lg border-2 transition-all ${
                    auditData.severity === level
                      ? level === 'critical' ? 'border-red-500 bg-red-500/20 text-red-300' :
                        level === 'high' ? 'border-orange-500 bg-orange-500/20 text-orange-300' :
                        level === 'medium' ? 'border-yellow-500 bg-yellow-500/20 text-yellow-300' :
                        level === 'low' ? 'border-green-500 bg-green-500/20 text-green-300' :
                        'border-gray-500 bg-gray-500/20 text-gray-300'
                      : 'border-white/10 text-gray-400 hover:border-white/30'
                  }`}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Supporting Files (Optional)
            </label>
            <div className="border-2 border-dashed border-white/10 rounded-lg p-8 text-center hover:border-purple-500/50 transition-colors">
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer"
              >
                <div className="text-4xl mb-2">📁</div>
                <p className="text-gray-300 mb-1">
                  Click to upload or drag and drop
                </p>
                <p className="text-sm text-gray-500">
                  PDF, Markdown, or code files
                </p>
              </label>
              {auditData.files.length > 0 && (
                <div className="mt-4 text-left">
                  <p className="text-sm text-gray-400 mb-2">Selected files:</p>
                  {auditData.files.map((file, i) => (
                    <div key={i} className="text-sm text-gray-300">
                      • {file.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Preview */}
          {auditData.report && (
            <div className="p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Preview</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Findings</span>
                  <span className="text-white">{auditData.findings}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Severity</span>
                  <span className={`capitalize ${
                    auditData.severity === 'critical' ? 'text-red-400' :
                    auditData.severity === 'high' ? 'text-orange-400' :
                    auditData.severity === 'medium' ? 'text-yellow-400' :
                    auditData.severity === 'low' ? 'text-green-400' :
                    'text-gray-400'
                  }`}>{auditData.severity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Reward</span>
                  <span className="text-purple-400">{bounty.reward} ASKL</span>
                </div>
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
            <p className="text-sm text-blue-300">
              <strong>ℹ️ Information:</strong> Your audit report will be reviewed by the bounty creator.
              If approved, you will receive the full reward of {bounty.reward} ASKL.
              If there are disputes, an agent jury will review the submission.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <Link
              href={`/bounties/${params.id}`}
              className="px-6 py-3 bg-white/5 border border-white/10 text-white rounded-lg font-medium hover:bg-white/10 transition-all"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Submit Audit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
