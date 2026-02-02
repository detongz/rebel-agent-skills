# Agent Skill 测评与激励平台 - 设计文档

**项目**: Agent Reward Hub - Monad Hackathon 2026
**日期**: 2026-02-03
**赛道**: 赛道 2️⃣ - 与智能体共生与智能市场 + 赛道 1️⃣ - 原生智能体支付与基础设施

---

## 1. 项目概述

### 1.1 核心理念

在 Monad 上构建一个 **Agent Skill 测评与激励平台**，解决三个核心问题：

| 问题 | 解决方案 |
|------|----------|
| 用户不知道 Skill 是否好用 | **付费试用机制**：用户付小额 token 在沙箱测试，看实际效果 |
| 创作者无法获得收益 | **测试驱动激励**：创作者自费测试，通过后获得排名提升+更高分成+空投奖励 |
| 项目方需要特定 Skills | **悬赏市场**：发布需求，平台抽成，排行榜创作者获得奖励 |

### 1.2 差异化竞争

| 竞品 | 局限 | 我们的优势 |
|------|------|------------|
| skills.sh | 免费目录，无激励 | 测试评分+排名系统+收益分成 |
| GitHub | 代码托管，无验证 | 沙箱测评+安全检测+经济激励 |
| Coze Skills | 单一平台，封闭 | 跨平台+链上结算+开放生态 |

---

## 2. 核心机制设计

### 2.1 机制一：创作者自费测试验证（Skin in the Game）

**目的**：创作者证明 Skill 真的能解决问题，过滤不认真的开发者

```
创作者 → 付费（Gas + Token）→ 沙箱测试 → 获得评分 → 排名提升
```

**流程**：
1. 创作者发起测试申请，支付 Gas 费和测试 Token（从钱包扣除）
2. 平台在沙箱中运行 Skill，执行标准测试任务
3. 检测：输出质量、token 消耗、安全性
4. 生成链上测试报告 + 评分（0-100）
5. 评分影响排名和分成比例

**测试评分**：
- 安全评分（0-100）：检测恶意代码、网络请求、钱包操作
- 功能评分（0-100）：输出质量、任务完成度、响应速度
- 综合评分 =（安全 + 功能）/ 2

### 2.2 机制二：测试驱动激励

**目的**：测试通过 = 多种激励，鼓励创作者不断提升 Skill 质量

```
测试通过 → 排名提升 + 分成提高 + 空投奖励解锁
```

**激励方式**：

| 综合评分 | 排名变化 | 分成比例（创作者/��台） |
|---------|---------|------------------------|
| < 60 | 不变/下降 | 98% / 2% |
| 60-79 | +10 | 98% / 2% |
| 80-89 | +20 | 99% / 1% |
| 90-94 | +30 | 99.5% / 0.5% |
| ≥ 95 | +50 | 99.8% / 0.2% |

**空投奖励**（可选）：
- 最佳 Skill 奖：10000 ASKL（每季度）
- 最佳进步奖：5000 ASKL
- 最受欢迎奖：3000 ASKL

### 2.3 机制三：悬赏市场 + 平台抽成

**目的**：用户/项目方发布需求，创作者接单完成，平台抽成运营

```
用户/项目方 → 发布悬赏 → 托管到合约 → 创作者接单完成 → 抽成 5% → 创作者获得奖励
```

**流程**：
1. 用户/项目方发布悬赏（描述需求、预算、期限）
2. 悬赏金额托管到智能合约
3. 创作者开发 Skill，已在机制一中自费测试通过
4. 排名高的创作者更容易被悬赏方选中
5. 悬赏方验收，满意后释放悬赏
6. 平台抽成 5%，创作者获得 95%

**排行榜**：
- 完成悬赏最多的创作者
- 获得悬赏最多的创作者
- 评分最高的创作者
- 榜单奖励：额外空投/平台代币激励

---

## 3. 用户旅程设计

### 3.1 用户发现 Skill 并试用

```
用户浏览 Skills → 发现感兴趣的 → 点击"试用"（支付 10 ASKL）
→ 沙箱运行 → 查看测评报告 → 决定是否正式使用
```

### 3.2 测评报告展示

