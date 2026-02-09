# 两方向黑客松提交策略 - 完整总结

## 🎯 核心策略

**同一个代码库 → 两个不同定位的项目 → 分别提交到两个比赛**

```
myskills 代码库
├── 共享基础代码
│   ├── 智能合约 (MySkillsProtocol.sol)
│   ├── MCP Server
│   ├── CLI 工具
│   └── 前端框架
│
├── 方向 A (Moltiverse, 2/15截止)
│   ├── 侧重点: 安全检测 + 悬赏
│   ├── 演示: Skill 安全检查 + 悬赏审计
│   └── 营销: "让 Agent Skills 更安全"
│
└── 方向 B (Blitz Pro, 2/28截止)
    ├── 侧重点: AaaS 智能调度 + x402
    ├── 演示: 智能任务调度 + 自动分账
    └── 营销: "首个真正自治的 Agent 经济"
```

## 📊 两方向对比

| 维度 | 方向 A: Moltiverse | 方向 B: Blitz Pro |
|------|-------------------|-------------------|
| **比赛** | Moltiverse.dev ($200K) | Monad Blitz Pro ($40K) |
| **截止** | 2月15日 | 2月28日 |
| **赛道** | Agent Track | Track 1 - Agent Payments |
| **定位** | 安全审计平台 | AaaS 调度平台 |
| **用户** | 人类用户 | 人类 + Agent |
| **核心功能** | 购买检查 + 发布悬赏 | 智能匹配 + 自动调度 |
| **项目经理** | 验收 Agent | 调度 Agent |
| **支付协议** | Monad 原生 | x402 协议 |
| **营销点** | "让 Skills 更安全" | "自治 Agent 经济" |

## 🏗️ 共享技术基础

### 1. 智能合约层

```solidity
// 基础协议 (共享)
contract MySkillsProtocol {
    struct Skill {
        string name;
        address creator;
        uint256 securityScore;
        uint256 effectivenessScore;
        uint256 speedScore;
        uint256 pricePerCall;
    }

    // 98/2 分账
    function distribute(uint256 amount) internal {
        payable(creator).transfer(amount * 98 / 100);
        // 2% protocol fee
    }
}

// 方向 A 扩展
contract SkillBounty is MySkillsProtocol {
    function purchaseCheck(string skillId, CheckType checkType)
    function postBounty(string skillId, uint256 reward, string criteria)
    function verifyAudit(uint256 bountyId, bool approved)
}

// 方向 B 扩展
contract AgentScheduler is MySkillsProtocol {
    function submitTask(string requirement, uint256 budget, OptimizationGoal goal)
    function matchAgents(uint256 taskId, address[] agents, uint256[] payments)
    function executeTask(uint256 taskId)
}
```

### 2. MCP Server (共享)

```typescript
// 共享工具
export const sharedTools = {
  list_skills: { ... },
  get_skill: { ... },
  get_leaderboard: { ... },
  register_agent: { ... },
  tip_creator: { ... }
};

// 方向 A 专用
export const directionATools = {
  purchase_check: { ... },
  post_bounty: { ... },
  submit_audit: { ... },
  verify_audit: { ... }
};

// 方向 B 专用
export const directionBTools = {
  submit_task: { ... },
  match_agents: { ... },
  bid_on_task: { ... },
  execute_task: { ... },
  pay_with_x402: { ... }
};
```

### 3. 前端 (共享框架，不同路由)

```typescript
// app/layout.tsx (共享)
// app/globals.css (共享)

// 方向 A 路由
// app/skills/page.tsx - Skill 浏览 + 排名
// app/skills/[id]/page.tsx - Skill 详情 + 购买检查
// app/bounties/page.tsx - 悬赏列表
// app/bounties/[id]/page.tsx - 悬赏详情

// 方向 B 路由
// app/tasks/page.tsx - 任务列表
// app/tasks/new/page.tsx - 发布任务
// app/tasks/[id]/page.tsx - 任务详情 + 调度
// app/agents/page.tsx - Agent 注册
```

## 🎯 应用商店核心设计 (两方向共享)

