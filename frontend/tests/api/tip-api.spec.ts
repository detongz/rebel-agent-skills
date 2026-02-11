/**
 * API 测试 - 打赏 API
 * 测试后端 API 的功能，不涉及前端 UI
 */

import { test, expect } from '@playwright/test';
import { mockTip, expectedTipResponse, API_ENDPOINTS } from '../helpers/test-data';

test.describe('Tip API', () => {
  test('POST /api/tip - 应该成功创建打赏记录', async ({ request }) => {
    // 生成唯一的 tx_hash (使用时间戳避免 UNIQUE 冲突)
    const uniqueHash = '0x' + Date.now().toString(16).padStart(64, '0');

    const response = await request.post(API_ENDPOINTS.tip, {
      headers: { 'Content-Type': 'application/json' },
      data: {
        skill_id: mockTip.skill_id,
        amount: mockTip.amount,
        message: mockTip.message,
        from_address: mockTip.from_address,
        // 传入真实的 tx_hash（测试时可以传入模拟的）
        tx_hash: uniqueHash,
      },
    });

    const data = await response.json();

    // Debug: 打印错误信息
    if (response.status() !== 200) {
      console.log('Error response:', JSON.stringify(data, null, 2));
    }

    expect(response.status()).toBe(200);

    expect(data.success).toBe(true);
    expect(data.data).toMatchObject({
      skill_id: mockTip.skill_id,
      from_address: mockTip.from_address,
      amount: mockTip.amount,
    });
    expect(data.data.tx_hash).toBeDefined();
  });

  test('POST /api/tip - 缺少必填字段应返回 400', async ({ request }) => {
    const response = await request.post(API_ENDPOINTS.tip, {
      headers: { 'Content-Type': 'application/json' },
      data: {
        skill_id: mockTip.skill_id,
        // 缺少 amount, from_address
      },
    });

    expect(response.status()).toBe(400);

    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toContain('Missing required fields');
  });

  test('POST /api/tip - 无效的 skill_id 应返回 404', async ({ request }) => {
    const uniqueHash = '0x' + (Date.now() + 1).toString(16).padStart(64, '0');

    const response = await request.post(API_ENDPOINTS.tip, {
      headers: { 'Content-Type': 'application/json' },
      data: {
        skill_id: 'non-existent-skill',
        amount: mockTip.amount,
        from_address: mockTip.from_address,
        tx_hash: uniqueHash,
      },
    });

    expect(response.status()).toBe(404);

    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toContain('Skill not found');
  });

  test('GET /api/tip - 应该返回打赏记录列表', async ({ request }) => {
    const response = await request.get(API_ENDPOINTS.tip, {
      params: {
        skill_id: mockTip.skill_id,
        limit: '10',
        offset: '0',
      },
    });

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.tips)).toBe(true);
  });

  test('POST /api/tip - 应该正确计算分账 (98/2)', async ({ request }) => {
    const testAmount = '10000000000000000000'; // 10 ASKL (18 decimals)
    const uniqueHash = '0x' + (Date.now() + 2).toString(16).padStart(64, '0');

    const response = await request.post(API_ENDPOINTS.tip, {
      headers: { 'Content-Type': 'application/json' },
      data: {
        skill_id: mockTip.skill_id,
        amount: testAmount,
        from_address: mockTip.from_address,
        tx_hash: uniqueHash,
      },
    });

    expect(response.status()).toBe(200);

    const data = await response.json();
    // 后端使用 toFixed(6)，返回 "9800000000000000000.000000"
    expect(data.data.creator_received).toBe('9800000000000000000.000000'); // 9.8 ASKL
    expect(data.data.platform_fee).toBe('200000000000000000.000000'); // 0.2 ASKL
  });
});