```
┌─────────────────────────────────────────────┐
│  📊 Agent Skill 测评报告                 │
│  Skill: AI 写作助手 v1.0                   │
│  创作者: 0x1234...5678                      │
│  测评时间: 2026-02-03 10:23                │
└─────────────────────────────────────────────┘

┌───────────────┐  ┌───────────────┐
│  🛡️ 安全评分    │  │  ⭐ 功能评分   │
│    98/100 ✅   │  │   85/100      │
│                │  │  ⭐⭐⭐⭐     │
│ • 无恶意代码   │  │   输出质量 90  │
│ • 无网络请求   │  │   完成度 100   │
│ • 无钱包操作   │  │   响应速度 80  │
│                │  │               │
│ ✅ 可以安全使用 │  ✅ 达到预期    │
└───────────────┘  └───────────────┘

💰 成本效益分析
• 本次试用消耗：1,250 tokens
• 预估正式使用：每 1000 字消耗 800 tokens
• 性价比：⭐⭐⭐⭐（比同类 Skill 低 15%）

💬 社区评价（238 人试用）
⭐⭐⭐⭐⭐ 4.5/5.0
"效果很好，推荐使用"
"偶尔会出错，但总体不错"

[正式使用] [打赏创作者]
```

---

## 4. 技术架构

### 4.1 整体架构

