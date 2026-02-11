/**
 * API Route: /api/scan
 *
 * POST: Security scan a skill repository
 *
 * Unified security scanning for both frontend and CLI
 * - Free tier: grep + npm audit
 * - Paid tier: VirusTotal API (TODO: product manager to implement)
 */

import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { randomUUID } from 'crypto';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

interface DependencyInfo {
  name: string;
  version: string;
  type: 'runtime' | 'development' | 'peer' | 'unknown';
  isSkill?: boolean;
}

interface ScanResult {
  id: string;
  url: string;
  score: number;
  status: 'safe' | 'warning' | 'danger';
  vulnerabilities: number;
  warnings: string[];
  details: {
    codeAnalysis: {
      score: number;
      findings: string[];
    };
    dependencyCheck: {
      score: number;
      warnings: string[];
      dependencies?: DependencyInfo[];
    };
  };
  dependencies?: DependencyInfo[];
  createdAt: string;
}

interface ScanOptions {
  full?: boolean;
  output?: 'text' | 'json';
}

// Cache for recent scans (in production, use Redis)
const scanCache = new Map<string, ScanResult>();

async function fetchRepo(url: string): Promise<string> {
  const scanId = randomUUID();
  const tempDir = path.join(process.cwd(), 'data', 'scans', scanId);

  await fs.mkdir(tempDir, { recursive: true });

  try {
    await execAsync(`git clone --depth 1 ${url} ${tempDir}`, { timeout: 60000 });
    return tempDir;
  } catch (error) {
    throw new Error(`Failed to clone repository: ${error}`);
  }
}

async function analyzeCode(dir: string): Promise<{ score: number; findings: string[] }> {
  const findings: string[] = [];
  let score = 100;

  try {
    // Search for dangerous patterns
    const { stdout } = await execAsync(
      `grep -r -i "eval\\|exec\\|spawn\\|child_process\\|require(" ${dir} 2>/dev/null || echo ""`,
      { timeout: 10000 }
    );

    if (stdout.trim()) {
      const matches = stdout.trim().split('\n').length;
      findings.push(`Found ${matches} potentially dangerous code execution patterns`);
      score -= matches * 10;
    }

    // Check for private keys or secrets
    const { stdout: secretOutput } = await execAsync(
      `grep -r -i "private_key\\|api_key\\|secret.*=" ${dir} 2>/dev/null || echo ""`,
      { timeout: 10000 }
    );

    if (secretOutput.trim()) {
      findings.push('Found potential hardcoded secrets');
      score -= 20;
    }

  } catch (error) {
    // grep failed, continue
  }

  return {
    score: Math.max(0, score),
    findings,
  };
}

async function checkDependencies(dir: string): Promise<{
  score: number;
  warnings: string[];
  dependencies?: DependencyInfo[];
}> {
  const warnings: string[] = [];
  let score = 100;
  const dependencies: DependencyInfo[] = [];

  const packageJsonPath = path.join(dir, 'package.json');

  try {
    const exists = await fs.access(packageJsonPath).then(() => true).catch(() => false);

    if (!exists) {
      return { score: 50, warnings: ['No package.json found'], dependencies: [] };
    }

    // Read and parse package.json
    const packageJsonContent = await fs.readFile(packageJsonPath, 'utf-8');
    const packageJson = JSON.parse(packageJsonContent);

    // Extract dependencies
    const allDeps = {
      ...packageJson.dependencies || {},
      ...packageJson.devDependencies || {},
      ...packageJson.peerDependencies || {},
    };

    // Categorize dependencies
    for (const [name, version] of Object.entries(allDeps)) {
      const depInfo: DependencyInfo = {
        name,
        version: version as string,
        type: packageJson.dependencies?.[name] ? 'runtime' :
              packageJson.devDependencies?.[name] ? 'development' :
              packageJson.peerDependencies?.[name] ? 'peer' : 'unknown',
      };

      // Check if this is a known skill package
      if (isKnownSkillPackage(name)) {
        depInfo.isSkill = true;
        dependencies.push(depInfo);
      } else {
        dependencies.push(depInfo);
      }
    }

    // Run npm audit
    try {
      const { stdout } = await execAsync(`cd ${dir} && npm audit --json`, { timeout: 30000 });

      if (stdout.includes('vulnerabilities')) {
        const match = stdout.match(/"vulnerabilities":\s*(\d+)/);
        if (match) {
          const vulnCount = parseInt(match[1]);
          if (vulnCount > 0) {
            warnings.push(`${vulnCount} known vulnerabilities in dependencies`);
            score -= Math.min(vulnCount * 5, 50);
          }
        }
      }
    } catch (auditError) {
      warnings.push('Could not run npm audit');
    }

  } catch (error) {
    // Continue with default score
  }

  return {
    score: Math.max(0, score),
    warnings,
    dependencies,
  };
}

