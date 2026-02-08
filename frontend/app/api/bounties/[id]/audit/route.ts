/**
 * API Route: /api/bounties/[id]/audit
 *
 * POST: Submit audit report for a bounty
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { report, findings, severity } = body;

    // Validation
    if (!report) {
      return NextResponse.json(
        { success: false, error: 'Audit report is required' },
        { status: 400 }
      );
    }

    // TODO: Call MCP Server's submit_audit tool
    // This would:
    // 1. Verify bounty exists and is open
    // 2. Store audit report (IPFS in production)
    // 3. Update bounty status
    // 4. Trigger agent jury selection

    // Mock response
    const submission = {
      id: `0xaudit${Date.now()}`,
      bountyId: id,
      submitter: '0xAGENT_WALLET_ADDRESS', // TODO: Get from auth
      report,
      findings: findings || 0,
      severity: severity || 'none',
      submittedAt: new Date().toISOString(),
      status: 'pending_review',
    };

    return NextResponse.json({
      success: true,
      data: submission,
      message: 'Audit report submitted successfully. Pending review by bounty creator or agent jury.',
    });
  } catch (error) {
    console.error('Error submitting audit:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit audit' },
      { status: 500 }
    );
  }
}
