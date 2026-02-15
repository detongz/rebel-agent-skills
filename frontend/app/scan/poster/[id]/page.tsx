import { notFound } from 'next/navigation';
import db from '@/lib/db';

type ScanReport = {
  scan_id: string;
  repo_url: string;
  overall_score: number;
  security_grade: string;
  findings_count: number;
  report_data: unknown;
  created_at: string;
};

function parseReportData(input: unknown): Record<string, unknown> {
  if (!input) return {};
  if (typeof input === 'string') {
    try {
      return JSON.parse(input) as Record<string, unknown>;
    } catch {
      return {};
    }
  }
  if (typeof input === 'object') return input as Record<string, unknown>;
  return {};
}

async function getReport(id: string): Promise<ScanReport | null> {
  try {
    const row = db.prepare('SELECT * FROM scan_reports WHERE scan_id = ?').get(id) as ScanReport | undefined;
    return row || null;
  } catch {
    return null;
  }
}

function statusFromScore(score: number): 'SAFE' | 'REVIEW' | 'RISK' {
  if (score >= 90) return 'SAFE';
  if (score >= 70) return 'REVIEW';
  return 'RISK';
}

export default async function ScanPosterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const report = await getReport(id);
  if (!report) notFound();

  const data = parseReportData(report.report_data);
  const warnings = Array.isArray(data.warnings) ? data.warnings as string[] : [];
  const status = statusFromScore(report.overall_score || 0);

  return (
    <div className="min-h-screen bg-[#0b1020] text-white p-6 md:p-10">
      <div className="max-w-3xl mx-auto rounded-2xl border border-cyan-400/30 bg-gradient-to-br from-[#101935] to-[#0c1124] p-8 shadow-2xl">
        <p className="text-cyan-300 text-sm tracking-widest mb-4">MYSKILLS SECURITY POSTER</p>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">AGENT SKILL SCAN RESULT</h1>
        <p className="text-cyan-100/80 mb-8 break-all">{report.repo_url}</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="rounded-xl bg-black/25 p-4">
            <div className="text-xs text-cyan-200/70">Score</div>
            <div className="text-3xl font-bold">{report.overall_score ?? 0}</div>
          </div>
          <div className="rounded-xl bg-black/25 p-4">
            <div className="text-xs text-cyan-200/70">Grade</div>
            <div className="text-3xl font-bold">{report.security_grade || 'N/A'}</div>
          </div>
          <div className="rounded-xl bg-black/25 p-4">
            <div className="text-xs text-cyan-200/70">Findings</div>
            <div className="text-3xl font-bold">{report.findings_count ?? 0}</div>
          </div>
          <div className="rounded-xl bg-black/25 p-4">
            <div className="text-xs text-cyan-200/70">Status</div>
            <div className="text-2xl font-bold">{status}</div>
          </div>
        </div>

        {warnings.length > 0 && (
          <div className="rounded-xl border border-amber-300/30 bg-amber-400/10 p-4 mb-6">
            <h2 className="font-semibold mb-2">Top Warnings</h2>
            <ul className="list-disc list-inside text-sm text-amber-100/90">
              {warnings.slice(0, 5).map((w, i) => (
                <li key={`${i}-${w}`}>{w}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-wrap gap-3 text-sm">
          <a href={`/scan/report/${report.scan_id}`} className="px-4 py-2 rounded-lg bg-cyan-500 text-black font-semibold">
            Full Report
          </a>
          <a href="/scan" className="px-4 py-2 rounded-lg border border-cyan-300/40">
            New Scan
          </a>
        </div>

        <p className="mt-8 text-xs text-cyan-100/60">
          Scan ID: {report.scan_id} · Generated: {new Date(report.created_at).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