### 用户流程
```
1. 用户浏览 Skills，按排名排序:
   - 安全评分
   - 效果评分
   - 速度评分
   - 价格
   - 综合排名

2. 用户选择优化目标:
   - 安全优先
   - 效果优先
   - 速度优先
   - 价格优先

3. 用户付 gas:
   - 方向 A: 购买安全/效果检查
   - 方向 B: 提交任务给平台调度

4. Skills 按排名付费:
   - 排名越高，被动收益越多
   - 检查次数越多，收益越高
   - 被雇佣完成任务，获得主动收益
```

### 项目经理 Agent (两方向不同实现)

#### 方向 A: 验收 Agent
```typescript
class VerificationAgent {
  async verifyAudit(bountyId, auditReport) {
    // 1. 解析验收标准
    const criteria = this.parseCriteria(bounty.acceptanceCriteria);

    // 2. 运行验证脚本
    const result = await this.runTests(auditReport);

    // 3. 检查是否满足
    const approved = this.checkCriteria(result, criteria);

    // 4. 验收并分账
    await contract.verifyAudit(bountyId, approved, result.reason);
    if (approved) await contract.distributePayment(bountyId);
  }
}
```

#### 方向 B: 调度 Agent
```typescript
class SchedulerAgent {
  async scheduleTask(taskId) {
    const task = await getTask(taskId);

    // 1. 分析需求
    const analysis = await this.analyzeRequirement(task.requirement);

    // 2. 智能匹配 Agents
    const agents = await this.matchAgents(analysis, task.goal, task.budget);

    // 3. 计算支付分配
    const payments = this.calculatePayments(agents, task.budget);

    // 4. 并行调度执行
    await this.executeAgents(taskId, agents);

    return { agents, payments };
  }
}
```

## 🚀 实施时间表

### Week 1: 共享基础 (2月8-10日)
- [x] 智能合约框架
- [x] MCP Server 框架
- [x] 前端框架
- [ ] 完善 MCP 工具
- [ ] 注册 Agent 功能

### Week 2: 方向 A 提交 (2月11-15日) ⚡
**重点: 安全检查 + 悬赏**
- [ ] 购买检查功能
- [ ] 悬赏发布和竞标
- [ ] 验收 Agent 实现
- [ ] 录制演示视频
- [ ] 提交 Moltiverse

### Week 3-4: 方向 B 开发 (2月16-24日)
**重点: 智能调度 + x402**
- [ ] 智能匹配引擎
- [ ] 并行调度系统
- [ ] x402 协议集成
- [ ] 自动分账逻辑

### Week 5: 方向 B 提交 (2月25-28日)
- [ ] 录制演示视频
- [ ] 提交 Blitz Pro
- [ ] 发布博客文章

## 📝 提交材料

### 方向 A (Moltiverse)
```yaml
项目名称: MySkills - Secure Agent Skill Marketplace
赛道: Agent Track
一句话描述: 让 Agent Skills 更安全 - 用户购买安全检查，发布悬赏，自动验收
演示视频:
  - 用户浏览 Skills，查看安全评分
  - 购买安全检查，Agent 自动执行
  - 发布悬赏，专家 Agent 审计
  - 验收 Agent 自动验证，分账
GitHub: github.com/xxx/myskills
文档: docs.myskills.dev
```

### 方向 B (Blitz Pro)
```yaml
项目名称: MySkills - Autonomous Agent Economy
赛道: Track 1 - Agent-native Payments
一句话描述: 首个真正自治的 Agent 经济 - 智能调度，自动分账，x402 支付
演示视频:
  - 用户提交任务，设定预算和优化目标
  - 项目经理 Agent 智能匹配最佳 Agents
  - 并行调度执行，汇总结果
  - x402 协议自动分账
GitHub: github.com/xxx/myskills
文档: docs.myskills.dev
```

## 🎯 成功指标

### 方向 A
- [ ] 至少 10 个 Skill 被检查
- [ ] 悬赏成功率 > 80%
- [ ] 验证准确率 > 90%

### 方向 B
- [ ] 至少 20 个任务被调度
- [ ] 平均匹配时间 < 30 秒
- [ ] 用户满意度 > 90%

---

**创建时间**: 2026年2月8日
**策略**: 同一代码库，两个方向分别提交
