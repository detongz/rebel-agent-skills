# 方向 A 实施计划 - Moltiverse (2月15日截止)

## 🎯 核心概念

**应用商店 + 安全检查 + 悬赏平台**

```
用户浏览 Skills → 选择 Skill → 付 gas 购买安全/效果检查 → Skills 按排名付费
                    ↓
            用户发现问题 → 发布悬赏 → 专家 Agent 审计 → 验收通过 → 自动打赏
```

## 📱 用户流程

### 流程 1: 购买安全检查
```
1. 用户浏览 Skills，看到 "Solidity Auditor" Skill
2. 安全评分: 85/100 (白银级)
3. 点击"购买安全检查" - 价格 0.1 MON
4. 付 gas，Agent 自动执行检查
5. 30秒后收到检查报告
6. Skill 创作者收到 0.098 MON (98% 收益)
```

### 流程 2: 发布悬赏
```
1. 用户: "这个 Skill 有安全问题，悬赏 100 MON"
2. 设定验收标准: 需要发现至少 3 个漏洞
3. 抵押 100 MON
4. 安全专家 Agent 接单
5. 提交审计报告
6. 验收 Agent 自动验证
7. 通过 → 自动打赏 98 MON
```

## 🏗️ 技术实现

### 智能合约 (已部署在 Monad Testnet)

```solidity
// contracts/SkillBounty.sol
contract SkillBounty {
    struct Skill {
        string name;
        address creator;
        uint256 securityScore;      // 安全评分 0-100
        uint256 effectivenessScore; // 效果评分 0-100
        uint256 checkPrice;         // 每次检查价格
        SkillRank rank;             // 铂金/黄金/白银
    }

    struct CheckPurchase {
        string skillId;
        CheckType checkType;  // SECURITY | EFFECTIVENESS
        address buyer;
        uint256 timestamp;
    }

    struct Bounty {
        uint256 id;
        string skillId;
        address creator;
        uint256 reward;
        string acceptanceCriteria; // 验收标准
        BountyStatus status;
        address winner;
    }

    // 购买检查服务
    function purchaseCheck(string memory skillId, CheckType checkType)
        external payable;

    // 发布悬赏
    function postBounty(string memory skillId, uint256 reward, string memory criteria)
        external payable;

    // 提交审计
    function submitAudit(uint256 bountyId, string memory auditReport)
        external;

    // 验收 (项目经理 Agent 调用)
    function verifyAudit(uint256 bountyId, bool approved, string memory reason)
        external;

    // 分账
    function distributePayment(uint256 bountyId) external;
}
```

### MCP Server 工具

```typescript
// packages/mcp-server/src/index.ts
export const tools = {
  // 浏览 Skills
  list_skills: {
    description: "浏览所有 Agent Skills，按安全/效果/价格排序",
    parameters: {
      sortBy: "security" | "effectiveness" | "price" | "rank",
      filter: "all" | "platinum" | "gold" | "silver"
    }
  },

  // 购买检查
  purchase_check: {
    description: "购买 Skill 的安全或效果检查",
    parameters: {
      skillId: string,
      checkType: "security" | "effectiveness"
    }
  },

  // 发布悬赏
  post_bounty: {
    description: "为 Skill 发布安全审计悬赏",
    parameters: {
      skillId: string,
      reward: number,  // MON 数量
      acceptanceCriteria: string  // 验收标准
    }
  },

  // 提交审计
  submit_audit: {
    description: "提交 Skill 的安全审计报告",
    parameters: {
      bountyId: number,
      auditReport: string
    }
  },

  // 验收审计 (项目经理 Agent)
  verify_audit: {
    description: "验证审计报告是否满足验收标准",
    parameters: {
      bountyId: number,
      approved: boolean,
      reason: string
    }
  }
};
```

### 前端功能 (Next.js + RainbowKit)

```
pages/
├── index.tsx              # Skill 浏览 + 排名
├── skill/[id].tsx         # Skill 详情 + 购买检查
├── bounties/
│   ├── index.tsx          # 悬赏列表
│   ├── new.tsx            # 发布悬赏
│   └── [id].tsx           # 悬赏详情 + 提交审计
└── verification/
    └── [id].tsx           # 验收界面 (项目经理 Agent)
```

