/**
 * 配置管理模块单元测试
 *
 * 测试 @myskills/shared/config 模块的功能
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';

// Mock fs 模块用于测试
const mockFs = {
  existsSync: jest.fn(() => false),
  readFileSync: jest.fn(() => '{}'),
  writeFileSync: jest.fn(),
  mkdirSync: jest.fn(),
};

describe('@myskills/shared/config - Config Module', () => {
  // 每个测试前清理 mock
  beforeEach(() => {
    jest.clearAllMocks();
    // 设置 process.env
    process.env.MYSKILLS_NETWORK = 'testnet';
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete process.env.MYSKILLS_NETWORK;
  });

  describe('Config - Wallet 配置', () => {
    describe('loadConfig()', () => {
      it('应该返回空对象当配置文件不存在时', async () => {
        mockFs.existsSync.mockReturnValue(false);
        expect(await import('@myskills/shared/config').loadConfig()).toEqual({});
      });

      it('应该返回配置对象当文件存在', async () => {
        const mockConfig = { privateKey: '0x123', address: '0xabc' };
        mockFs.readFileSync.mockReturnValue(JSON.stringify(mockConfig));
        expect(await import('@myskills/shared/config').loadConfig()).toEqual(mockConfig);
      });

      it('应该返回空对象当 JSON 解析失败', async () => {
        mockFs.readFileSync.mockReturnValue('invalid json');
        expect(await import('@myskills/shared/config').loadConfig()).toEqual({});
      });
    });

    describe('saveConfig()', () => {
      it('应该保存配置到文件', async () => {
        const config = { privateKey: '0x456', address: '0xdef' };
        await import('@myskills/shared/config').saveConfig(config);
        expect(mockFs.writeFileSync).toHaveBeenCalledWith(
          expect.stringContaining('.myskills'),
          expect.stringContaining('privateKey'),
          expect.stringContaining('0x456')
        );
      });
    });
  });

  describe('Network - 网络配置', () => {
    describe('MONAD_TESTNET 常量', () => {
      it('应该返回测试网络配置', () => {
        const network = import('@myskills/shared/config').MONAD_TESTNET;
        expect(network.id).toBe(10143);
        expect(network.name).toBe('Monad Testnet');
        expect(network.rpcUrls.default.http[0]).toBe('https://testnet-rpc.monad.xyz');
        expect(network.nativeCurrency.symbol).toBe('MON');
      });
    });

    describe('NETWORK 动态选择', () => {
      it('默认返回测试网络', () => {
        const network = import('@myskills/shared/config').NETWORK;
        expect(network.id).toBe(10143); // testnet
      });

      it('当设置 mainnet 环境变量时返回主网', () => {
        process.env.MYSKILLS_NETWORK = 'mainnet';
        const network = import('@myskills/shared/config').NETWORK;
        expect(network.id).toBe(143); // mainnet
      });
    });
  });

  describe('Contracts - 合约配置', () => {
    it('应该返回 ASKL_TOKEN_ABI', () => {
      const abi = import('@myskills/shared/config').ASKL_TOKEN_ABI;
      expect(Array.isArray(abi)).toBe(true);
      expect(abi.length).toBeGreaterThan(0);
      });
    });
  });
});
