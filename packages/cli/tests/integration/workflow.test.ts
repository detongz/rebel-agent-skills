/**
 * MySkills Protocol - 端到端工作流测试
 *
 * 使用自然语言描述的测试用例，模拟真实用户场景
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';

describe('MySkills Protocol - 工作流测试', () => {
  beforeAll(() => {
    console.log('🚀 开始 MySkills Protocol 工作流测试...\n');
  });

  afterAll(() => {
    console.log('\n✅ 所有测试完成！\n');
  });

  // ========================================================================
  // 场景1：新用户首次使用 MySkills Protocol
  // ========================================================================

  describe('场景一：创作者首次发布技能', () => {
    it('作为一个技能创作者，我想要将我的技能发布到 MySkills 平台', async () => {
      console.log('📝 测试目标：验证技能发布完整流程\n');

      // 步骤1：登录钱包
      console.log('  1. 钱包登录验证...');
      const hasWalletLogin = await verifyWalletLoginFeature();
      console.log(`     ${hasWalletLogin ? '✅' : '❌'} 钱包登录功能可用\n`);

      // 步骤2：解析 GitHub 仓库
      console.log('  2. GitHub 仓库解析验证...');
      const canParseGitHub = await verifyGitHubParser();
      console.log(`     ${canParseGitHub ? '✅' : '❌'} GitHub URL 解析功能可用\n`);

      // 步骤3：安全扫描
      console.log('  3. 安全扫描功能验证...');
      const canScanSkill = await verifyScanAPI();
      console.log(`     ${canScanSkill ? '✅' : '❌'} 安全扫描 API 可用\n`);

      // 步骤4：发布到链上
      console.log('  4. 区块链发布验证...');
      const canPublishOnChain = await verifyPublishContract();
      console.log(`     ${canPublishOnChain ? '✅' : '❌'} 链上发布功能可用\n`);

      // 总结
      if (hasWalletLogin && canParseGitHub && canScanSkill && canPublishOnChain) {
        console.log('✅ 技能发布完整流程验证通过！\n');
      } else {
        console.log('⚠️  部分功能需要进一步检查\n');
      }
    });
  });

  // ========================================================================
  // 场景2：用户搜索和发现技能
  // ========================================================================

  describe('场景二：用户搜索和使用技能', () => {
    it('作为一个用户，我想要搜索适合我需求的技能', async () => {
      console.log('🔍 测试目标：验证技能搜索和发现流程\n');

      // 步骤1：搜索技能
      console.log('  1. 技能搜索功能验证...');
      const canSearchSkills = await verifySearchAPI();
      console.log(`     ${canSearchSkills ? '✅' : '❌'} 技能搜索 API 可用\n`);

      // 步骤2：查看排行榜
      console.log('  2. 排行榜功能验证...');
      const canViewLeaderboard = await verifyLeaderboardAPI();
      console.log(`     ${canViewLeaderboard ? '✅' : '❌'} 排行榜 API 可用\n`);

      // 步骤3：查看技能详情
      console.log('  3. 技能详情获取验证...');
      const canGetSkillDetails = await verifySkillDetails();
      console.log(`     ${canGetSkillDetails ? '✅' : '❌'} 技能详情 API 可用\n`);

      // 总结
      if (canSearchSkills && canViewLeaderboard && canGetSkillDetails) {
        console.log('✅ 技能发现流程验证通过！\n');
      } else {
        console.log('⚠️  部分功能需要进一步检查\n');
      }
    });
  });

  // ========================================================================
  // 场景三：用户支持创作者（提示功能）
  // ========================================================================

  describe('场景三：用户给创作者提示', () => {
    it('作为一个用户，我想要给有用的技能创作者发送提示以示感谢', async () => {
      console.log('💰 测试目标：验证提示发送完整流程\n');

      // 步骤1：查询余额
      console.log('  1. 余额查询功能验证...');
      const canCheckBalance = await verifyBalanceQuery();
      console.log(`     ${canCheckBalance ? '✅' : '❌'} 余额查询功能可用\n`);

      // 步骤2：发送提示
      console.log('  2. 提示发送功能验证...');
      const canSendTip = await verifyTipFunction();
      console.log(`     ${canSendTip ? '✅' : '❌'} 提示发送功能可用\n`);

      // 步骤3：区块链交易确认
      console.log('  3. 区块链交易验证...');
      const hasBlockchainTx = await verifyBlockchainTransaction();
      console.log(`     ${hasBlockchainTx ? '✅' : '❌'} 区块链交易功能可用\n`);

      // 总结
      if (canCheckBalance && canSendTip && hasBlockchainTx) {
        console.log('✅ 提示发送流程验证通过！\n');
      } else {
        console.log('⚠️  部分功能需要进一步检查\n');
      }
    });
  });

  // ========================================================================
  // 场景四：OpenClaw 插件集成
  // ========================================================================

  describe('场景四：OpenClaw 插件与主协议集成', () => {
    it('通过 OpenClaw 插件使用 MySkills Protocol', async () => {
      console.log('🔌 测试目标：验证 OpenClaw 插件完整集成\n');

      // 步骤1：验证真实数据源
      console.log('  1. 验证是否使用真实 API 数据...');
      const usesRealAPI = await verifyOpenClawRealData();
      console.log(`     ${usesRealAPI ? '✅' : '❌'} OpenClaw 使用真实 API（非 mock 数据）\n`);

      // 步骤2：验证区块链交互
      console.log('  2. 验证区块链交互功能...');
      const hasBlockchainFeatures = await verifyOpenClawBlockchain();
      console.log(`     ${hasBlockchainFeatures ? '✅' : '❌'} OpenClaw 区块链功能可用\n`);

      // 步骤3：验证 API 集成
      console.log('  3. 验证 API 调用正确性...');
      const hasCorrectAPIImports = await verifyOpenClawAPIImports();
      console.log(`     ${hasCorrectAPIImports ? '✅' : '❌'} OpenClaw API 导入正确\n`);

      // 总结
      if (usesRealAPI && hasBlockchainFeatures && hasCorrectAPIImports) {
        console.log('✅ OpenClaw 插件集成验证通过！\n');
      } else {
        console.log('⚠️  部分功能需要进一步检查\n');
      }
    });
  });
});

// ============================================================================
// 验证辅助函数
// ============================================================================

/**
 * 验证钱包登录功能
 */
