/**
 * Realistic Seed Skills for MySkills Protocol Demo
 */

// Category icons mapping
const CATEGORY_ICONS = {
  'security': '🛡️',
  'defi': '💰',
  'development': '👨‍💻',
  'analytics': '📊',
  'data': '🔌',
  'optimization': '⚡',
  'education': '📚',
  'trading': '📈',
  'audit': '🔍',
};

// Platform icons
const PLATFORM_ICONS = {
  'claude-code': '🤖',
  'cursor': '⚡',
  'coze': '🎨',
  'manus': '📝',
  'continue': '➡️',
};

// Base seed skills data
const SEED_SKILLS_BASE = [
  {
    packageId: '@myskills/solidity-scanner',
    name: 'Solidity Vulnerability Scanner',
    platform: 'claude-code',
    category: 'security',
    description: 'AI-powered static analysis tool for detecting common Solidity vulnerabilities including reentrancy, overflow, and access control issues.',
    longDescription: 'Uses AST analysis and pattern matching to identify security vulnerabilities in Solidity smart contracts.',
    creatorName: 'SecuriLab Labs',
    creatorWallet: '0x842D3812deF42b8F59b6f2e4f8b3c2a1e5d6f7e8',
    repository: 'https://github.com/securilab/solidity-scanner',
    version: '2.1.0',
    license: 'MIT',
    tags: ['solidity', 'security', 'audit', 'smart-contracts'],
    securityScore: 92,
    scanLevel: 'gold',
    totalTips: '2.5',
    totalStars: 87,
    totalDownloads: 1243,
    totalCalls: 8934,
    createdAt: '2026-01-15T10:00:00Z',
  },
  {
    packageId: '@myskills/defi-arb-tracker',
    name: 'DeFi Arbitrage Opportunity Scanner',
    platform: 'claude-code',
    category: 'defi',
    description: 'Real-time DEX arbitrage detection across Uniswap, SushiSwap, Curve, and Balancer.',
    longDescription: 'Monitors multiple DEXs for price discrepancies and calculates profitable arbitrage opportunities.',
    creatorName: 'YieldHunter DAO',
    creatorWallet: '0x7a3b5c8d2e1f4a6b9c8d7e6f5a4b3c2d1e0f9a8',
    repository: 'https://github.com/yieldhunter/arb-scanner',
    version: '1.8.2',
    license: 'Apache-2.0',
    tags: ['defi', 'arbitrage', 'dex', 'trading', 'yield'],
    securityScore: 78,
    scanLevel: 'silver',
    totalTips: '3.25',
    totalStars: 156,
    totalDownloads: 3421,
    totalCalls: 15678,
    createdAt: '2026-01-20T14:30:00Z',
  },
  {
    packageId: '@myskills/auto-test-generator',
    name: 'Automated Test Suite Generator',
    platform: 'cursor',
    category: 'development',
    description: 'Generate comprehensive test suites from TypeScript/Python code.',
    longDescription: 'Analyzes code structure and generates test cases covering edge cases.',
    creatorName: 'DevFlow Solutions',
    creatorWallet: '0x1a2b3c4d5e6f7890abcdef1234567890abcdef12',
    repository: 'https://github.com/devflow/test-gen',
    version: '3.2.1',
    license: 'MIT',
    tags: ['testing', 'typescript', 'python', 'jest'],
    securityScore: 88,
    scanLevel: 'silver',
    totalTips: '1.5',
    totalStars: 93,
    totalDownloads: 2341,
    totalCalls: 12456,
    createdAt: '2026-01-25T09:00:00Z',
  },
  {
    packageId: '@myskills/gas-optimizer-pro',
    name: 'Solidity Gas Optimizer',
    platform: 'claude-code',
    category: 'optimization',
    description: 'Analyzes Solidity code and suggests gas optimizations.',
    longDescription: 'Identifies gas-wasting patterns and provides refactored code.',
    creatorName: 'GasMaster Labs',
    creatorWallet: '0x9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1098',
    repository: 'https://github.com/gasmaster/optimizer',
    version: '1.5.0',
    license: 'GPL-3.0',
    tags: ['solidity', 'gas', 'optimization'],
    securityScore: 95,
    scanLevel: 'gold',
    totalTips: '2.0',
    totalStars: 112,
    totalDownloads: 1876,
    totalCalls: 9234,
    createdAt: '2026-01-18T13:00:00Z',
  },
  {
    packageId: '@myskills/nft-analyzer',
    name: 'NFT Portfolio Analyzer',
    platform: 'coze',
    category: 'analytics',
    description: 'Analyze NFT portfolios across multiple chains.',
    longDescription: 'Aggregates NFT data from Ethereum, Solana, and Monad.',
    creatorName: 'NFT Insights Co',
    creatorWallet: '0x2b4c6d8e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5',
    repository: 'https://github.com/nftinsights/analyzer',
    version: '2.0.3',
    license: 'MIT',
    tags: ['nft', 'analytics'],
    securityScore: 82,
    scanLevel: 'bronze',
    totalTips: '0.5',
    totalStars: 67,
    totalDownloads: 1432,
    totalCalls: 6789,
    createdAt: '2026-02-01T11:00:00Z',
  },
  {
    packageId: '@myskills/defi-llama-connector',
    name: 'DeFi Llama Data Connector',
    platform: 'manus',
    category: 'data',
    description: 'Query DeFi protocols, TVL data, and yield opportunities from DeFi Llama API.',
    longDescription: 'Provides structured access to DeFi Llama dataset.',
    creatorName: 'DataFlow Research',
    creatorWallet: '0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2',
    repository: 'https://github.com/dataflow/defi-llama-connector',
    version: '1.2.0',
    license: 'MIT',
    tags: ['defi', 'data', 'api'],
    securityScore: 89,
    scanLevel: 'silver',
    totalTips: '0.25',
    totalStars: 45,
    totalDownloads: 987,
    totalCalls: 4523,
    createdAt: '2026-02-03T10:00:00Z',
  },
  {
    packageId: '@myskills/token-approval-scanner',
    name: 'Token Approval Auditor',
    platform: 'claude-code',
    category: 'security',
    description: 'Scan wallet addresses for unlimited token approvals.',
    longDescription: 'Checks token approvals on multiple chains.',
    creatorName: 'SafeWallet DAO',
    creatorWallet: '0x4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5',
    repository: 'https://github.com/safewallet/approval-scanner',
    version: '1.0.5',
    license: 'MIT',
    tags: ['security', 'wallet', 'approvals'],
    securityScore: 91,
    scanLevel: 'gold',
    totalTips: '1.5',
    totalStars: 78,
    totalDownloads: 2134,
    totalCalls: 8765,
    createdAt: '2026-01-28T15:00:00Z',
  },
  {
    packageId: '@myskills/tx-explainer',
    name: 'Transaction Decoder & Explainer',
    platform: 'coze',
    category: 'education',
    description: 'Decodes raw transaction data and explains what happened.',
    longDescription: 'Parses transaction calldata and provides human-readable explanations.',
    creatorName: 'Web3 Educators',
    creatorWallet: '0x5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5',
    repository: 'https://github.com/web3edu/tx-explainer',
    version: '2.3.0',
    license: 'Apache-2.0',
    tags: ['transaction', 'decoder', 'education'],
    securityScore: 85,
    scanLevel: 'silver',
    totalTips: '1.0',
    totalStars: 54,
    totalDownloads: 1654,
    totalCalls: 7234,
    createdAt: '2026-02-02T12:00:00Z',
  },
  {
    packageId: '@myskills/market-maker',
    name: 'AMM Market Maker Agent',
    platform: 'claude-code',
    category: 'defi',
    description: 'Automated market making strategy agent for DEX liquidity pools.',
    longDescription: 'Implements market making strategies for Uniswap V3.',
    creatorName: 'QuantTrade Protocol',
    creatorWallet: '0x6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5',
    repository: 'https://github.com/quanttrade/market-maker',
    version: '1.4.2',
    license: 'Proprietary',
    tags: ['defi', 'amm', 'market-making'],
    securityScore: 87,
    scanLevel: 'silver',
    totalTips: '4.0',
    totalStars: 134,
    totalDownloads: 876,
    totalCalls: 3456,
    createdAt: '2026-01-22T14:00:00Z',
  },
  {
    packageId: '@myskills/doc-generator',
    name: 'Code Documentation Generator',
    platform: 'cursor',
    category: 'development',
    description: 'Generate comprehensive documentation from code.',
    longDescription: 'Analyzes code structure and generates documentation.',
    creatorName: 'DocsFirst',
    creatorWallet: '0x7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6',
    repository: 'https://github.com/docsfirst/generator',
    version: '2.5.1',
    license: 'MIT',
    tags: ['documentation'],
    securityScore: 90,
    scanLevel: 'gold',
    totalTips: '1.25',
    totalStars: 89,
    totalDownloads: 2543,
    totalCalls: 10890,
    createdAt: '2026-01-30T10:00:00Z',
  },
];

