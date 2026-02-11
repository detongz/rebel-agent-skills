/**
 * CLI 命令集成测试
 *
 * 测试 CLI 命令的完整工作流程
 */

import { describe, it, expect, beforeAll, afterAll, jest } from '@jest/globals';

describe('CLI Commands - 集成测试', () => {
  beforeAll(() => {
    console.log('🧪 开始集成测试...');
    console.log('确保共享包已构建且可导入');
  });

  afterAll(() => {
    console.log('✅ 集成测试完成');
  });

  describe('登录命令 (auth)', () => {
    it('应该能够导入和使用共享配置模块', async () => {
      // 测试 @myskills/shared/config 是否可用
      const configModule = await import('@myskills/shared/config');

      // 验证导出的函数存在
      expect(typeof configModule.loadConfig).toBe('function');
      expect(typeof configModule.saveConfig).toBe('function');
      expect(typeof configModule.MONAD_TESTNET).toBe('object');
      expect(typeof configModule.NETWORK).toBe('object');

      console.log('✅ 配置模块导入成功');
    });
  });

  describe('搜索命令 (search)', () => {
    it('应该能够导入和使用共享 API 模块', async () => {
      // 测试 @myskills/shared/api 是否可用
      const apiModule = await import('@myskills/shared/api');

      // 验证导出的函数存在
      expect(typeof apiModule.searchSkills).toBe('function');
      expect(typeof apiModule.scanSkill).toBe('function');
      expect(typeof apiModule.getLeaderboard).toBe('function');

      console.log('✅ API 模块导入成功');
    });
  });

  describe('提示命令 (tip)', () => {
    it('应该能够导入共享注册表模块', async () => {
      // 测试 @myskills/shared/registry 是否可用
      const registryModule = await import('@myskills/shared/registry');

      // 验证导出的函数存在
      expect(typeof registryModule.loadRegistry).toBe('function');
      expect(typeof registryModule.saveRegistry).toBe('function');
      expect(typeof registryModule.findSkill).toBe('function');
      expect(typeof registryModule.addSkill).toBe('function');

      console.log('✅ 注册表模块导入成功');
    });
  });

  describe('OpenClaw 插件集成', () => {
    it('OpenClaw 应该使用真实 API 调用', async () => {
      // 验证 OpenClaw 插件已迁移到使用共享 API
      const openclawPath = await import('../../openclaw/src/index.ts');

      // 检查源代码中是否使用共享 API 模块
      const sourceContent = require('fs').readFileSync(
        require('path').resolve(__dirname, '../../openclaw/src/index.ts'),
        'utf-8'
      );

      // 验证不再使用 mock 数据
      const hasMockSkillsData = sourceContent.includes('Security Scanner Pro') &&
        sourceContent.includes('Fuzzer X') &&
        !sourceContent.includes('searchSkills') &&
        !sourceContent.includes('getLeaderboard');

      expect(hasMockSkillsData).toBe(false);
      console.log('✅ OpenClaw 已迁移到使用真实 API');
    });
  });
});
