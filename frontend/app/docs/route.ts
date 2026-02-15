import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function readFirstExistingFile(paths: string[]): Promise<string | null> {
  for (const p of paths) {
    try {
      const content = await fs.readFile(p, 'utf-8');
      return content;
    } catch {
      continue;
    }
  }
  return null;
}

export async function GET() {
  const candidates = [
    path.join(process.cwd(), '..', 'pitch', 'moltiverse-hackathon-en.html'),
    path.join(process.cwd(), 'pitch', 'moltiverse-hackathon-en.html'),
    '/Users/zhangdetong/Documents/workspace/gzh/agent-reward-hub/pitch/moltiverse-hackathon-en.html',
  ];

  const html = await readFirstExistingFile(candidates);
  if (!html) {
    return NextResponse.json(
      {
        success: false,
        error: 'Docs file not found on server',
        expected_file: 'pitch/moltiverse-hackathon-en.html',
      },
      { status: 404 }
    );
  }

  return new NextResponse(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
    },
  });
}