// Generate deterministic skill_id from packageId
function generateSkillId(packageId, index) {
  const crypto = require('crypto');
  const nameBuffer = Buffer.from(packageId.replace('@myskills/', ''), 'utf-8');
  const skillId = Buffer.alloc(32);
  nameBuffer.copy(skillId, 0);
  skillId[30] = (index >> 8) & 0xff;
  skillId[31] = index & 0xff;
  return '0x' + crypto.createHash('sha256').update(nameBuffer).digest('hex');
}

// Convert seed skills to full skill format
function getSeedSkills() {
  return SEED_SKILLS_BASE.map((skill, index) => {
    const skillId = generateSkillId(skill.packageId, index);
    const categoryIcon = CATEGORY_ICONS[skill.category] || '📦';
    const platformIcon = PLATFORM_ICONS[skill.platform] || '🔧';

    return {
      id: index + 1,
      skill_id: skillId,
      name: skill.name,
      platform: skill.platform,
      description: skill.description,
      long_description: skill.longDescription,
      payment_address: skill.creatorWallet,
      creator_address: skill.creatorWallet,
      creator_name: skill.creatorName,
      total_tips: skill.totalTips,
      platform_likes: skill.totalStars,
      github_stars: skill.totalStars,
      github_forks: 0,
      category: skill.category.charAt(0).toUpperCase() + skill.category.slice(1),
      version: skill.version || '1.0.0',
      license: skill.license,
      repository: skill.repository,
      npm_package: skill.packageId,
      homepage: 'https://myskills.sh/skill/' + skill.packageId.replace('@myskills/', ''),
      download_count: skill.totalDownloads,
      tip_count: Math.floor(Math.random() * 50),
      tags: skill.tags,
      logo_url: 'https://github.com/' + skill.repository.replace('https://github.com/', '') + '/raw/main/logo.png',
      status: 'active',
      created_at: skill.createdAt,
      updated_at: skill.createdAt,
      security_score: skill.securityScore,
      scan_level: skill.scanLevel,
      security: {
        score: skill.securityScore,
        scanLevel: skill.scanLevel,
        scannedAt: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString(),
        lastAudit: skill.createdAt,
      },
      stats: {
        totalCalls: skill.totalCalls,
        avgRating: (4 + Math.random()).toFixed(1),
        responseTime: Math.floor(200 + Math.random() * 800),
      },
      categoryIcon,
      platformIcon,
      pricing: {
        securityScanPrice: skill.scanLevel === 'gold' ? 50 : skill.scanLevel === 'silver' ? 30 : 10,
        featuredPrice: skill.scanLevel === 'gold' ? 100 : skill.scanLevel === 'silver' ? 60 : 30,
      },
    };
  });
}

