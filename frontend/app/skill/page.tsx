'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import SecurityScanCard from '@/components/SecurityScanCard';
import ScanReportCard, { ScanResult } from '@/components/ScanReportCard';

type ShareData = {
  shareUrl: string;
  qrCode?: string;
};

export default function SkillPage() {
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [shareData, setShareData] = useState<ShareData | null>(null);
  const [shareError, setShareError] = useState<string | null>(null);

  const handleScanComplete = (result: ScanResult) => {
    setScanResult(result);
    setShareData(null);
    setShareError(null);
  };

  const handleShareReport = async () => {
    if (!scanResult?.scanId) return;
    setShareError(null);

    try {
      const res = await fetch('/api/security-scan/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scan_id: scanResult.scanId }),
      });
      const data = await res.json();

      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Failed to create share link');
      }

      const url = data.data?.shareUrl as string;
      setShareData({ shareUrl: url, qrCode: data.data?.qrCode });
      if (url && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      }
    } catch (error) {
      setShareError(error instanceof Error ? error.message : 'Share failed');
    }
  };

  return (
    <div className="app-shell">
      <div className="app-backdrop" aria-hidden="true" />
      <Navbar />

      <main className="app-main">
        <section className="hero">
          <div className="hero-copy">
            <span className="hero-kicker">SECURITY_SCAN_v2.0</span>
            <h1 className="hero-title">
              <span>AGENT</span> <span>SKILL</span> <span>SCANNER</span>
            </h1>
            <p className="hero-subtitle">
              Real security scan for GitHub/NPM skills. Report + Share + Poster in one flow.
            </p>
            <div className="hero-actions">
              <a
                href={process.env.NEXT_PUBLIC_SKILL_SCAN_URL || 'https://skill-security-scan.vercel.app'}
                target="_blank"
                rel="noreferrer"
                className="ghost-btn"
              >
                Open External Engine
              </a>
            </div>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 mb-12">
          <SecurityScanCard onScanComplete={handleScanComplete} />
        </section>

        {scanResult && (
          <section className="max-w-4xl mx-auto px-6 mb-12">
            <ScanReportCard report={scanResult} onShare={handleShareReport} />

            <div className="glass-card mt-6 p-5">
              <h3 className="text-lg font-bold font-['Orbitron'] text-[var(--neon-purple)] mb-3">
                // SHARE_AND_POSTER
              </h3>
              <div className="flex flex-wrap gap-3">
                <Link className="primary-btn" href={`/scan/report/${scanResult.scanId}`}>
                  View Full Report
                </Link>
                <Link className="ghost-btn" href={`/scan/poster/${scanResult.scanId}`} target="_blank">
                  Open Poster
                </Link>
              </div>

              {shareData?.shareUrl && (
                <div className="mt-4">
                  <p className="text-[var(--text-muted)] text-sm mb-2">
                    Share link copied to clipboard:
                  </p>
                  <code className="block text-xs break-all bg-[var(--bg-secondary)] p-3 rounded border border-[var(--border-card)]">
                    {shareData.shareUrl}
                  </code>
                  {shareData.qrCode && (
                    <img
                      src={shareData.qrCode}
                      alt="Share QR"
                      className="mt-3 w-32 h-32 rounded border border-[var(--border-card)] bg-white p-2"
                    />
                  )}
                </div>
              )}

              {shareError && (
                <p className="mt-3 text-sm text-red-400">{shareError}</p>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
