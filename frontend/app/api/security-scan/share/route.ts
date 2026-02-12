/**
 * API Route: /api/security-scan/share
 *
 * POST: Generate shareable link for scan reports
 */

import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import QRCode from 'qrcode';

interface ShareRequest {
  scan_id: string;
}

interface ShareResponse {
  success: boolean;
  data?: {
    shareId: string;
    shareUrl: string;
    qrCode?: string;
    expiresAt: string;
  };
  error?: string;
}

// Initialize scan_shares table
function initScanSharesTable() {
  const db = require('@/lib/db').default;

  const tableExists = db.prepare(`
    SELECT name FROM sqlite_master
    WHERE type='table' AND name='scan_shares'
  `).get();

  if (!tableExists) {
    db.exec(`
      CREATE TABLE IF NOT EXISTS scan_shares (
        id TEXT PRIMARY KEY,
        scan_id TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now'))
      );

      CREATE INDEX IF NOT EXISTS idx_scan_shares_expires ON scan_shares(expires_at);
    `);
    console.log('✅ scan_shares table created');
  }
}

// Initialize on module load
initScanSharesTable();

// POST - Create share link
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as ShareRequest;
    const { scan_id } = body;

    if (!scan_id) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: scan_id' },
        { status: 400 }
      );
    }

    const db = require('@/lib/db').default;

    // Check if scan exists
    const scan = db.prepare(`
      SELECT * FROM scan_reports WHERE scan_id = ?
    `).get(scan_id);

    if (!scan) {
      return NextResponse.json(
        { success: false, error: 'Scan not found' },
        { status: 404 }
      );
    }

    // Generate unique share ID
    const shareId = `scan_${scan_id}_${Date.now()}`;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Save to database
    db.prepare(`
      INSERT INTO scan_shares (id, scan_id, expires_at)
      VALUES (?, ?, ?)
    `).run(shareId, scan_id, expiresAt.toISOString());

    // Generate share URL
    const baseUrl = process.env.NEXT_PUBLIC_SKILL_SCAN_URL || request.nextUrl.origin;
    const shareUrl = `${baseUrl}/scan/report/${scan_id}`;

    // Generate QR code
    let qrCode: string | undefined;
    try {
      qrCode = await QRCode.toDataURL(shareUrl, {
        width: 200,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      });
    } catch (qrError) {
      console.warn('Failed to generate QR code:', qrError);
    }

    return NextResponse.json({
      success: true,
      data: {
        shareId,
        shareUrl,
        qrCode,
        expiresAt: expiresAt.toISOString(),
      },
    } as ShareResponse);

  } catch (error) {
    console.error('Share error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create share link',
      },
      { status: 500 }
    );
  }
}

// GET - Check if share is valid
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const shareId = searchParams.get('share_id');

  if (!shareId) {
    return NextResponse.json(
      { success: false, error: 'Missing share_id parameter' },
      { status: 400 }
    );
  }

  const db = require('@/lib/db').default;

  const share = db.prepare(`
    SELECT * FROM scan_shares
    WHERE id = ? AND expires_at > datetime('now')
  `).get(shareId);

  if (!share) {
    return NextResponse.json(
      { success: false, error: 'Share not found or expired' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: share,
  });
}
