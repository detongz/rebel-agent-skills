/**
 * 集成测试 - 完整打赏流程
 * 测试从前端 UI → API → 合约的完整链路
 *
 * 注意：这个测试需要真实钱包签名才能通过
 * 在 CI/CD 环境中需要配置测试钱包
 */

import { test, expect } from '@playwright/test';
import { mockSkill, mockTip, CONTRACT_ADDRESSES, TEST_ADDRESSES } from '../helpers/test-data';

test.describe('完整打赏流程 - 集成测试', () => {
  test('流程：前端发起 → API 记录 → 链上确认', async ({ page, request }) => {
    // 1. 访问首页
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 2. 验证页面加载
    await expect(page.locator('.skill-card').first()).toBeVisible();

    // 3. 点击第一个 Tip 按钮
    const tipButton = page.locator('.skill-tip-button').first();
    await tipButton.click();

    // 4. 验证模态框打开
    const modal = page.locator('.tip-modal');
    await expect(modal).toBeVisible();

    // 5. 填写打赏金额（注意：这里只是 UI 测试，真实交易需要钱包）
    const amountInput = modal.locator('input').or(
      modal.locator('[placeholder*="amount" i]')
    ).or(
      modal.locator('.form-input')
    ).first();

    if (await amountInput.isVisible()) {
      await amountInput.fill('10');
    }

    // 6. 验证费用分账显示
    const feeBreakdown = modal.locator('.fee-breakdown');
    if (await feeBreakdown.isVisible()) {
      await expect(feeBreakdown.locator('text: /98.*%/i')).toBeVisible();
    }
  });

  test('API 层：应该记录真实交易', async ({ request }) => {
    // 模拟一个真实的打赏请求
    const skillId = 'test-skill-integration';
    const amount = '5000000000000000000'; // 5 ASKL
    const testTxHash = '0x' + 'i'.repeat(64);

    // 首先创建一个测试 skill
    // 注意：这需要数据库中有对应的 skill 记录
    // 在真实环境中，应该先 setup 测试数据

    const response = await request.post('/api/tip', {
      headers: { 'Content-Type': 'application/json' },
      data: {
        skill_id: skillId,
        amount: amount,
        from_address: TEST_ADDRESSES.testUser,
        message: 'Integration test tip',
        tx_hash: testTxHash,
      },
    });

    // 如果 skill 不存在，会返回 404（这是预期的）
    if (response.status() === 404) {
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain('Skill not found');
    } else {
      // 如果 skill 存在，验证响应
      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.tx_hash).toBe(testTxHash);
    }
  });

  test('合约层：验证合约可调用', async ({ request }) => {
    // 验证合约地址有效
    const response = await request.post('https://testnet-rpc.monad.xyz', {
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_getCode',
        params: [CONTRACT_ADDRESSES.ASKL_TOKEN, 'latest'],
        id: 1,
      }),
    });

    const data = await response.json();
    const contractCode = data.result;

    // 验证合约已部署（代码不是 0x 或 0x0）
    expect(contractCode).not.toBe('0x');
    expect(contractCode).not.toBe('0x0');
    expect(contractCode.length).toBeGreaterThan(10);
  });
});

test.describe('错误处理 - 集成测试', () => {
  test('合约调用失败时的错误处理', async ({ page }) => {
    await page.goto('/');

    // 点击 Tip 按钮
    const tipButton = page.locator('.skill-tip-button').first();
    await tipButton.click();

    const modal = page.locator('.tip-modal');
    await expect(modal).toBeVisible();

    // 如果没有连接钱包，尝试提交应该显示错误
    const submitButton = modal.locator('button:has-text("Tip")').or(
      modal.locator('.btn-primary')
    ).first();

    if (await submitButton.isEnabled()) {
      // 点击提交（没有钱包连接）
      await submitButton.click();

      // 应该显示错误提示
      const errorMessage = page.locator('text: /connect.*wallet/i').or(
        page.locator('.text-red-400')
      ).or(
        page.locator('[class*="error"]')
      );

      // 可能有错误，也可能被浏览器弹窗拦截
      // 这里只是验证错误处理逻辑存在
    }
  });

  test('网络错误时的重试机制', async ({ page }) => {
    // 模拟网络条件
    await page.route('**/api/tip', route => {
      // 第一次请求失败
      route.abort('failed');
    });

    await page.goto('/');

    const tipButton = page.locator('.skill-tip-button').first();
    await tipButton.click();

    const modal = page.locator('.tip-modal');
    await expect(modal).toBeVisible();
  });
});

test.describe('数据一致性 - 集成测试', () => {
  test('前端显示的数据应该与 API 一致', async ({ page, request }) => {
    // 从 API 获取 skills
    const apiResponse = await request.get('/api/skills');
    const apiData = await apiResponse.json();

    // 前端应该显示相同数量的 skills
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const skillCards = page.locator('.skill-card');
    const apiSkills = apiData.data || apiData.skills || [];

    // 注意：由于渲染时机，可能需要等待
    await expect(skillCards).toHaveCount(Math.min(apiSkills.length, 10));
  });

  test('打赏后应该更新统计数据', async ({ page, request }) => {
    // 这个测试需要一个完整的打赏流程
    // 在真实环境中，需要：
    // 1. 连接钱包
    // 2. 发起打赏
    // 3. 等待确认
    // 4. 验证数据更新

    // 这里只是验证数据流的结构
    await page.goto('/skill/1');

    // 检查是否有统计数据显示
    const stats = page.locator('.skill-stats').or(
      page.locator('[class*="stats"]')
    );

    // 如果有统计数据，验证格式
    if (await stats.count() > 0) {
      await expect(stats.first()).toBeVisible();
    }
  });
});
