'use client';

import styles from './SecuritySection.module.css';

export type SecurityStatus = 'safe' | 'warning' | 'danger' | 'unscanned';

export type RiskFactor = 'scripts' | 'network' | 'filesystem' | 'env_access' | 'external_commands';

export interface BasicSecurityReport {
  status: SecurityStatus;
  riskLevel: 'safe' | 'low' | 'medium' | 'high' | 'critical';
  scannedAt: string | null;
  commitHash: string | null;
  riskFactors: Record<RiskFactor, boolean>;
  summary: string;
}

interface SecuritySectionProps {
  security: BasicSecurityReport | null;
  repository?: string;
}

export default function SecuritySection({ security, repository }: SecuritySectionProps) {
  const isScanned = security && security.status !== 'unscanned';

  const getStatusConfig = () => {
    if (!security || security.status === 'unscanned') {
      return {
        icon: '?',
        label: 'UNSCANNED',
        color: 'var(--text-muted)',
        bg: 'rgba(136, 136, 136, 0.1)',
        border: 'rgba(136, 136, 136, 0.2)'
      };
    }

    switch (security.status) {
      case 'safe':
        return {
          icon: '✓',
          label: 'SAFE',
          color: 'var(--neon-green)',
          bg: 'rgba(0, 255, 136, 0.1)',
          border: 'rgba(0, 255, 136, 0.3)'
        };
      case 'warning':
        return {
          icon: '⚠',
          label: 'WARNING',
          color: 'var(--warning-orange)',
          bg: 'rgba(255, 102, 0, 0.1)',
          border: 'rgba(255, 102, 0, 0.3)'
        };
      case 'danger':
        return {
          icon: '✕',
          label: 'DANGER',
          color: '#ff4444',
          bg: 'rgba(255, 0, 0, 0.1)',
          border: 'rgba(255, 0, 0, 0.3)'
        };
      default:
        return {
          icon: '?',
          label: 'UNKNOWN',
          color: 'var(--text-muted)',
          bg: 'rgba(136, 136, 136, 0.1)',
          border: 'rgba(136, 136, 136, 0.2)'
        };
    }
  };

  const config = getStatusConfig();

  const riskFactorLabels: Record<RiskFactor, { label: string; icon: string }> = {
    scripts: { label: 'Scripts', icon: '📜' },
    network: { label: 'Network', icon: '🌐' },
    filesystem: { label: 'Filesystem', icon: '📁' },
    env_access: { label: 'Env Access', icon: '🔐' },
    external_commands: { label: 'Commands', icon: '⚡' }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.headerIcon}>🛡️</span>
          <div>
            <h3 className={styles.title}>Security Status</h3>
            <p className={styles.subtitle}>Basic Scan (Free)</p>
          </div>
        </div>
        <div
          className={styles.statusBadge}
          style={{
            background: config.bg,
            borderColor: config.border,
            color: config.color
          }}
        >
          <span className={styles.statusIcon}>{config.icon}</span>
          <span>{config.label}</span>
        </div>
      </div>

      {isScanned ? (
        <>
          {/* Scanned Info */}
          <div className={styles.scannedInfo}>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Scanned At</span>
              <span className={styles.infoValue}>
                {security.scannedAt
                  ? new Date(security.scannedAt).toLocaleString('en-US')
                  : '-'}
              </span>
            </div>
            {security.commitHash && (
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Commit</span>
                <span className={styles.infoValueMono}>
                  {security.commitHash.slice(0, 7)}
                </span>
              </div>
            )}
            {security.summary && (
              <p className={styles.summary}>{security.summary}</p>
            )}
          </div>

          {/* Risk Factors */}
          <div className={styles.riskFactors}>
            <p className={styles.riskFactorsLabel}>Risk Factors Detected</p>
            <div className={styles.riskFactorsGrid}>
              {(Object.entries(riskFactorLabels) as [RiskFactor, { label: string; icon: string }][]).map(([key, { label, icon }]) => {
                const hasRisk = security.riskFactors?.[key];
                return (
                  <div
                    key={key}
                    className={`${styles.riskFactor} ${hasRisk ? styles.riskDetected : styles.riskClear}`}
                  >
                    <span className={styles.riskFactorIcon}>{icon}</span>
                    <span className={styles.riskFactorLabel}>{label}</span>
                    <span className={styles.riskFactorStatus}>
                      {hasRisk ? '⚠' : '✓'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Scan More Link */}
          {repository && (
            <a
              href={`/skill?repo=${encodeURIComponent(repository)}`}
              className={styles.scanMoreLink}
            >
              <span>View Full Report</span>
              <span>→</span>
            </a>
          )}
        </>
      ) : (
        /* Unscanned State */
        <div className={styles.unscannedState}>
          <p className={styles.unscannedText}>
            This skill has not been scanned yet
          </p>
          {repository && (
            <a
              href={`/skill?repo=${encodeURIComponent(repository)}`}
              className={styles.scanButton}
            >
              <span className={styles.scanButtonIcon}>🔍</span>
              <span>Scan Now</span>
            </a>
          )}
        </div>
      )}

      {/* Divider */}
      <div className={styles.divider} />

      {/* Coming Soon Section */}
      <div className={styles.comingSoon}>
        <div className={styles.comingSoonHeader}>
          <span className={styles.comingSoonIcon}>🔬</span>
          <div>
            <h4 className={styles.comingSoonTitle}>Deep Scan</h4>
            <p className={styles.comingSoonBadge}>Coming Soon</p>
          </div>
        </div>

        <div className={styles.advancedFeatures}>
          <div className={styles.advancedFeature}>
            <span className={styles.advancedFeatureIcon}>📦</span>
            <div>
              <p className={styles.advancedFeatureTitle}>Dependency Scan</p>
              <p className={styles.advancedFeatureDesc}>npm/pip vulnerabilities</p>
            </div>
          </div>

          <div className={styles.advancedFeature}>
            <span className={styles.advancedFeatureIcon}>🧪</span>
            <div>
              <p className={styles.advancedFeatureTitle}>Sandbox Testing</p>
              <p className={styles.advancedFeatureDesc}>Dynamic execution</p>
            </div>
          </div>

          <div className={styles.advancedFeature}>
            <span className={styles.advancedFeatureIcon}>🤖</span>
            <div>
              <p className={styles.advancedFeatureTitle}>LLM Evaluation</p>
              <p className={styles.advancedFeatureDesc}>Semantic security</p>
            </div>
          </div>

          <div className={styles.advancedFeature}>
            <span className={styles.advancedFeatureIcon}>📈</span>
            <div>
              <p className={styles.advancedFeatureTitle}>Benchmark Score</p>
              <p className={styles.advancedFeatureDesc}>pass@k metrics</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
