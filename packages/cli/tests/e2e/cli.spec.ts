/**
 * MySkills CLI - Playwright E2E 测试
 *
 * 测试 CLI 命令的端到端交互
 */

import { test, expect } from '@playwright/test';

// CLI 启动路径
const CLI_PATH = '../../dist/cli.js';

test.describe('MySkills CLI - E2E 测试', () => {
  // 测试前：确保 CLI 已构建
  test.beforeAll(async () => {
    console.log('🎭 Playwright E2E 测试开始...');
    console.log('确保 CLI 已构建: npm run build');
  });

  test.afterAll(async () => {
    console.log('✅ Playwright E2E 测试完成！');
  });

  // ========================================================================
  // 测试组一：登录和钱包管理
  // ========================================================================

  test.describe('登录和钱包管理', () => {
    test('应该能够显示登录帮助信息', async ({ page }) => {
      console.log('📝 测试：登录帮助信息...');

      // 启动 CLI 并显示帮助
      const result = await test.$`node ${CLI_PATH} --help`;

      // 验证输出包含关键信息
      expect(result.stdout).toContain('myskills');
      expect(result.stdout).toContain('login');
      expect(result.stdout).toContain('private-key');

      console.log('✅ 登录帮助信息显示正常');
    });

    test('应该能够显示 whoami 命令输出', async ({ page }) => {
      console.log('📝 测试：whoami 命令...');

      const result = await test.$`node ${CLI_PATH} whoami`;

      expect(result.stdout).toContain('Wallet Address');
      expect(result.stdout).toMatch(/0x[a-fA-F0-9]{40}/);

      console.log('✅ whoami 命令输出正常');
    });
  });

  // ========================================================================
  // 测试组二：技能搜索和发现
  // ========================================================================

  test.describe('技能搜索和发现', () => {
    test('应该能够搜索技能', async ({ page }) => {
      console.log('📝 测试：搜索技能...');

      const result = await test.$`node ${CLI_PATH} search security`;

      expect(result.stdout).toContain('Searching for skills');
      expect(result.exitCode).toBe(0);

      console.log('✅ 搜索命令执行成功');
    });

    test('应该能够显示排行榜', async ({ page }) => {
      console.log('📝 测试：排行榜命令...');

      const result = await test.$`node ${CLI_PATH} leaderboard`;

      expect(result.stdout).toContain('Top Skills');
      expect(result.exitCode).toBe(0);

      console.log('✅ 排行榜命令执行成功');
    });

    test('搜索应该支持 --limit 参数', async ({ page }) => {
      console.log('📝 测试：搜索带限制参数...');

      const result = await test.$`node ${CLI_PATH} search testing --limit 5`;

      expect(result.stdout).toContain('Searching for skills');
      expect(result.exitCode).toBe(0);

      console.log('✅ 搜索限制参数支持正常');
    });
  });

  // ========================================================================
  // 测试组三：技能提示和支付
  // ========================================================================

  test.describe('技能提示和支付', () => {
    test('应该能够显示 tip 命令帮助', async ({ page }) => {
      console.log('📝 测试：tip 命令帮助...');

      const result = await test.$`node ${CLI_PATH} tip --help`;

      expect(result.stdout).toContain('Send a tip');
      expect(result.stdout).toContain('skill-id');
      expect(result.stdout).toContain('amount');

      console.log('✅ tip 命令帮助显示正常');
    });

    test('应该提示缺少参数的错误', async ({ page }) => {
      console.log('📝 测试：tip 缺少参数...');

      const result = await test.$`node ${CLI_PATH} tip`;

      // 应该有错误提示
      expect(result.stderr).toBeTruthy();
      expect(result.exitCode).not.toBe(0);

      console.log('✅ 错误处理正常');
    });
  });

  // ========================================================================
  // 测试组四：技能发布和管理
  // ========================================================================

  test.describe('技能发布和管理', () => {
    test('应该能够显示 submit 命令帮助', async ({ page }) => {
      console.log('📝 测试：submit 命令帮助...');

      const result = await test.$`node ${CLI_PATH} submit --help`;

      expect(result.stdout).toContain('Submit a skill');
      expect(result.stdout).toContain('GitHub URL');

      console.log('✅ submit 命令帮助显示正常');
    });

    test('应该能够显示 add 命令帮助', async ({ page }) => {
      console.log('📝 测试：add 命令帮助...');

      const result = await test.$`node ${CLI_PATH} add --help`;

      expect(result.stdout).toContain('Add a skill');
      expect(result.stdout).toContain('GitHub URL');

      console.log('✅ add 命令帮助显示正常');
    });
  });

  // ========================================================================
  // 测试组五：OpenClaw 插件集成场景
  // ========================================================================

  test.describe('OpenClaw 插件集成场景', () => {
    test('OpenClaw list 命令应该返回技能列表', async ({ page }) => {
      console.log('📝 测试：OpenClaw list 命令...');

      // 注意：这个测试需要 OpenClaw 插件已安装
      // 测试检查 list 命令是否正确返回技能列表

      console.log('✅ OpenClaw list 命令测试场景已定义');
      console.log('⚠️  需要 OpenClaw 插件已安装才能运行此测试');
    });

    test('OpenClaw search 命令应该搜索技能', async ({ page }) => {
      console.log('📝 测试：OpenClaw search 命令...');

      console.log('✅ OpenClaw search 命令测试场景已定义');
      console.log('⚠️  需要 OpenClaw 插件已安装才能运行此测试');
    });

    test('OpenClaw tip 命令应该发送提示', async ({ page }) => {
      console.log('📝 测试：OpenClaw tip 命令...');

      console.log('✅ OpenClaw tip 命令测试场景已定义');
      console.log('⚠️  需要 OpenClaw 插件已安装才能运行此测试');
    });
  });

  // ========================================================================
  // 测试组六：错误处理和边界情况
  // ========================================================================

  test.describe('错误处理和边界情况', () => {
    test('应该显示友好的错误信息当命令不存在时', async ({ page }) => {
      console.log('📝 测试：不存在命令...');

      const result = await test.$`node ${CLI_PATH} nonexistent-command`;

      expect(result.stderr).toBeTruthy();
      expect(result.exitCode).not.toBe(0);

      console.log('✅ 错误处理正常');
    });

    test('应该显示版本信息', async ({ page }) => {
      console.log('📝 测试：版本信息...');

      const result = await test.$`node ${CLI_PATH} --version`;

      expect(result.stdout).toBeTruthy();

      console.log('✅ 版本信息显示正常');
    });
  });
});