function getSeedSkillsByCategory(category) {
  return getSeedSkills().filter(skill =>
    skill.category.toLowerCase() === category.toLowerCase()
  );
}

function getSeedSkillsByPlatform(platform) {
  return getSeedSkills().filter(skill =>
    skill.platform.toLowerCase() === platform.toLowerCase()
  );
}

function getSeedSkillCategories() {
  const categories = new Set();
  getSeedSkills().forEach(skill => categories.add(skill.category));
  return Array.from(categories).map(category => ({
    name: category,
    icon: CATEGORY_ICONS[category.toLowerCase()] || '📦',
    count: getSeedSkillsByCategory(category).length,
  }));
}

function getSeedSkillPlatforms() {
  const platforms = new Set();
  getSeedSkills().forEach(skill => platforms.add(skill.platform));
  return Array.from(platforms).map(platform => ({
    name: platform,
    icon: PLATFORM_ICONS[platform.toLowerCase()] || '🔧',
    count: getSeedSkillsByPlatform(platform).length,
  }));
}

module.exports = {
  getSeedSkills,
  getSeedSkillByPackageId: getSeedSkillsByCategory,
  getSeedSkillsByCategory: getSeedSkillsByPlatform,
  getSeedSkillCategories,
  getSeedSkillPlatforms,
};