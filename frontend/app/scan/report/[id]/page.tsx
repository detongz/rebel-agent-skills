import { notFound } from "next/navigation";
import db from "@/lib/db";
import ScanReportCard from "@/components/ScanReportCard";
import Link from "next/link";

interface ScanReport {
  id: string;
  scan_id: string;
  repo_url: string;
  overall_score: number;
  security_grade: string;
  findings_count: number;
  code_quality_score?: number;
  dependency_score?: number;
  documentation_score?: number;
  license_compliance?: string;
  report_data: any;
  created_at: string;
  updated_at: string;
}

async function getScanReport(id: string): Promise<ScanReport | null> {
  try {
    const report = db.prepare(`
      SELECT * FROM scan_reports WHERE scan_id = ?
    `).get(id) as ScanReport | undefined;

    return report || null;
  } catch (error) {
    console.error('Error fetching scan report:', error);
    return null;
  }
}

export default async function ScanReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const report = await getScanReport(id);

  if (!report) {
    notFound();
  }

  // Parse report data
  const reportData = report.report_data;
  const scanResult = {
    scanId: report.scan_id,
    score: report.overall_score,
    status: reportData?.status || (report.overall_score >= 90 ? 'safe' : report.overall_score >= 70 ? 'needs_review' : 'risky'),
    grade: report.security_grade || (report.overall_score >= 90 ? 'A' : report.overall_score >= 80 ? 'B' : report.overall_score >= 70 ? 'C' : 'D'),
    vulnerabilities: report.findings_count,
    warnings: reportData?.warnings || [],
    repoUrl: report.repo_url,
    createdAt: report.created_at,
    findings: reportData?.result?.findings || reportData?.details?.dependencyCheck?.warnings?.map((w: string, i: number) => ({
      ruleId: `dep-${i}`,
      title: 'Dependency Warning',
      severity: 'medium' as const,
      file: 'package.json',
      line: 0,
      snippet: w,
      recommendation: 'Review and update this dependency',
    })) || [],
    details: reportData?.details,
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] py-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Navigation */}
        <nav className="flex items-center justify-between mb-8">
          <Link
            href="/skill"
            className="text-[var(--neon-purple)] hover:underline font-['Orbitron']"
          >
            ← Back to Scanner
          </Link>
          <div className="flex gap-4">
            <Link
              href="/skill"
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)] font-['Rajdhani']"
            >
              New Scan
            </Link>
          </div>
        </nav>

        {/* Report Card */}
        <ScanReportCard report={scanResult} />

        {/* Footer */}
        <footer className="mt-12 text-center text-[var(--text-muted)] font-['Rajdhani']">
          <p className="mb-2">
            Security Scan powered by{' '}
            <a
              href={process.env.NEXT_PUBLIC_SKILL_SCAN_URL || 'https://skill-security-scan.vercel.app'}
              target="_blank"
              className="text-[var(--neon-purple)] hover:underline"
            >
              skill-security-scan
            </a>
          </p>
          <p className="text-xs">
            Generated on {new Date(report.created_at).toLocaleString()}
          </p>
        </footer>
      </div>
    </div>
  );
}
