/**
 * 测试数据 - Mock 数据和测试配置
 */

export const TEST_ADDRESSES = {
  // 部署者地址（持有全部 ASKL）
  deployer: '0x7F0bDc7dFb0A601f24eBbFD7fd3514575ecBE08b',
  // 测试用户地址
  testUser: '0x1234567890123456789012345678901234567890',
  // 测试创作者地址
  testCreator: '0x9876543210987654321098765432109876543210',
} as const;

export const CONTRACT_ADDRESSES = {
  ASKL_TOKEN: '0xc1fFCAD15e2f181E49bFf2cBea79094eC9B5033A',
  BOUNTY_HUB: '0x2679Bb99E7Cc239787a74BF6c77c2278311c77a1',
} as const;

export const MONAD_TESTNET = {
  chainId: 10143,
  name: 'Monad Testnet',
  rpcUrl: 'https://testnet-rpc.monad.xyz',
  explorerUrl: 'https://testnet.monadvision.com',
} as const;

// Mock Skill 数据（使用真实数据库中的 skill）
export const mockSkill = {
  id: '1',
  skill_id: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef', // 真实 skill_id
  name: 'Anthropic TypeScript SDK',
  description: 'A test skill for auditing smart contracts',
  platform: 'coze',
  payment_address: TEST_ADDRESSES.testCreator,
  total_tips: '100000000000000000000', // 100 ASKL
  tip_count: 10,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// Mock 打赏数据（使用真实 skill_id）
export const mockTip = {
  skill_id: '1', // 数据库自增 ID
  amount: '10000000000000000000', // 10 ASKL
  from_address: TEST_ADDRESSES.testUser,
  message: 'Great skill!',
};

// 预期的交易响应模板（不在 module 级别使用 expect）
export const getExpectedTipResponse = (txHash: string) => ({
  success: true,
  data: {
    tx_hash: txHash,
    skill_id: mockTip.skill_id,
    from_address: mockTip.from_address,
    to_address: mockSkill.payment_address,
    amount: mockTip.amount,
    creator_received: '9800000000000000000', // 98%
    platform_fee: '200000000000000000', // 2%
    message: mockTip.message,
  },
});

// API 端点
export const API_ENDPOINTS = {
  tip: '/api/tip',
  skills: '/api/skills',
  skill: (id: string) => `/api/skills/${id}`,
} as const;
