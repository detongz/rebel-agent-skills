// app/api/tip/route.ts - 打赏 API
import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

// POST - 发起打赏
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { skill_id, amount, message, from_address } = body;

    // 验证必填字段
    if (!skill_id || !amount || !from_address) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: skill_id, amount, from_address' },
        { status: 400 }
      );
    }

    // 查询 Skill 信息
    const skill = db.prepare(`
      SELECT id, name, payment_address, creator_address, total_tips, tip_count
      FROM skills
      WHERE id = ?
    `).get(skill_id) as any;

    if (!skill) {
      return NextResponse.json(
        { success: false, error: 'Skill not found' },
        { status: 404 }
      );
    }

    // 计算分账 (98% 创作者, 2% 平台)
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid amount' },
        { status: 400 }
      );
    }

    const creatorReceived = (amountNum * 0.98).toFixed(6);
    const platformFee = (amountNum * 0.02).toFixed(6);

    // 生成模拟交易哈希 (因为本地演示没有真实链上交易)
    const mockTxHash = '0x' + Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');

    // 插入打赏记录
    db.prepare(`
      INSERT INTO tips (tx_hash, skill_id, from_address, to_address, amount, creator_received, platform_fee, message)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      mockTxHash,
      skill_id,
      from_address,
      skill.payment_address,
      amount.toString(),
      creatorReceived,
      platformFee,
      message || null
    );

    // 更新 Skill 的统计数据
    const currentTips = parseFloat(skill.total_tips || '0');
    const newTotalTips = (currentTips + amountNum).toFixed(6);
    const newTipCount = (skill.tip_count || 0) + 1;

    db.prepare(`
      UPDATE skills
      SET total_tips = ?,
          tip_count = ?,
          updated_at = datetime('now')
      WHERE id = ?
    `).run(newTotalTips, newTipCount, skill_id);

    return NextResponse.json({
      success: true,
      data: {
        tx_hash: mockTxHash,
        skill_id,
        from_address,
        to_address: skill.payment_address,
        amount: amount.toString(),
        creator_received: creatorReceived,
        platform_fee: platformFee,
        message,
        block_number: Math.floor(Math.random() * 1000000), // 模拟区块号
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Tip error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process tip' },
      { status: 500 }
    );
  }
}

// GET - 获取打赏记录
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const skillId = searchParams.get('skill_id');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = `
      SELECT t.*, s.name as skill_name
      FROM tips t
      LEFT JOIN skills s ON t.skill_id = s.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (skillId) {
      query += ' AND t.skill_id = ?';
      params.push(skillId);
    }

    query += ' ORDER BY t.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const tips = db.prepare(query).all(...params);

    return NextResponse.json({
      success: true,
      tips,
      count: tips.length,
    });
  } catch (error) {
    console.error('Get tips error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tips' },
      { status: 500 }
    );
  }
}
