/**
 * API Route: /api/seed-db
 *
 * POST: Manually trigger database seeding
 * Useful for initializing the database with sample data
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

/**
 * POST /api/seed-db
 * Seeds database with sample skills data if empty
 */
export async function POST(request: NextRequest) {
  try {
    // Check current data count
    const countResult = db.prepare('SELECT COUNT(*) as count FROM skills').get() as { count: number } | undefined;

    if (!countResult) {
      return NextResponse.json(
        { success: false, error: 'Failed to query database' },
        { status: 500 }
      );
    }

    // If database has data, ask for confirmation to force reseed
    if (countResult.count > 0) {
      const body = await request.json().catch(() => ({}));
      if (!body.force) {
        return NextResponse.json({
          success: false,
          message: `Database already has ${countResult.count} skills`,
          hint: 'Set { "force": true } in request body to reseed',
          currentCount: countResult.count,
        });
      }

      // Clear existing data if force is true
      console.log('🗑️ Clearing existing data...');
      db.prepare('DELETE FROM skills').run();
    }

    // Load seed data
    console.log('🌱 Loading seed data...');
    const { getSeedSkills } = await import('@/lib/seed-skills');
    const seedSkills = getSeedSkills();
    console.log('📊 Seed skills loaded:', seedSkills.length, 'first skill:', seedSkills[0]?.name);

    const insert = db.prepare(`
      INSERT INTO skills (
        skill_id, transaction_hash, name, description, platform, version,
        creator_address, payment_address, npm_package,
        repository, homepage, download_count,
        github_stars, github_forks, total_tips,
        tip_count, platform_likes, logo_url, tags,
        status, created_at, updated_at, stats_updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'), NULL)
    `);

    let inserted = 0;
    for (const skill of seedSkills) {
      try {
        insert.run(
          skill.skill_id,
          null, // transaction_hash
          skill.name,
          skill.description,
          skill.platform,
          skill.version || '1.0.0',
          skill.creator_address || skill.creator,
          skill.payment_address,
          skill.npm_package,
          skill.repository,
          skill.homepage,
          skill.download_count || 0,
          skill.github_stars || 0,
          skill.github_forks || 0,
          skill.total_tips || '0',
          skill.tip_count || 0,
          skill.platform_likes || 0,
          skill.logo_url,
          Array.isArray(skill.tags) ? skill.tags.join(',') : (skill.tags || null),
          'active',
          null // stats_updated_at
        );
        inserted++;
      } catch (error) {
        console.error(`Failed to insert skill ${skill.name}:`, error);
      }
    }

    // Verify insertion
    const newCount = db.prepare('SELECT COUNT(*) as count FROM skills').get() as { count: number };

    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${newCount.count} skills`,
      data: {
        inserted: newCount.count,
        attempted: inserted,
        categories: [...new Set(seedSkills.map((s: any) => s.category))].length,
        platforms: [...new Set(seedSkills.map((s: any) => s.platform))].length,
      },
    });
  } catch (error) {
    console.error('Seeding error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to seed database',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/seed-db
 * Returns seeding status
 */
export async function GET() {
  try {
    const stats = db.prepare(`
      SELECT
        COUNT(*) as total,
        COUNT(github_stars) as with_stars,
        AVG(github_stars) as avg_stars
      FROM skills
    `).get() as {
      total: number;
      with_stars: number;
      avg_stars: string;
    } | undefined;

    return NextResponse.json({
      success: true,
      data: {
        totalSkills: stats?.total || 0,
        skillsWithStars: stats?.with_stars || 0,
        averageStars: stats?.avg_stars || '0',
        needsSeeding: (stats?.total || 0) === 0,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to check database status' },
      { status: 500 }
    );
  }
}
