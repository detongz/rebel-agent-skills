/**
 * API Server for MySkills Sandbox Security Scanner
 * Express server that exposes scanning endpoints
 */

import express, { Request, Response } from 'express';
import cors from 'cors';
import { SandboxSecurityScanner, ScanOptions, ScanResult } from './index.js';

const app = express();
const PORT = process.env.PORT || 3001;
const scanner = new SandboxSecurityScanner();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.text({ type: 'text/plain', limit: '10mb' }));

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'myskills-sandbox-scanner', version: '1.0.0' });
});

// Main scan endpoint
app.post('/api/scan', async (req: Request, res: Response) => {
  try {
    const { agentCode, agentId, packageJson, verifyType, ...options } = req.body;

    if (!agentCode) {
      return res.status(400).json({
        error: 'Missing required field: agentCode'
      });
    }

    // Build scan options based on verify type
    const scanOptions: ScanOptions = {
      agentCode,
      agentId: agentId || 'unknown',
      packageJson,
      language: options.language || 'javascript',
      enableCodeScan: true,
      enableBehaviorScan: verifyType !== 'code' && verifyType !== 'privacy',
      enablePrivacyScan: verifyType !== 'code' && verifyType !== 'behavior',
      timeout: options.timeout || 30000
    };

    // Run scan
    const result = await scanner.scan(scanOptions);

    res.json(result);

  } catch (error) {
    console.error('Scan error:', error);
    res.status(500).json({
      error: 'Scan failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Quick scan endpoint (code only)
app.post('/api/scan/quick', async (req: Request, res: Response) => {
  try {
    const { agentCode, agentId } = req.body;

    if (!agentCode) {
      return res.status(400).json({
        error: 'Missing required field: agentCode'
      });
    }

    const result = await scanner.quickScan({
      agentCode,
      agentId: agentId || 'unknown',
      language: 'javascript'
    });

    res.json(result);

  } catch (error) {
    console.error('Quick scan error:', error);
    res.status(500).json({
      error: 'Quick scan failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Download report endpoint
app.post('/api/report', async (req: Request, res: Response) => {
  try {
    const { result } = req.body;

    if (!result) {
      return res.status(400).json({
        error: 'Missing scan result'
      });
    }

    // Generate text report
    const report = generateTextReport(result);

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', 'attachment; filename="security-report.txt"');
    res.send(report);

  } catch (error) {
    console.error('Report generation error:', error);
    res.status(500).json({
      error: 'Report generation failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

function generateTextReport(result: ScanResult): string {
  const lines: string[] = [];

  lines.push('MySkills Security Verification Report');
  lines.push('=====================================');
  lines.push('');
  lines.push(`Agent ID: ${result.agentId}`);
  lines.push(`Verification Date: ${result.timestamp}`);
  lines.push(`Verification Type: Comprehensive Security Audit`);
  lines.push('');
  lines.push(`OVERALL SCORE: ${result.overallScore}/100 (${result.riskLevel.toUpperCase()})`);
  lines.push('');

  // Code Security
  lines.push('---');
  lines.push('CODE SECURITY');
  lines.push('---');
  lines.push(`Score: ${result.categories.codeSecurity.score}/100`);

  for (const issue of result.categories.codeSecurity.issues) {
    lines.push('');
    lines.push(`[${issue.level.toUpperCase()}] ${issue.title}`);
    lines.push(`  ${issue.description}`);
    if (issue.location) {
      lines.push(`  Location: ${issue.location.file}:${issue.location.line}`);
    }
    if (issue.recommendation) {
      lines.push(`  Recommendation: ${issue.recommendation}`);
    }
  }
  lines.push('');

  // Behavior Sandbox
  lines.push('---');
  lines.push('BEHAVIOR SANDBOX');
  lines.push('---');
  lines.push(`Score: ${result.categories.behaviorSandbox.score}/100`);

  for (const check of result.categories.behaviorSandbox.checks) {
    const status = check.passed ? '✓' : '⚠';
    lines.push(`${status} ${check.name}: ${check.details}`);
  }

  for (const issue of result.categories.behaviorSandbox.issues) {
    lines.push('');
    lines.push(`[${issue.level.toUpperCase()}] ${issue.title}`);
    lines.push(`  ${issue.description}`);
    if (issue.evidence) {
      lines.push(`  Evidence: ${issue.evidence}`);
    }
    if (issue.recommendation) {
      lines.push(`  Recommendation: ${issue.recommendation}`);
    }
  }
  lines.push('');

  // Privacy Audit
  lines.push('---');
  lines.push('PRIVACY AUDIT');
  lines.push('---');
  lines.push(`Score: ${result.categories.privacyAudit.score}/100`);

  for (const check of result.categories.privacyAudit.checks) {
    const status = check.passed ? '✓' : '⚠';
    lines.push(`${status} ${check.name}: ${check.details}`);
  }

  for (const issue of result.categories.privacyAudit.issues) {
    lines.push('');
    lines.push(`[${issue.level.toUpperCase()}] ${issue.title}`);
    lines.push(`  ${issue.description}`);
    if (issue.recommendation) {
      lines.push(`  Recommendation: ${issue.recommendation}`);
    }
  }
  lines.push('');

  // Summary
  lines.push('---');
  lines.push('SUMMARY');
  lines.push('---');
  lines.push(`Total Issues: ${result.summary.totalIssues}`);
  lines.push(`Critical: ${result.summary.criticalIssues}`);
  lines.push(`High: ${result.summary.highIssues}`);
  lines.push(`Medium: ${result.summary.mediumIssues}`);
  lines.push(`Low: ${result.summary.lowIssues}`);
  lines.push('');

  // Recommendations
  if (result.recommendations.length > 0) {
    lines.push('---');
    lines.push('RECOMMENDATIONS');
    lines.push('---');
    result.recommendations.forEach((rec, i) => {
      lines.push(`${i + 1}. ${rec}`);
    });
    lines.push('');
  }

  lines.push('---');
  lines.push('Generated by MySkills Sandbox');
  lines.push('Powered by Monad Blockchain');

  return lines.join('\n');
}

// Start server
app.listen(PORT, () => {
  console.log(`MySkills Sandbox Scanner API running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Scan endpoint: http://localhost:${PORT}/api/scan`);
});

export { app };