```
┌─────────────────────────────────────────────────────────────────┐
│                      前端层（Next.js）                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │  Skill 目录   │  │  悬赏市场    │  │  排行榜      │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
└─────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API 层（Next.js API Routes）                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │  Skills CRUD  │  │  悬赏 CRUD   │  │  测试报告    │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
└─────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      沙箱层（Docker + Isolate）                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │  静态分析     │  │  动态监控     │  │  功能验证     │           │
│  │  • 危险函数   │  │  • API Hook   │  │  • 测试任务   │           │
│  │  • 网络请求   │  │  • Token 监控 │  │  • 输出质量   │           │
│  │  • 钱包操作   │  │  • 文件监控   │  │               │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
└─────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Monad 链                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │  ASKL Token   │  │  测试合约    │  │  悬赏合约    │           │
│  │  ERC20        │  │  评分记录     │  │  托管/分账    │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 数据库设计（SQLite）

**skills 表**：
```sql
CREATE TABLE skills (
  id INTEGER PRIMARY KEY,
  skill_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  platform TEXT,
  creator_address TEXT NOT NULL,
  payment_address TEXT NOT NULL,

  -- 测试评分
  test_score INTEGER DEFAULT 0,
  safety_score INTEGER DEFAULT 0,
  function_score INTEGER DEFAULT 0,
  test_count INTEGER DEFAULT 0,

  -- 排名和分成
  ranking INTEGER DEFAULT 999,
  revenue_share INTEGER DEFAULT 980,  -- 基数：98%

  -- 统计
  total_tips TEXT DEFAULT '0',
  tip_count INTEGER DEFAULT 0,
  total_earnings TEXT DEFAULT '0',

  created_at TEXT DEFAULT (datetime('now'))
);
```

**bounties 表**：
```sql
CREATE TABLE bounties (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  reward_amount TEXT NOT NULL,
  platform_fee_rate INTEGER DEFAULT 50,  -- 5% = 50 基点
  creator_address TEXT NOT NULL,
  skill_id TEXT,
  status TEXT DEFAULT 'open',  -- open, in_progress, completed, cancelled
  created_at TEXT DEFAULT (datetime('now'))
);
```

**skill_tests 表**：
```sql
CREATE TABLE skill_tests (
  id INTEGER PRIMARY KEY,
  skill_id INTEGER NOT NULL,
  test_type TEXT NOT NULL,  -- safety, function, integration
  score INTEGER NOT NULL,
  details TEXT,  -- JSON 格式的详细结果
  passed BOOLEAN NOT NULL,
  gas_used INTEGER,
  tester_address TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
```

---

## 5. 智能合约设计

### 5.1 ASKL Token（ERC20）

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ASKLToken is ERC20, Ownable {
    error InvalidAmount();
    error InvalidCreatorAddress();

    mapping(bytes32 => address) public skillCreators;
    mapping(address => uint256) public creatorEarnings;
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18;

    uint256 public creatorRewardBps = 9800;  // 98%
    address public platformWallet;

    event SkillRegistered(bytes32 indexed skillId, address indexed creator, string skillName);
    event Tipped(bytes32 indexed skillId, address indexed tipper, address indexed creator, uint256 amount);

    constructor(address _platformWallet) ERC20("AgentSkill", "ASKL") Ownable(msg.sender) {
        platformWallet = _platformWallet;
        _mint(msg.sender, MAX_SUPPLY);
    }

    // 注册 Skill
    function registerSkill(bytes32 skillId, string calldata skillName, address creator) external {
        if (skillCreators[skillId] != address(0)) revert("Skill already registered");
        skillCreators[skillId] = creator;
        emit SkillRegistered(skillId, creator, skillName);
    }

    // 打赏 Skill（自动 98/2 分账）
    function tipSkill(bytes32 skillId, uint256 amount) external {
        address creator = skillCreators[skillId];
        if (creator == address(0)) revert InvalidCreatorAddress();

        uint256 creatorReward = (amount * creatorRewardBps) / 10000;
        uint256 platformFee = amount - creatorReward;

        _transfer(msg.sender, creator, creatorReward);
        _transfer(msg.sender, platformWallet, platformFee);

        creatorEarnings[creator] += creatorReward;
        emit Tipped(skillId, msg.sender, creator, amount);
    }

    // 设置创作者奖励比例
    function setCreatorRewardBps(uint256 newBps) external onlyOwner {
        if (newBps > 10000) revert("Invalid basis points");
        creatorRewardBps = newBps;
    }

    // 获取创作者收益
    function getCreatorEarnings(address creator) external view returns (uint256) {
        return creatorEarnings[creator];
    }
}
```

### 5.2 Bounty Contract（悬赏合约）

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract BountyMarket {
    IERC20 public asklToken;
    uint256 public platformFeeRate = 500;  // 5%

    struct Bounty {
        uint256 id;
        string title;
        string description;
        uint256 reward;
        address sponsor;
        address skillId;
        BountyStatus status;
    }

    enum BountyStatus {
        Open,
        Claimed,
        Completed,
        Cancelled
    }

    Bounty[] public bounties;
    uint256 public bountyCount;

    event BountyCreated(uint256 indexed bountyId, address indexed sponsor, uint256 reward);
    event BountyClaimed(uint256 indexed bountyId, address indexed creator, address skillId);
    event BountyCompleted(uint256 indexed bountyId);

    constructor(address _asklToken) {
        asklToken = IERC20(_asklToken);
    }

    // 创建悬赏
    function createBounty(
        string calldata title,
        string calldata description,
        uint256 reward
    ) external returns (uint256) {
        // 转账到合约托管
        asklToken.transferFrom(msg.sender, address(this), reward);

        uint256 bountyId = bounties.length;
        bounties.push(Bounty({
            id: bountyId,
            title: title,
            description: description,
            reward: reward,
            sponsor: msg.sender,
            skillId: address(0),
            status: BountyStatus.Open
        }));

        bountyCount++;
        emit BountyCreated(bountyId, msg.sender, reward);
        return bountyId;
    }

    // 认领悬赏（创作者接单）
    function claimBounty(uint256 bountyId, address skillId) external {
        Bounty storage bounty = bounties[bountyId];
        if (bounty.status != BountyStatus.Open) revert("Bounty not open");
        if (bounty.sponsor == msg.sender) revert("Sponsor cannot claim own bounty");

        bounty.skillId = skillId;
        bounty.status = BountyStatus.Claimed;
        emit BountyClaimed(bountyId, msg.sender, skillId);
    }

    // 完成悬赏（释放奖励给创作者）
    function completeBounty(uint256 bountyId) external {
        Bounty storage bounty = bounties[bountyId];
        if (bounty.status != BountyStatus.Claimed) revert("Bounty not claimed");
        if (msg.sender != bounty.sponsor) revert("Only sponsor can complete");

        // 计算抽成
        uint256 platformFee = (bounty.reward * platformFeeRate) / 10000;
        uint256 creatorReward = bounty.reward - platformFee;

        // 释放给创作者
        asklToken.transfer(bounty.skillId, creatorReward);

        // 平台抽成
        asklToken.transfer(owner(), platformFee);

        bounty.status = BountyStatus.Completed;
        emit BountyCompleted(bountyId);
    }
}
```

---

## 6. 切题说明

### 6.1 赛道 2️⃣：与智能体共生与智能市场

> 切题点：**围绕智能体智能的数据采集、反馈与激励机制**

**我们的方案**：
- **数据采集**：沙箱测试自动采集 Skill 的性能数据（token 消耗、响应速度、输出质量）
- **反馈机制**：用户试用后评分、评论，形成社区评价体系
- **激励机制**：
  - 创作者：测试通过→排名提升+分成提高+空投奖励
  - 用户：发现好用 Skills，避免无效消费
  - 项目方：发布悬赏，精准获得高质量 Skills

### 6.2 赛道 1️⃣：原生智能体支付与基础设施

> 切题点：**可被智能体调用的支付、订阅与结算协议**

**我们的方案**：
- **可调用支付**：用户可直接调用 `tipSkill()` 打赏创作者
- **自动分账协议**：98% 给创作者，2% 平台销毁，智能合约自动执行
- **悬赏结算**：悬赏托管到合约，完成后自动分发给创作者和平台
- **可组合性**：其他智能体可集成我们的支付协议

---

## 7. 商业模式

### 7.1 收入来源

| 来源 | 收入方式 | 说明 |
|------|---------|------|
| **用户付费测试** | 10 ASKL/次 | 用户试用 Skill 支付的费用 |
| **平台抽成** | 悬赏金额的 5% | 悬赏市场的平台服务费 |
| **平台分成** | 0.2%-2% | 用户打赏的平台分成（根据 Skill 评分动态调整） |
| **增值服务** | 固定费用 | 企业版、API 调用、优先排名等（后期） |

### 7.2 成本结构

| 成本项 | 说明 |
|--------|------|
| Gas 费用 | 智能合约部署和交易 |
| 沙箱成本 | Docker 容器、测试环境 |
| 开发成本 | 前端、后端、智能合约开发 |
| 运营成本 | 社区管理、内容审核、客户支持 |

### 7.3 退出路径

| 选项 | 说明 |
|------|------|
| **被大厂收购** | 作为 Agent 时代的 "App Store"，被 Coze/Anthropic/ByteDance 等收购 |
| **代币增值** | ASKL 代币升值，团队持有部分受益 |
| **SaaS 化** | 企业服务收入，订阅模式 |

---

## 8. MVP 实施计划

### 8.1 功能优先级

| 优先级 | 功能 | 工作量 |
|--------|------|--------|
| P0 | 智能合约部署到 Monad 测试网 | 2 天 |
| P0 | Skills 目录+排名展示 | 3 天 |
| P0 | 创作者注册 Skill 功能 | 2 天 |
| P0 | 打赏功能（98/2 分账） | 2 天 |
| P1 | 用户付费试用功能 | 3 天 |
| P1 | 悬赏市场 | 3 天 |
| P1 | 沙箱测试基础设施 | 5 天 |
| P1 | 测评报告生成 | 2 天 |
| P2 | 空投奖励系统 | 3 天 |
| P2 | 排行榜系统 | 2 天 |

### 8.2 技术栈

| 层级 | 技术选型 |
|------|----------|
| 前端 | Next.js 14 + TypeScript + Tailwind CSS + RainbowKit |
| 后端 | Next.js API Routes + SQLite + Prisma |
| 沙箱 | Docker + Puppeteer + Isolate |
| 智能合约 | Solidity + OpenZeppelin + Hardhat |
| 部署链 | Monad Testnet |

---

## 9. 风险与对策

### 9.1 技术风险

| 风险 | 对策 |
|------|------|
| 沙箱绕过 | 多层检测：静态+动态+人工审核 |
| Gas 费过高 | Monad 测试网 Gas 极低，不成问题 |
| 智能合约漏洞 | 使用 OpenZeppelin 审计过的合约，多签钱包 |

### 9.2 经济风险

| 风险 | 对策 |
|------|------|
| 刷单/恶意用户 | 信誉分系统+rate limiting |
| 创作者流失 | 测试成本低，收益高，吸引力强 |
| 代币价格波动 | 测试费固定 USD 计价，用多少扣多少 |

---

## 10. 总结

Agent Reward Hub 是一个**测试驱动的 Agent Skill 激励平台**，核心创新点：

1. **创作者自费测试**：证明 Skill 真的能解决问题
2. **付费试用**：用户可先验证效果再付费
3. **测试驱动激励**：测试通过→排名提升+分成提高+空投奖励
4. **悬赏市场**：项目方发布需求，平台抽成，创作者接单赚钱

这个设计同时切中**赛道 1️⃣ + 赛道 2️⃣**，具有完整的经济飞轮和可持续的商业模式。

---

**下一步**：准备开始实施了吗？
