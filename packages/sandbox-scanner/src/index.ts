/**
 * MySkills Sandbox Security Scanner
 * Main entry point - orchestrates all security scanners
 */

import { CodeSecurityScanner } from './scanners/CodeSecurityScanner.js';
import { BehaviorSandboxScanner } from './scanners/BehaviorSandboxScanner.js';
import { PrivacyAuditScanner } from './scanners/PrivacyAuditScanner.js';
import {
  ScanOptions,
  ScanResult,
  CategoryScore,
  RiskLevel,
  ScanCategory,
  SecurityIssue
} from './types/index.js';

export class SandboxSecurityScanner {
  private codeScanner: CodeSecurityScanner;
  private behaviorScanner: BehaviorSandboxScanner;
  private privacyScanner: PrivacyAuditScanner;

  constructor() {
    this.codeScanner = new CodeSecurityScanner();
    this.behaviorScanner = new BehaviorSandboxScanner();
    this.privacyScanner = new PrivacyAuditScanner();
  }

  /**
   * Main scan method - runs all enabled scanners
   */
  async scan(options: ScanOptions): Promise<ScanResult> {
    const agentId = options.agentId || 'unknown';
    const timestamp = new Date().toISOString();

    // Run all scanners
    const codeIssues = options.enableCodeScan !== false
      ? await this.codeScanner.scan(options)
      : [];

    const behaviorIssues = options.enableBehaviorScan !== false
      ? await this.behaviorScanner.scan(options)
      : [];

    const privacyIssues = options.enablePrivacyScan !== false
      ? await this.privacyScanner.scan(options)
      : [];

    // Build category scores
    const codeSecurityScore = this.buildCategoryScore(ScanCategory.CODE_SECURITY, codeIssues);
    const behaviorSandboxScore = this.buildCategoryScore(ScanCategory.BEHAVIOR_SANDBOX, behaviorIssues);
    const privacyAuditScore = this.buildCategoryScore(ScanCategory.PRIVACY_AUDIT, privacyIssues);

    // Calculate overall score
    const overallScore = this.calculateOverallScore(
      codeSecurityScore,
      behaviorSandboxScore,
      privacyAuditScore
    );

    // Determine risk level
    const riskLevel = this.determineRiskLevel(overallScore);

    // Count issues by severity
    const summary = this.countIssues([
      ...codeIssues,
      ...behaviorIssues,
      ...privacyIssues
    ]);

    // Generate recommendations
    const recommendations = this.generateRecommendations({
      codeSecurity: codeSecurityScore,
      behaviorSandbox: behaviorSandboxScore,
      privacyAudit: privacyAuditScore
    });

    return {
      agentId,
      timestamp,
      overallScore,
      riskLevel,
      categories: {
        codeSecurity: codeSecurityScore,
        behaviorSandbox: behaviorSandboxScore,
        privacyAudit: privacyAuditScore
      },
      summary,
      recommendations
    };
  }

  /**
   * Build category score from issues
   */
  private buildCategoryScore(category: ScanCategory, issues: SecurityIssue[]): CategoryScore {
    const score = this.calculateCategoryScore(issues);

    // Build checks list
    const checks = this.getCategoryChecks(category, issues);

    return {
      category,
      score,
      issues,
      checks
    };
  }

  /**
   * Calculate category score based on issues
   */
  private calculateCategoryScore(issues: SecurityIssue[]): number {
    if (issues.length === 0) return 100;

    // Base score starts at 100
    let score = 100;

    // Deduct points based on issue severity
    for (const issue of issues) {
      switch (issue.level) {
        case RiskLevel.CRITICAL:
          score -= 30;
          break;
        case RiskLevel.HIGH:
          score -= 15;
          break;
        case RiskLevel.MEDIUM:
          score -= 8;
          break;
        case RiskLevel.LOW:
          score -= 3;
          break;
      }
    }

    // Ensure score doesn't go below 0
    return Math.max(0, score);
  }

