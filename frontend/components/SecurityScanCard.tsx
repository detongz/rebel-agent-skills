"use client";

import { useState, useEffect } from "react";

interface SecurityScanCardProps {
  onScanComplete?: (result: ScanResult) => void;
  className?: string;
}

interface ScanResult {
  scanId: string;
  score: number;
  status: 'safe' | 'warning' | 'danger';
  grade: string;
  vulnerabilities: number;
  warnings: string[];
  repoUrl: string;
}

type ScanPhase = "idle" | "connecting" | "fetching" | "analyzing" | "completed" | "error";

export default function SecurityScanCard({ onScanComplete, className = "" }: SecurityScanCardProps) {
  const [repoUrl, setRepoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<ScanPhase>("idle");
  const [elapsedMs, setElapsedMs] = useState(0);

  function getScanPhase(): { text: string; progress: number } {
    if (elapsedMs < 2000) return { text: "Connecting to repository...", progress: 10 };
    if (elapsedMs < 8000) return { text: "Fetching repository files...", progress: 30 };
    if (elapsedMs < 18000) return { text: "Analyzing dependencies...", progress: 50 };
    if (elapsedMs < 28000) return { text: "Scanning for security patterns...", progress: 70 };
    return { text: "Generating security report...", progress: 90 };
  }

  useEffect(() => {
    if (!loading) {
      setElapsedMs(0);
      setPhase("idle");
      return;
    }

    const start = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - start;
      setElapsedMs(elapsed);

      const currentPhase = getScanPhase();
      setPhase("analyzing");
    }, 100);

    return () => clearInterval(timer);
  }, [loading]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    setPhase("connecting");

    try {
      const res = await fetch("/api/security-scan/external", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repo_url: repoUrl, scan_type: "github" }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || data.message || "Scan failed");
        setPhase("error");
        return;
      }

      setPhase("completed");
      const result: ScanResult = {
        scanId: data.data.scan_id,
        score: data.data.result?.score || data.data.result?.data?.score || 0,
        status: data.data.result?.status || data.data.result?.data?.status || 'warning',
        grade: data.data.result?.grade || data.data.result?.data?.grade || 'B',
        vulnerabilities: data.data.result?.vulnerabilities || 0,
        warnings: data.data.result?.warnings || [],
        repoUrl,
      };

      onScanComplete?.(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error. Please retry.");
      setPhase("error");
    } finally {
      setLoading(false);
    }
  }

  const scanInfo = getScanPhase();

  return (
    <div className={`glass-card border-2 border-[var(--neon-purple)] ${className}`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="text-3xl">🛡️</div>
          <div>
            <h2 className="text-xl font-bold font-['Orbitron'] text-[var(--neon-purple)]">
              SECURITY_SCANNER
            </h2>
            <p className="text-sm text-[var(--text-muted)] font-['Rajdhani']">
              Scan GitHub repos for vulnerabilities before hiring
            </p>
          </div>
        </div>

        {/* Scan Form */}
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-[var(--text-muted)] mb-2 font-['Rajdhani']">
              Repository URL
            </label>
            <input
              className="w-full bg-[var(--bg-secondary)] text-white px-4 py-3 rounded-lg border border-[var(--border-card)] focus:ring-2 focus:ring-[var(--neon-purple)] focus:border-transparent transition"
              placeholder="https://github.com/owner/repo"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {/* Loading Progress */}
          {loading && (
            <div className="bg-[var(--bg-tertiary)] rounded-lg p-4 border border-[var(--border-card)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[var(--text-muted)] font-['Rajdhani']">
                  {scanInfo.text}
                </span>
                <span className="text-sm text-[var(--neon-purple)] font-mono">
                  {scanInfo.progress}%
                </span>
              </div>
              <div className="w-full h-2 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[var(--neon-purple)] to-[var(--neon-blue)] transition-all duration-300"
                  style={{ width: `${scanInfo.progress}%` }}
                />
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-2 text-center">
                This can take 20-40 seconds for larger repositories
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <span className="text-red-400">⚠️</span>
                <span className="text-red-400 text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !repoUrl}
            className={`w-full py-3 px-6 rounded-lg font-bold font-['Orbitron'] transition ${
              loading || !repoUrl
                ? 'bg-[var(--bg-secondary)] text-[var(--text-muted)] cursor-not-allowed'
                : 'bg-[var(--neon-purple)] hover:bg-[var(--neon-blue)] text-white'
            }`}
          >
            {loading ? `⏳ SCANNING... ${scanInfo.progress}%` : "🔍 START SECURITY SCAN"}
          </button>
        </form>

        {/* Info Footer */}
        <div className="mt-4 pt-4 border-t border-[var(--border-card)]">
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <span>ℹ️</span>
            <span>Powered by skill-security-scan v0.2.2 - GitHub + npm package analysis</span>
          </div>
        </div>
      </div>
    </div>
  );
}
