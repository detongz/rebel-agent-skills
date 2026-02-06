// app/api/skills/route.ts - Skills API
import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

// GET /api/skills - 获取 Skills 列表
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const platform = searchParams.get('platform');
    // 支持 sort 和 sort_by 两种参数名
    const sort = searchParams.get('sort_by') || searchParams.get('sort') || 'tips';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // 构建查询
    let whereClause = 'WHERE status = ?';
    const params: any[] = ['active'];

    if (platform && platform !== 'all') {
      whereClause += ' AND platform = ?';
      params.push(platform);
    }

    // 排序
    let orderBy = 'ORDER BY created_at DESC';
    if (sort === 'tips') orderBy = 'ORDER BY CAST(total_tips AS INTEGER) DESC';
    if (sort === 'likes') orderBy = 'ORDER BY platform_likes DESC';
    if (sort === 'downloads') orderBy = 'ORDER BY download_count DESC';
    if (sort === 'stars') orderBy = 'ORDER BY github_stars DESC';

    // 查询总数
    const countStmt = db.prepare(`SELECT COUNT(*) as total FROM skills ${whereClause}`);
    const countResult = countStmt.get(...params) as { total: number };
    const total = countResult.total;

    // 查询列表
    const query = `
      SELECT
        id, skill_id, name, description, platform, version,
        creator_address, payment_address,
        npm_package, repository, homepage,
        download_count, github_stars, github_forks,
        total_tips, tip_count, platform_likes,
        logo_url, tags, status, created_at, updated_at
      FROM skills
      ${whereClause}
      ${orderBy}
      LIMIT ? OFFSET ?
    `;

    const stmt = db.prepare(query);
    const skills = stmt.all(...params, limit, offset);

    return NextResponse.json({
      skills: skills.map((skill: any) => ({
        ...skill,
        // 解析 tags JSON
        tags: skill.tags ? JSON.parse(skill.tags) : [],
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error('获取 Skills 失败:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}

// POST /api/skills - 创建 Skill
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 验证必填字段
    const { name, description, platform, paymentAddress, creatorAddress } = body;
    if (!name || !description || !platform || !paymentAddress) {
      return NextResponse.json(
        { error: '缺少必填字段' },
        { status: 400 }
      );
    }

    // 生成 skillId
    const crypto = require('crypto');
    const version = body.version || '1.0.0';
    const data = `${name}:${version}:${platform}`;
    const skillId = '0x' + crypto.createHash('sha256').update(data).digest('hex');

    // 保存到数据库
    const stmt = db.prepare(`
      INSERT INTO skills (
        skill_id, name, description, platform, version,
        creator_address, payment_address,
        npm_package, repository, homepage,
        tags
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      skillId,
      name,
      description,
      platform,
      version,
      creatorAddress || paymentAddress,
      paymentAddress,
      body.npmPackage || null,
      body.repository || null,
      body.homepage || null,
      body.tags ? JSON.stringify(body.tags) : null
    );

    // 如果有 GitHub 仓库，获取一次 stars
    if (body.repository) {
      try {
        const stats = await getGitHubStats(body.repository);
        const updateStmt = db.prepare(`
          UPDATE skills
          SET github_stars = ?, github_forks = ?, stats_updated_at = datetime('now')
          WHERE id = ?
        `);
        updateStmt.run(stats.stars, stats.forks, result.lastInsertRowid);
      } catch (error) {
        console.error('获取 GitHub 统计失败:', error);
      }
    }

    return NextResponse.json({
      success: true,
      skill: {
        id: result.lastInsertRowid,
        skillId,
        name,
        description,
        platform,
      },
    });

  } catch (error) {
    console.error('创建 Skill 失败:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}

// GitHub API 调用
async function getGitHubStats(repoUrl: string) {
  try {
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) {
      return { stars: 0, forks: 0 };
    }

    const [, owner, repo] = match;
    const url = `https://api.github.com/repos/${owner}/${repo}`;

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        ...(process.env.GITHUB_TOKEN && {
          'Authorization': `token ${process.env.GITHUB_TOKEN}`,
        }),
      },
    });

    if (!response.ok) {
      return { stars: 0, forks: 0 };
    }

    const data = await response.json();
    return {
      stars: data.stargazers_count || 0,
      forks: data.forks_count || 0,
    };

  } catch (error) {
    console.error('获取 GitHub 统计失败:', error);
    return { stars: 0, forks: 0 };
  }
}
