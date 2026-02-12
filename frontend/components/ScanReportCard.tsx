"use client";

import Link from "next/link";

interface ScanReportCardProps {
  report: ScanResult;
  onShare?: () => void;
  onHire?: () => void;
  className?: string;
}

export interface ScanResult {
  scanId: string;
  score: number;
  status: 'safe' | 'warning' | 'danger' | 'needs_review' | 'risky';
  grade: string;
  vulnerabilities: number;
  warnings: string[];
  repoUrl: string;
  createdAt?: string;
  findings?: ScanFinding[];
  details?: {
    codeAnalysis?: {
      score: number;
      findings: string[];
    };
    dependencyCheck?: {
      score: number;
      warnings: string[];
    };
  };
}

export interface ScanFinding {
  ruleId: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  file: string;
  line: number;
  snippet: string;
  recommendation: string;
}

interface Decision {
  action: 'ACCEPT' | 'REJECT' | 'REVIEW';
  gradeLabel: string;
  message: string;
  color: string;
}

function getScanDecision(report: ScanResult): Decision {
  const score = report.score;
  const criticalCount = report.findings?.filter(f => f.severity === 'critical').length || 0;
  const highCount = report.findings?.filter(f => f.severity === 'high').length || 0;

  // Critical vulnerabilities = automatic reject
  if (criticalCount > 0 || score < 50) {
    return {
      action: 'REJECT',
      gradeLabel: 'DANGEROUS',
      message: '⚠️ Critical security issues detected. Not recommended for hiring.',
      color: 'var(--error-red)',
    };
  }

  // High vulnerabilities or low score = review with caution
  if (highCount > 2 || score < 70) {
    return {
      action: 'REVIEW',
      gradeLabel: 'REVIEW WITH CAUTION',
      message: '⚠️ Security concerns detected. Review findings before hiring.',
      color: 'var(--warning-orange)',
    };
  }

  // Safe to hire
  return {
    action: 'ACCEPT',
    gradeLabel: 'APPROVED',
    message: '✅ No critical security issues. Safe to hire.',
    color: 'var(--neon-green)',
  };
}

function severityColor(severity: ScanFinding['severity']): string {
  switch (severity) {
    case 'critical': return '#dc2626';
    case 'high': return '#ea580c';
    case 'medium': return '#f59e0b';
    case 'low': return '#3b82f6';
    default: return '#6b7280';
  }
}

function gradeColor(grade: string): string {
  switch (grade.toUpperCase()) {
    case 'A': return 'var(--neon-green)';
    case 'B': return 'var(--neon-blue)';
    case 'C': return 'var(--warning-orange)';
    case 'D': case 'F': return 'var(--error-red)';
    default: return 'var(--text-muted)';
  }
}

function statusBadge(status: ScanResult['status']): { text: string; bg: string; fg: string } {
  switch (status) {
    case 'safe':
      return { text: 'PASS', bg: 'rgba(34, 197, 94, 0.2)', fg: 'var(--neon-green)' };
    case 'needs_review':
      return { text: 'REVIEW', bg: 'rgba(251, 191, 36, 0.2)', fg: 'var(--warning-orange)' };
    case 'risky':
    case 'danger':
      return { text: 'RISK', bg: 'rgba(239, 68, 68, 0.2)', fg: 'var(--error-red)' };
    case 'warning':
      return { text: 'WARNING', bg: 'rgba(251, 191, 36, 0.2)', fg: 'var(--warning-orange)' };
    default:
      return { text: 'UNKNOWN', bg: 'rgba(107, 114, 128, 0.2)', fg: 'var(--text-muted)' };
  }
}