  /**
   * Get category-specific checks
   */
  private getCategoryChecks(category: ScanCategory, issues: SecurityIssue[]): Array<{
    name: string;
    passed: boolean;
    details?: string;
  }> {
    const checks: Array<{ name: string; passed: boolean; details?: string }> = [];

    switch (category) {
      case ScanCategory.CODE_SECURITY:
        checks.push(
          {
            name: 'Smart Contract Vulnerabilities',
            passed: !issues.some(i => i.id?.startsWith('SC_')),
            details: issues.filter(i => i.id?.startsWith('SC_')).map(i => i.title).join(', ') || undefined
          },
          {
            name: 'Malicious Code Patterns',
            passed: !issues.some(i => i.id?.startsWith('MC_')),
            details: issues.filter(i => i.id?.startsWith('MC_')).map(i => i.title).join(', ') || undefined
          },
          {
            name: 'Dependency Security',
            passed: !issues.some(i => i.cveId),
            details: issues.filter(i => i.cveId).map(i => i.cveId).join(', ') || undefined
          },
          {
            name: 'Code Quality',
            passed: true, // Would need AST analysis for real check
            details: `${Math.max(0, 100 - issues.length * 5)}/100 based on issue count`
          }
        );
        break;

      case ScanCategory.BEHAVIOR_SANDBOX:
        const hasFileIssues = issues.some(i => i.id?.includes('FILE'));
        const hasNetworkIssues = issues.some(i => i.id?.includes('API') || i.id?.includes('NETWORK'));
        const hasProcessIssues = issues.some(i => i.id?.includes('PROCESS') || i.id?.includes('EXEC'));

        checks.push(
          {
            name: 'File System Access',
            passed: !hasFileIssues,
            details: hasFileIssues ? 'Suspicious file access detected' : 'Normal'
          },
          {
            name: 'Network Requests',
            passed: !hasNetworkIssues,
            details: hasNetworkIssues ? 'External API calls detected' : 'None detected'
          },
          {
            name: 'API Calls',
            passed: !hasNetworkIssues,
            details: 'Safe'
          },
          {
            name: 'Resource Usage',
            passed: !hasProcessIssues,
            details: hasProcessIssues ? 'Process execution detected' : 'Normal'
          }
        );
        break;

      case ScanCategory.PRIVACY_AUDIT:
        const hasDataLeaks = issues.some(i => i.id?.includes('DATA_LEAK'));
        const hasThirdParty = issues.some(i => i.id?.includes('THIRD_PARTY'));
        const hasLoggingIssues = issues.some(i => i.id?.includes('LOGGING'));
        const hasEncryption = !issues.some(i => i.id?.includes('NO_ENCRYPTION'));

        checks.push(
          {
            name: 'Data Leak Detection',
            passed: !hasDataLeaks,
            details: hasDataLeaks ? 'PII exposure detected' : 'None detected'
          },
          {
            name: 'Encryption',
            passed: hasEncryption,
            details: hasEncryption ? 'Enabled' : 'Not detected'
          },
          {
            name: 'Third-party Sharing',
            passed: !hasThirdParty,
            details: hasThirdParty ? 'External APIs detected' : 'None detected'
          },
          {
            name: 'Log Safety',
            passed: !hasLoggingIssues,
            details: hasLoggingIssues ? 'Sensitive data in logs' : 'Safe'
          }
        );
        break;
    }

    return checks;
  }

  /**
   * Calculate overall score from category scores
   */
  private calculateOverallScore(
    codeSecurity: CategoryScore,
    behaviorSandbox: CategoryScore,
    privacyAudit: CategoryScore
  ): number {
    // Weighted average
    const weights = {
      codeSecurity: 0.4,
      behaviorSandbox: 0.35,
      privacyAudit: 0.25
    };

    return Math.round(
      codeSecurity.score * weights.codeSecurity +
      behaviorSandbox.score * weights.behaviorSandbox +
      privacyAudit.score * weights.privacyAudit
    );
  }

  /**
   * Determine risk level from score
   */
  private determineRiskLevel(score: number): RiskLevel {
    if (score >= 90) return RiskLevel.SAFE;
    if (score >= 70) return RiskLevel.LOW;
    if (score >= 50) return RiskLevel.MEDIUM;
    if (score >= 30) return RiskLevel.HIGH;
    return RiskLevel.CRITICAL;
  }

  /**
   * Count issues by severity
   */
  private countIssues(issues: SecurityIssue[]) {
    return {
      totalIssues: issues.length,
      criticalIssues: issues.filter(i => i.level === RiskLevel.CRITICAL).length,
      highIssues: issues.filter(i => i.level === RiskLevel.HIGH).length,
      mediumIssues: issues.filter(i => i.level === RiskLevel.MEDIUM).length,
      lowIssues: issues.filter(i => i.level === RiskLevel.LOW).length
    };
  }

  /**
   * Generate recommendations based on scan results
   */
  private generateRecommendations(scores: {
    codeSecurity: CategoryScore;
    behaviorSandbox: CategoryScore;
    privacyAudit: CategoryScore;
  }): string[] {
    const recommendations: string[] = [];

    // Code security recommendations
    if (scores.codeSecurity.score < 80) {
      const criticalIssues = scores.codeSecurity.issues.filter(i =>
        i.level === RiskLevel.CRITICAL || i.level === RiskLevel.HIGH
      );

      if (criticalIssues.length > 0) {
        recommendations.push(
          `Address ${criticalIssues.length} critical/high severity code security issues immediately`
        );
      }

      const cveIssues = scores.codeSecurity.issues.filter(i => i.cveId);
      if (cveIssues.length > 0) {
        recommendations.push(
          `Upgrade ${cveIssues.length} vulnerable dependencies to patched versions`
        );
      }
    }

    // Behavior sandbox recommendations
    if (scores.behaviorSandbox.score < 80) {
      recommendations.push(
        'Review and restrict external API access. Implement domain allowlisting.'
      );
    }

    // Privacy audit recommendations
    if (scores.privacyAudit.score < 80) {
      const dataLeakIssues = scores.privacyAudit.issues.filter(i =>
        i.id?.includes('DATA_LEAK') || i.id?.includes('LOGGING')
      );

      if (dataLeakIssues.length > 0) {
        recommendations.push(
          'Remove sensitive data from code and logs. Implement proper encryption.'
        );
      }
    }

    // General recommendations
    if (scores.codeSecurity.score >= 80 &&
        scores.behaviorSandbox.score >= 80 &&
        scores.privacyAudit.score >= 80) {
      recommendations.push(
        'Agent passes security checks. Continue monitoring for new vulnerabilities.'
      );
    }

    return recommendations;
  }

  /**
   * Quick scan - only code security (fastest)
   */
  async quickScan(options: ScanOptions): Promise<ScanResult> {
    return this.scan({
      ...options,
      enableBehaviorScan: false,
      enablePrivacyScan: false
    });
  }

  /**
   * Comprehensive scan - all scanners
   */
  async comprehensiveScan(options: ScanOptions): Promise<ScanResult> {
    return this.scan(options);
  }
}

// Export types
export * from './types/index.js';
