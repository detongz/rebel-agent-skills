'use client';

import styles from './SecurityBadge.module.css';

export type SecurityStatus = 'safe' | 'warning' | 'danger' | 'unscanned';

interface SecurityBadgeProps {
  status: SecurityStatus;
  scannedAt?: string | null;
  className?: string;
}

export default function SecurityBadge({
  status,
  scannedAt,
  className = ''
}: SecurityBadgeProps) {
  const getStatusDisplay = () => {
    switch (status) {
      case 'safe':
        return {
          icon: '✓',
          text: 'Scanned',
          className: styles.safe
        };
      case 'warning':
        return {
          icon: '⚠',
          text: 'Risks',
          className: styles.warning
        };
      case 'danger':
        return {
          icon: '✕',
          text: 'Danger',
          className: styles.danger
        };
      case 'unscanned':
      default:
        return {
          icon: '?',
          text: 'Unscanned',
          className: styles.unscanned
        };
    }
  };

  const display = getStatusDisplay();

  return (
    <div
      className={`${styles.badge} ${display.className} ${className}`}
      title={scannedAt ? `Scanned: ${new Date(scannedAt).toLocaleString('en-US')}` : undefined}
    >
      <span className={styles.icon}>{display.icon}</span>
      <span className={styles.text}>{display.text}</span>
    </div>
  );
}