## 🤖 项目经理 Agent (验收 Agent)

### 角色
自动验收审计报告的"项目经理"，确保悬赏质量。

### 功能
```typescript
// agents/verifier-agent.ts
class VerificationAgent {
  async verifyAudit(bountyId: number, auditReport: string) {
    const bounty = await getBounty(bountyId);

    // 1. 解析验收标准
    const criteria = this.parseCriteria(bounty.acceptanceCriteria);

    // 2. 运行验证脚本
    const result = await this.runVerificationTests(auditReport, criteria);

    // 3. 检查是否满足
    const approved = this.checkCriteria(result, criteria);

    // 4. 调用智能合约验收
    if (approved) {
      await contract.verifyAudit(bountyId, true, "All criteria met");
      await contract.distributePayment(bountyId);
    } else {
      await contract.verifyAudit(bountyId, false, result.reason);
    }

    return { approved, result };
  }

  private async runVerificationTests(auditReport: string, criteria: any) {
    // 运行安全测试
    // - 静态分析
    // - 漏洞扫描
    // - 代码审查
    return {
      vulnerabilitiesFound: 3,
      severity: ["high", "medium", "low"],
      testResults: [...]
    };
  }
}
```

## 📊 收益模型

### Skill 创作者收益
```
被动收益:
- 每次安全检查: 0.1 MON × 98% = 0.098 MON
- 每次效果验证: 0.05 MON × 98% = 0.049 MON
- 检查次数越多，收益越高

排名加成:
- 铂金级 (90+分): 每次 0.2 MON
- 黄金级 (80-89分): 每次 0.1 MON
- 白银级 (70-79分): 每次 0.05 MON

主动收益:
- 被悬赏雇佣完成审计
- 按任务复杂度定价
```

### 平台收益
```
- 每笔检查的 2% 手续费
- 悬赏服务的 5% 服务费
- 剩余 2% 销毁或归入国库
```

## 🎯 演示场景

### 场景 1: 用户购买安全检查
```
用户: "我想检查这个 Solidity Skill 的安全性"
系统:
  1. 显示 Skill: 安全评分 85/100 (白银级)
  2. 价格: 0.1 MON/次
  3. 用户点击"购买安全检查"
  4. 付 gas
  5. Agent 运行 Slither + Mythril
  6. 30秒后返回报告:
     - 发现 2 个中危漏洞
     - 发现 5 个低危问题
     - 建议: 修复重审
  7. Skill 创作者收到 0.098 MON
```

### 场景 2: 发布悬赏
```
用户: "悬赏 100 MON 审计这个 Skill"
系统:
  1. 用户设定验收标准:
     - 至少发现 3 个漏洞
     - 包含修复建议
     - 提供测试用例
  2. 抵押 100 MON
  3. 安全专家 Agent 接单
  4. 提交审计报告 (发现 5 个漏洞)
  5. 验收 Agent 自动验证:
     - ✓ 漏洞数量满足
     - ✓ 修复建议详细
     - ✓ 测试用例完整
  6. 验收通过，自动打赏 98 MON
```

## 🚀 实施步骤

### Week 1: 基础功能 (2月8-10日)
- [x] 智能合约已部署
- [ ] 完善 MCP Server 工具
- [ ] 实现安全检查 Agent (Slither + Mythril)
- [ ] 前端 Skill 浏览 + 排名页面

### Week 2: 悬赏功能 (2月11-14日)
- [ ] 悬赏发布和竞标
- [ ] 验收 Agent 实现
- [ ] 自动分账逻辑
- [ ] 录制演示视频

### 提交日 (2月15日)
- [ ] 提交 Moltiverse
- [ ] 发布博客文章
- [ ] 社交媒体推广

## 📝 营销文案

> **"让 Agent Skills 更安全"**
>
> 用户浏览 Skills，购买安全检查，悬赏专家审计。
> 首个带安全审计和悬赏市场的 Agent Skill 应用商店。
>
> - 用户付 gas 购买安全检查
> - Skills 按排名和检查次数获得收益
> - 悬赏 + 自动验收闭环

---

**创建时间**: 2026年2月8日
**提交截止**: 2月15日 (Moltiverse.dev)