// Known skill packages that can be other agent skills
const KNOWN_SKILL_PACKAGES = [
  // MCP Server packages
  '@modelcontextprotocol/server',
  '@modelcontextprotocol/inspector',

  // Agent framework packages
  'langchain',
  '@langchain/core',
  'openai',
  '@anthropic-ai/sdk',

  // Agent skill patterns (heuristic)
  /^agent-/,
  /^skill-/,
  /^claude-/,
  /^openai-/,
];

function isKnownSkillPackage(packageName: string): boolean {
  return KNOWN_SKILL_PACKAGES.some(pattern =>
    typeof pattern === 'string'
      ? packageName === pattern || packageName.startsWith(pattern + '/')
      : pattern.test(packageName)
  );
}

async function cleanupTempDir(dir: string) {
  try {
    await fs.rm(dir, { recursive: true, force: true });
  } catch {
    // Ignore cleanup errors
  }
}

// POST - Run security scan
export async function POST(request: NextRequest) {
  const scanId = randomUUID();

  try {
    const body = await request.json();
    const { url, full = false, output = 'json' } = body as { url: string; full?: boolean; output?: 'text' | 'json' };

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: url' },
        { status: 400 }
      );
    }

    // Check cache first
    const cacheKey = `${url}-${full}`;
    if (scanCache.has(cacheKey)) {
      const cached = scanCache.get(cacheKey)!;
      return NextResponse.json({
        success: true,
        data: cached,
        cached: true,
      });
    }

    // 1. Clone or fetch the repo
    const tempDir = await fetchRepo(url);

    // 2. Basic code analysis
    const codeAnalysis = await analyzeCode(tempDir);

    // 3. Dependency check
    const depCheck = await checkDependencies(tempDir);

    // Cleanup
    await cleanupTempDir(tempDir);

    // Calculate overall score
    const score = Math.round((codeAnalysis.score + depCheck.score) / 2);
    const status = score >= 90 ? 'safe' : score >= 70 ? 'warning' : 'danger';

    const result: ScanResult = {
      id: scanId,
      url,
      score,
      status,
      vulnerabilities: codeAnalysis.findings.length + depCheck.warnings.length,
      warnings: [...codeAnalysis.findings, ...depCheck.warnings],
      details: {
        codeAnalysis,
        dependencyCheck: depCheck,
      },
      dependencies: depCheck.dependencies,
      createdAt: new Date().toISOString(),
    };

    // Cache for 5 minutes
    scanCache.set(cacheKey, result);
    setTimeout(() => scanCache.delete(cacheKey), 5 * 60 * 1000);

    // If full scan requested, return pricing info
    // TODO: Product manager to implement VirusTotal integration
    if (full) {
      return NextResponse.json({
        success: true,
        data: result,
        fullScan: {
          available: false,
          message: 'Deep scanning with VirusTotal API coming soon',
          estimatedCost: '$0.01-0.05',
          features: [
            'VirusTotal API integration',
            'Full vulnerability database',
            'Sandbox execution analysis',
            'Professional security report',
          ],
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: result,
    });

  } catch (error) {
    console.error('Scan error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to scan repository',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// GET - Get recent scan results
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (url) {
    const cacheKey = `${url}-false`;
    const cached = scanCache.get(cacheKey);
    if (cached) {
      return NextResponse.json({
        success: true,
        data: cached,
      });
    }
    return NextResponse.json(
      { success: false, error: 'No recent scan found for this URL' },
      { status: 404 }
    );
  }

  // Return all cached scans
  return NextResponse.json({
    success: true,
    data: Array.from(scanCache.values()),
    count: scanCache.size,
  });
}