export default function ScanReportCard({ report, onShare, onHire, className = "" }: ScanReportCardProps) {
  const decision = getScanDecision(report);
  const status = statusBadge(report.status);

  const findings = report.findings || [];
  const summary = {
    critical: findings.filter(f => f.severity === 'critical').length,
    high: findings.filter(f => f.severity === 'high').length,
    medium: findings.filter(f => f.severity === 'medium').length,
    low: findings.filter(f => f.severity === 'low').length,
  };

  return (
    <div className={`glass-card border-2 ${className}`} style={{ borderColor: decision.color }}>
      {/* Header with Grade and Status */}
      <div className="p-6 border-b border-[var(--border-card)]">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div
                className="text-6xl font-bold font-['Orbitron']"
                style={{ color: gradeColor(report.grade) }}
              >
                {report.grade}
              </div>
              <div className="text-2xl font-bold text-white font-['Orbitron']">
                {report.score}/100
              </div>
            </div>
            <div className="h-16 w-px bg-[var(--border-card)]" />
            <div>
              <div
                className="px-3 py-1 rounded-full text-sm font-bold"
                style={{ backgroundColor: status.bg, color: status.fg }}
              >
                {status.text}
              </div>
              <p className="text-sm text-[var(--text-muted)] mt-2 font-['Rajdhani']">
                {report.repoUrl.replace(/^https?:\/\//, '')}
              </p>
              {report.createdAt && (
                <p className="text-xs text-[var(--text-muted)] mt-1 font-['Rajdhani']">
                  {new Date(report.createdAt).toLocaleString()}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {onShare && (
              <button
                onClick={onShare}
                className="p-2 rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] transition"
                title="Share Report"
              >
                🔗
              </button>
            )}
            <Link
              href={`/scan/report/${report.scanId}`}
              target="_blank"
              className="p-2 rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] transition"
              title="View Full Report"
            >
              📋
            </Link>
          </div>
        </div>

        {/* Decision Banner */}
        <div
          className="p-4 rounded-lg border-2"
          style={{ borderColor: decision.color, backgroundColor: `${decision.color}15` }}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="font-bold font-['Orbitron'] mb-1" style={{ color: decision.color }}>
                {decision.gradeLabel}
              </div>
              <div className="text-sm text-[var(--text-secondary)] font-['Rajdhani']">
                {decision.message}
              </div>
            </div>
            {onHire && (
              <button
                onClick={onHire}
                disabled={decision.action === 'REJECT'}
                className={`px-6 py-2 rounded-lg font-bold font-['Orbitron'] transition ${
                  decision.action === 'REJECT'
                    ? 'bg-[var(--bg-secondary)] text-[var(--text-muted)] cursor-not-allowed'
                    : 'bg-[var(--neon-green)] hover:bg-[var(--neon-blue)] text-white'
                }`}
              >
                {decision.action === 'ACCEPT' ? '✓ HIRE THIS SKILL' :
                 decision.action === 'REVIEW' ? '⚠️ REVIEW & HIRE' :
                 '✕ NOT RECOMMENDED'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Findings Summary */}
      <div className="p-6">
        <h3 className="text-lg font-bold font-['Orbitron'] text-[var(--neon-purple)] mb-4">
          // FINDINGS_SUMMARY
        </h3>
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center p-4 bg-[var(--bg-secondary)] rounded-lg">
            <div className="text-3xl font-bold" style={{ color: '#dc2626' }}>
              {summary.critical}
            </div>
            <div className="text-sm text-[var(--text-muted)] font-['Rajdhani']">Critical</div>
          </div>
          <div className="text-center p-4 bg-[var(--bg-secondary)] rounded-lg">
            <div className="text-3xl font-bold" style={{ color: '#ea580c' }}>
              {summary.high}
            </div>
            <div className="text-sm text-[var(--text-muted)] font-['Rajdhani']">High</div>
          </div>
          <div className="text-center p-4 bg-[var(--bg-secondary)] rounded-lg">
            <div className="text-3xl font-bold" style={{ color: '#f59e0b' }}>
              {summary.medium}
            </div>
            <div className="text-sm text-[var(--text-muted)] font-['Rajdhani']">Medium</div>
          </div>
          <div className="text-center p-4 bg-[var(--bg-secondary)] rounded-lg">
            <div className="text-3xl font-bold" style={{ color: '#3b82f6' }}>
              {summary.low}
            </div>
            <div className="text-sm text-[var(--text-muted)] font-['Rajdhani']">Low</div>
          </div>
        </div>

        {/* Detailed Findings List */}
        {findings.length > 0 && (
          <div className="mt-6">
            <h4 className="text-md font-bold font-['Orbitron'] text-[var(--text-primary)] mb-3">
              DETECTED_RISKS
            </h4>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {findings.map((finding, index) => (
                <div
                  key={`${finding.ruleId}-${index}`}
                  className="p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-card)]"
                >
                  <div className="flex items-start gap-3">
                    <span
                      className="px-2 py-1 rounded text-xs font-bold"
                      style={{ backgroundColor: severityColor(finding.severity), color: 'white' }}
                    >
                      {finding.severity.toUpperCase()}
                    </span>
                    <div className="flex-1">
                      <h5 className="font-bold text-[var(--text-primary)] mb-1">
                        {finding.title}
                      </h5>
                      <p className="text-sm text-[var(--text-muted)] font-mono mb-2">
                        {finding.file}:{finding.line}
                      </p>
                      {finding.snippet && (
                        <pre className="text-xs bg-[var(--bg-tertiary)] p-2 rounded overflow-x-auto mb-2">
                          <code>{finding.snippet}</code>
                        </pre>
                      )}
                      <p className="text-sm text-[var(--text-secondary)]">
                        💡 {finding.recommendation}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Findings Message */}
        {findings.length === 0 && (
          <div className="mt-6 p-6 bg-[var(--neon-green)]/10 border border-[var(--neon-green)]/30 rounded-lg text-center">
            <div className="text-4xl mb-2">✓</div>
            <h4 className="font-bold text-[var(--neon-green)] mb-1">No high-risk findings detected</h4>
            <p className="text-sm text-[var(--text-muted)] font-['Rajdhani']">
              This lightweight scan did not detect obvious risky patterns
            </p>
          </div>
        )}
      </div>

      {/* Disclaimer Footer */}
      <div className="p-4 border-t border-[var(--border-card)] bg-[var(--bg-tertiary)]">
        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
          <span>⚠️</span>
          <span>
            This report is based on static analysis. Not a full security audit.
          </span>
        </div>
      </div>
    </div>
  );
}

// Export the decision function for use in other components
export { getScanDecision };
