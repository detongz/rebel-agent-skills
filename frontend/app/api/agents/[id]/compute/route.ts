import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

/**
 * GET /api/agents/[id]/compute
 * Get compute usage statistics for an agent
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Agent ID is required' },
        { status: 400 }
      );
    }

    // In production, fetch from database
    // For now, return mock data
    return NextResponse.json({
      success: true,
      data: {
        agent_id: id,
        total_compute: 0,
        skills: [],
        last_activity: null,
      },
    });
  } catch (error) {
    console.error('Error fetching compute usage:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch compute usage' },
      { status: 500 }
    );
  }
}
