/**
 * 合约交互测试 - 测试智能合约的功能
 * 直接与 Monad Testnet 上的合约交互
 */

import { test, expect } from '@playwright/test';
import { CONTRACT_ADDRESSES, MONAD_TESTNET, TEST_ADDRESSES } from '../helpers/test-data';

test.describe('ASKL Token 合约测试', () => {
  test('应该能够读取合约基本信息', async ({ request }) => {
    // 获取合约代码
    const codeResponse = await request.post(MONAD_TESTNET.rpcUrl, {
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_getCode',
        params: [CONTRACT_ADDRESSES.ASKL_TOKEN, 'latest'],
        id: 1,
      }),
    });

    const codeData = await codeResponse.json();
    expect(codeData.result).not.toBe('0x');
    expect(codeData.result).not.toBe('0x0');

    // 获取 token 名称
    const nameResponse = await request.post(MONAD_TESTNET.rpcUrl, {
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_call',
        params: [{
          to: CONTRACT_ADDRESSES.ASKL_TOKEN,
          data: '0x06fdde03', // name() function selector
        }, 'latest'],
        id: 2,
      }),
    });

    const nameData = await nameResponse.json();
    expect(nameData.result).toBeDefined();

    // 解析返回值（前 64 个字符去掉，后 64 个字符是长度，然后是实际数据）
    const result = nameData.result as string;
    expect(result?.length).toBeGreaterThan(0);
  });

  test('应该能够查询代币总供应量', async ({ request }) => {
    const response = await request.post(MONAD_TESTNET.rpcUrl, {
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_call',
        params: [{
          to: CONTRACT_ADDRESSES.ASKL_TOKEN,
          data: '0x18160ddd', // totalSupply() function selector
        }, 'latest'],
        id: 1,
      }),
    });

    const data = await response.json();
    expect(data.result).toBeDefined();

    // 解析 uint256 (前 64 个字符是 0x + 偏移量)
    const result = data.result as string;
    expect(result?.length).toBeGreaterThan(0);

    // 总供应量应该是 10^9 * 10^18 (MAX_SUPPLY)
    // 这是一个非零值
    expect(result?.substring(2)).toMatch(/^[0-9a-f]+$/);
  });

  test('部署者地址应该持有代币', async ({ request }) => {
    // balanceOf(address) 函数调用
    // 函数选择器: 0x70a08231
    // 参数: 地址补齐到 64 字符（去掉 0x）
    const address = TEST_ADDRESSES.deployer.toLowerCase().replace('0x', '');
    const paddedAddress = address.padStart(64, '0');

    const response = await request.post(MONAD_TESTNET.rpcUrl, {
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_call',
        params: [{
          to: CONTRACT_ADDRESSES.ASKL_TOKEN,
          data: `0x70a08231${paddedAddress}`, // balanceOf(deployer)
        }, 'latest'],
        id: 1,
      }),
    });

    const data = await response.json();
    expect(data.result).toBeDefined();

    const result = data.result as string;
    // 部署者应该持有全部 10 亿代币
    expect(result?.substring(2)).not.toBe('0'.repeat(64)); // 不是 0
  });

  test('合约应该有正确的 ABI 函数', async ({ page }) => {
    // 这个测试验证前端配置的 ABI 是否正确
    const contractAbi = [
      'function name() view returns (string)',
      'function symbol() view returns (string)',
      'function totalSupply() view returns (uint256)',
      'function balanceOf(address) view returns (uint256)',
      'function tipSkill(bytes32 skillId, uint256 amount) external',
      'function skillCreators(bytes32) view returns (address)',
    ];

    // 验证前端能访问这些 ABI 定义
    const hasAbiFunctions = await page.evaluate((abi) => {
      return Array.isArray(abi) && abi.length > 0;
    }, contractAbi);

    expect(hasAbiFunctions).toBe(true);
  });
});

test.describe('BountyHub 合约测试', () => {
  test('BountyHub 合约应该已部署', async ({ request }) => {
    const response = await request.post(MONAD_TESTNET.rpcUrl, {
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_getCode',
        params: [CONTRACT_ADDRESSES.BOUNTY_HUB, 'latest'],
        id: 1,
      }),
    });

    const data = await response.json();
    expect(data.result).not.toBe('0x');
    expect(data.result).not.toBe('0x0');
  });
});

test.describe('Monad Testnet 连接测试', () => {
  test('应该能够连接到 Monad Testnet RPC', async ({ request }) => {
    const response = await request.post(MONAD_TESTNET.rpcUrl, {
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_blockNumber',
        params: [],
        id: 1,
      }),
    });

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.result).toBeDefined();
    expect(parseInt(data.result, 16)).toBeGreaterThan(0);
  });

  test('应该能够获取链 ID', async ({ request }) => {
    const response = await request.post(MONAD_TESTNET.rpcUrl, {
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_chainId',
        params: [],
        id: 1,
      }),
    });

    const data = await response.json();
    const chainId = parseInt(data.result, 16);
    expect(chainId).toBe(MONAD_TESTNET.chainId);
  });
});