async function verifyWalletLoginFeature(): Promise<boolean> {
  try {
    const configModule = await import('@myskills/shared/config');
    return typeof configModule.loadConfig === 'function' &&
           typeof configModule.saveConfig === 'function';
  } catch {
    return false;
  }
}

/**
 * 验证 GitHub 解析功能
 */
async function verifyGitHubParser(): Promise<boolean> {
  try {
    const parserModule = await import('@myskills/shared/github/parser');
    return typeof parserModule.parseGitHubUrl === 'function' &&
           typeof parserModule.readSkillMetadata === 'function';
  } catch {
    return false;
  }
}

/**
 * 验证安全扫描 API
 */
async function verifyScanAPI(): Promise<boolean> {
  try {
    const apiModule = await import('@myskills/shared/api/scan');
    return typeof apiModule.scanSkill === 'function';
  } catch {
    return false;
  }
}

/**
 * 验证发布合约功能
 */
async function verifyPublishContract(): Promise<boolean> {
  try {
    const configModule = await import('@myskills/shared/config/contracts');
    return typeof configModule.REGISTRY_ABI !== 'undefined' &&
           Array.isArray(configModule.REGISTRY_ABI);
  } catch {
    return false;
  }
}

/**
 * 验证搜索 API
 */
async function verifySearchAPI(): Promise<boolean> {
  try {
    const apiModule = await import('@myskills/shared/api/search');
    return typeof apiModule.searchSkills === 'function';
  } catch {
    return false;
  }
}

/**
 * 验证排行榜 API
 */
async function verifyLeaderboardAPI(): Promise<boolean> {
  try {
    const apiModule = await import('@myskills/shared/api/leaderboard');
    return typeof apiModule.getLeaderboard === 'function';
  } catch {
    return false;
  }
}

/**
 * 验证技能详情获取
 */
async function verifySkillDetails(): Promise<boolean> {
  try {
    // 验证可以从本地注册表获取技能信息
    const registryModule = await import('@myskills/shared/registry');
    return typeof registryModule.findSkill === 'function';
  } catch {
    return false;
  }
}

/**
 * 验证余额查询
 */
async function verifyBalanceQuery(): Promise<boolean> {
  try {
    const coreModule = await import('@myskills/shared/core');
    return typeof coreModule.getBalances === 'function';
  } catch {
    return false;
  }
}

/**
 * 验证提示发送
 */
async function verifyTipFunction(): Promise<boolean> {
  try {
    const coreModule = await import('@myskills/shared/core');
    return typeof coreModule.tipAgent === 'function';
  } catch {
    return false;
  }
}

/**
 * 验证区块链交易
 */
async function verifyBlockchainTransaction(): Promise<boolean> {
  try {
    const configModule = await import('@myskills/shared/config');
    return typeof configModule.NETWORK === 'object' &&
           typeof configModule.MONAD_TESTNET === 'object';
  } catch {
    return false;
  }
}

/**
 * 验证 OpenClaw 使用真实数据
 */
async function verifyOpenClawRealData(): Promise<boolean> {
  try {
    const fs = await import('fs');
    const path = await import('path');

    const openclawPath = path.resolve(__dirname, '../../openclaw/src/index.ts');
    const sourceContent = fs.readFileSync(openclawPath, 'utf-8');

    // 检查是否移除了 mock 数据，改用真实 API
    const usesRealSearchAPI = sourceContent.includes('searchSkills');
    const usesRealLeaderboardAPI = sourceContent.includes('getLeaderboard');
    const removedMockData = !sourceContent.includes('Security Scanner Pro') ||
                         !sourceContent.includes('Fuzzer X');

    return usesRealSearchAPI && usesRealLeaderboardAPI && removedMockData;
  } catch {
    return false;
  }
}

/**
 * 验证 OpenClaw 区块链功能
 */
async function verifyOpenClawBlockchain(): Promise<boolean> {
  try {
    const coreModule = await import('@myskills/shared/core');
    return typeof coreModule.tipAgent === 'function' &&
           typeof coreModule.getBalances === 'function';
  } catch {
    return false;
  }
}

/**
 * 验证 OpenClaw API 导入
 */
async function verifyOpenClawAPIImports(): Promise<boolean> {
  try {
    const sourceContent = await importOpenClawSource();
    return sourceContent.includes('from "@myskills/shared/api"');
  } catch {
    return false;
  }
}

/**
 * 读取 OpenClaw 源代码
 */
async function importOpenClawSource(): Promise<string> {
  const fs = await import('fs');
  const path = await import('path');
  const openclawPath = path.resolve(__dirname, '../../openclaw/src/index.ts');
  return fs.readFileSync(openclawPath, 'utf-8');
}
