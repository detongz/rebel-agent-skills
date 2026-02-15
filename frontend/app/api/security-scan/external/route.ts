/**
 * API Route: /api/security-scan/external
 *
 * POST: Bridge to external skill-security-scan API
 *
 * This endpoint acts as a bridge between demo-moltiverse and the external
 * skill-security-scan service, enabling security scanning of skill repositories.
 */

import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import db from '@/lib/db';

// Environment variables for external API
const EXTERNAL_SCAN_API_URL = process.env.SKILL_SCAN_API_URL || 'https://skill-security-scan.vercel.app';
const EXTERNAL_SCAN_API_KEY = process.env.SKILL_SCAN_API_KEY || '';
const EXTERNAL_TIMEOUT_MS = 12000;

interface ExternalScanRequest {
  repo_url: string;
  scan_type?: 'github' | 'npm' | 'solidity';
  skill_id?: string;
}

interface ExternalScanResponse {
  success: boolean;
  data?: {
    scanId: string;
    status: string;
    report?: any;
  };
  error?: string;
  message?: string;
}

interface ScanJob {
  id: string;
  scan_id: string;
  repo_url: string;
  scan_type: string;
  skill_id?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
  result?: any;
  error_message?: string;
}

// Initialize scan_jobs table if not exists
function initScanJobsTable() {
  const tableExists = db.prepare(`
    SELECT name FROM sqlite_master
    WHERE type='table' AND name='scan_jobs'
  `).get();

  if (!tableExists) {
    db.exec(`
      CREATE TABLE IF NOT EXISTS scan_jobs (
        id TEXT PRIMARY KEY,
        scan_id TEXT NOT NULL UNIQUE,
        repo_url TEXT NOT NULL,
        scan_type TEXT NOT NULL,
        skill_id TEXT,
        status TEXT DEFAULT 'pending',
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        result JSON,
        error_message TEXT
      );

      CREATE INDEX IF NOT EXISTS idx_scan_jobs_status ON scan_jobs(status);
      CREATE INDEX IF NOT EXISTS idx_scan_jobs_scan_id ON scan_jobs(scan_id);
    `);
    console.log('✅ scan_jobs table created');
  }
}

// Initialize scan_reports table if not exists
function initScanReportsTable() {
  const tableExists = db.prepare(`
    SELECT name FROM sqlite_master
    WHERE type='table' AND name='scan_reports'
  `).get();

  if (!tableExists) {
    db.exec(`
      CREATE TABLE IF NOT EXISTS scan_reports (
        id TEXT PRIMARY KEY,
        scan_id TEXT NOT NULL UNIQUE,
        repo_url TEXT NOT NULL,
        overall_score INTEGER,
        security_grade TEXT,
        findings_count INTEGER,
        code_quality_score INTEGER,
        dependency_score INTEGER,
        documentation_score INTEGER,
        license_compliance TEXT,
        report_data JSON,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );

      CREATE INDEX IF NOT EXISTS idx_scan_reports_scan_id ON scan_reports(scan_id);
      CREATE INDEX IF NOT EXISTS idx_scan_reports_score ON scan_reports(overall_score);
    `);
    console.log('✅ scan_reports table created');
  }
}

// Initialize tables on module load
initScanJobsTable();
initScanReportsTable();

