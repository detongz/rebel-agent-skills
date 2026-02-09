# MySkills 应用商店设计 - 完整版

## 核心概念

**应用商店 + 项目经理市场 + Agent 雇佣平台**

```
用户选择 Skills → 付 gas 费用于安全/效果检查 → Skills 按排名付费
                    ↓
            用户付 gas 给每个结果
                    ↓
        项目经理模式：雇佣 Agent 完成任务
        - 安全优先 Agent
        - 效果优先 Agent
        - 最快 Agent
        - 最便宜 Agent
        - 甚至雇佣人类完成任务
```

---

## 🛒 应用商店功能

### 1. Skill 浏览与选择
```
用户浏览 Skills，可以按以下维度排序：
- 安全评分
- 效果评分
- 速度评分
- 价格
- 综合排名
```

### 2. 付费检查机制
用户可以付费购买：
- **安全审计** - 检查 Skill 代码安全
- **效果验证** - 验证 Skill 是否声称的效果
- **性能测试** - 测试 Skill 运行速度

### 3. Skills 按排名付费
- 排名越高的 Skill，获得更多收益
- 用户检查次数 = 收益
- 激励 Skill 提升质量

---

## 👔 项目经理角色 (核心创新)

### 用户视角
```
1. 用户提出需求："帮我审计这个智能合约"
2. 用户设定预算：50 MON
3. 用户选择优化目标：
   - 安全优先
   - 效果优先
   - 速度优先
   - 价格优先
4. 用户付 gas 给任务结果
```

### 平台自动调度
```
根据用户选择，平台自动匹配：

【安全优先】
- Agent A (安全评分 95): 30 MON
- Agent B (安全评分 90): 15 MON
- Agent C (人工验证): 5 MON

【效果优先】
- Agent D (效果评分 98): 40 MON
- Agent E (效果评分 92): 20 MON

【速度优先】
- Agent F (响应时间 <30s): 25 MON
- Agent G (响应时间 <1min): 15 MON

【价格优先】
- Agent H (价格 5 MON): 5 MON
- Agent I (价格 10 MON): 10 MON
```

### 执行与分账
- Agents 并行或串行执行任务
- 用户确认结果后自动分账
- 平台收取 2% 手续费

---

## 🤖 Agent 也可以雇佣人类

**关键创新**: Agent 不只是雇佣 Agent，还可以雇佣人类完成任务

```
场景：Agent 无法完成的任务
- 现场调研
- 人工测试
- 创意设计
- 复杂决策

Agent 雇佣人类 → 人类完成任务 → Agent 验收 → 用户付费 → 分账
```

---

## 💰 收益模型

### Skill 创作者收益
```
1. 被动收益：用户检查技能时自动付费
   - 每次安全检查: 0.1 MON
   - 每次效果验证: 0.05 MON
   - 检查次数越多，收益越高

2. 主动收益：被雇佣完成任务
   - 作为"安全优先 Agent"被雇佣
   - 作为"效果优先 Agent"被雇佣
   - 按任务复杂度定价

3. 排名奖励：排名越高，被动收益越多
   - 铂金级: 每次 0.2 MON
   - 黄金级: 每次 0.1 MON
   - 白银级: 每次 0.05 MON
```

### 平台收益
- 每笔交易的 2% 手续费
- 项目经理服务的 5% 服务费
- 高级功能订阅 (可选)

---

## 🏗️ 技术架构

### 智能合约层
```solidity
contract MySkillsMarketplace {
    // Skill 注册
    struct Skill {
        string name;
        address creator;
        uint256 securityScore;    // 安全评分 0-100
        uint256 effectivenessScore; // 效果评分 0-100
        uint256 speedScore;         // 速度评分 0-100
        uint256 pricePerCheck;      // 每次检查价格
        SkillRank rank;             // 排名
    }

    // 检查购买
    struct CheckPurchase {
        string skillId;
        CheckType checkType;      // SECURITY | EFFECTIVENESS | SPEED
        address buyer;
    }

    // 任务发布
    struct Task {
        address user;
        string requirement;
        uint256 budget;
        OptimizationGoal goal; // SECURITY | EFFECTIVENESS | SPEED | COST
        TaskStatus status;
    }

    // Agent 执行
    struct AgentExecution {
        address agent;
        uint256 bid;
        ExecutionResult result;
    }

    function purchaseCheck(string skillId, CheckType checkType)
    function postTask(string requirement, uint256 budget, OptimizationGoal goal)
    function agentsBid(string taskId, uint256 bid)
    function executeTask(string taskId, address chosenAgent)
    function distributePayment(string taskId)
}
```

### MCP Server 暴露的工具
```
1. list_skills - 浏览所有 Skills
2. get_skill_ranking - 获取技能排名
3. purchase_check - 购买检查服务
4. post_task - 发布项目经理任务
5. bid_on_task - Agent 竞标任务
6. execute_task - 执行任务
7. verify_result - 验证结果
```

---

## 📊 用户体验流程

### 场景 1: 用户购买安全检查
```
1. 用户浏览 Skills，发现 "Solidity Auditor"
2. 查看安全评分: 95/100 (铂金级)
3. 点击"购买安全检查" - 价格 0.2 MON
4. 付 gas
5. Agent 自动执行安全检查
6. 30秒后收到检查报告
7. Skill 创作者收到 0.196 MON (98%)
```

### 场景 2: 用户发布项目经理任务
```
1. 用户: "帮我审计这个合约，预算 50 MON，安全优先"
2. 平台匹配:
   - Agent A (安全 95): 30 MON
   - Agent B (人工验证): 10 MON
   - Agent C (二次验证): 5 MON
3. 用户确认分配，付 gas
4. Agents 执行任务
5. 用户确认结果
6. 自动分账给各 Agents
```

---

## 🎯 与 A/B 方向的关系

这个完整设计实际上是 **方向 A + 方向 B 的融合**：

### 方向 A (安全检测+悬赏)
- ✅ 安全审计功能
- ✅ 悬赏市场
- ✅ 验收闭环
- **新增**: Skills 按排名付费

### 方向 B (AaaS 代理平台)
- ✅ 智能匹配
- ✅ 自动调度
- ✅ 支付分账
- ✅ Agent 雇佣 (包括人类)

---

## 🚀 实施优先级

### MVP (最小可行产品)
1. ✅ Skills 基础注册
2. ✅ 简单的付费检查
3. ✅ 基础排名系统

### Phase 1: 应用商店
1. Skills 展示与排名
2. 付费检查功能
3. Skill 创作者收益

### Phase 2: 项目经理
1. 用户发布任务
2. Agent 竞标
3. 自动分配与分账

### Phase 3: Agent 雇佣人类
1. 人类服务者注册
2. Agent 调度人类
3. 结果验证

---

**更新时间**: 2026年2月8日
**基于**: 线下反馈 + 用户设计思路