// POST - Create new external scan
export async function POST(request: NextRequest) {
  const jobId = randomUUID();

  try {
    const body = await request.json();
    const { repo_url, scan_type = 'github', skill_id } = body as ExternalScanRequest;

    if (!repo_url) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: repo_url' },
        { status: 400 }
      );
    }

    // Validate repo_url format
    try {
      new URL(repo_url);
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid repo_url format' },
        { status: 400 }
      );
    }

    // Check API key for authentication
    const apiKey = request.headers.get('x-api-key');
    if (EXTERNAL_SCAN_API_KEY && apiKey !== EXTERNAL_SCAN_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Call external API
    const externalUrl = `${EXTERNAL_SCAN_API_URL}/api/scan`;
    let scanId: string;
    let scanResult: any;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), EXTERNAL_TIMEOUT_MS);
      const response = await fetch(externalUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (compatible; MySkillsScanBridge/1.0)',
          'Referer': `${EXTERNAL_SCAN_API_URL}/scan`,
          'Origin': EXTERNAL_SCAN_API_URL,
          ...(EXTERNAL_SCAN_API_KEY && { 'Authorization': `Bearer ${EXTERNAL_SCAN_API_KEY}` }),
        },
        body: JSON.stringify({ repoUrl: repo_url }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API request failed: ${response.status}`);
      }

      const data = await response.json();
      scanId = data.scanId;
      scanResult = data;

      // Try to fetch full report payload for richer local report/poster rendering.
      try {
        const detailResponse = await fetch(`${EXTERNAL_SCAN_API_URL}/api/scan/${scanId}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            ...(EXTERNAL_SCAN_API_KEY && { 'Authorization': `Bearer ${EXTERNAL_SCAN_API_KEY}` }),
          },
          signal: controller.signal,
        });
        if (detailResponse.ok) {
          const detail = await detailResponse.json();
          scanResult = detail?.data || detail;
        }
      } catch (detailError) {
        console.warn('Failed to fetch external detailed report, fallback to initial response:', detailError);
      }

    } catch (error) {
      // If external API fails, fall back to internal scan
      console.log('External API unavailable, using internal scan fallback');

      // Use production URL or fallback to request origin
      const baseUrl = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : process.env.NEXT_PUBLIC_SITE_URL || 'https://myskills.info';

      const internalResponse = await fetch(`${baseUrl}/api/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: repo_url }),
      });

      if (!internalResponse.ok) {
        throw new Error('Both external and internal scan APIs failed');
      }

      const internalData = await internalResponse.json();
      scanId = internalData.data?.id || randomUUID();
      scanResult = internalData.data;
    }

    // Create scan job record
    const scanJob: ScanJob = {
      id: jobId,
      scan_id: scanId,
      repo_url,
      scan_type,
      skill_id,
      status: 'completed',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      result: scanResult,
    };

    db.prepare(`
      INSERT INTO scan_jobs (id, scan_id, repo_url, scan_type, skill_id, status, result, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      jobId,
      scanId,
      repo_url,
      scan_type,
      skill_id || null,
      'completed',
      JSON.stringify(scanResult),
      new Date().toISOString(),
      new Date().toISOString()
    );

    // Create scan report record
    const score = scanResult.score || scanResult.data?.score || 0;
    const status = scanResult.status || scanResult.data?.status || 'unknown';

    db.prepare(`
      INSERT INTO scan_reports (
        id, scan_id, repo_url, overall_score, security_grade,
        findings_count, report_data, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      randomUUID(),
      scanId,
      repo_url,
      score,
      status,
      scanResult.vulnerabilities || scanResult.warnings?.length || 0,
      JSON.stringify(scanResult),
      new Date().toISOString(),
      new Date().toISOString()
    );

    return NextResponse.json({
      success: true,
      data: {
        job_id: jobId,
        scan_id: scanId,
        status: 'completed',
        result: scanResult,
      },
      message: 'Security scan completed successfully',
    });

  } catch (error) {
    console.error('Scan error:', error);

    // Update job status to failed
    if (jobId) {
      db.prepare(`
        UPDATE scan_jobs
        SET status = 'failed', error_message = ?, updated_at = ?
        WHERE id = ?
      `).run(
        error instanceof Error ? error.message : 'Unknown error',
        new Date().toISOString(),
        jobId
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to complete security scan',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// GET - Get scan status or list recent scans
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const scanId = searchParams.get('scan_id');
  const jobId = searchParams.get('job_id');

  if (scanId) {
    const scan = db.prepare(`
      SELECT * FROM scan_reports WHERE scan_id = ?
    `).get(scanId);

    if (!scan) {
      return NextResponse.json(
        { success: false, error: 'Scan not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: scan });
  }

  if (jobId) {
    const job = db.prepare(`
      SELECT * FROM scan_jobs WHERE id = ?
    `).get(jobId);

    if (!job) {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: job });
  }

  // List all recent scans
  const scans = db.prepare(`
    SELECT * FROM scan_reports
    ORDER BY created_at DESC
    LIMIT 20
  `).all();

  return NextResponse.json({
    success: true,
    data: scans,
    count: scans.length,
  });
}
