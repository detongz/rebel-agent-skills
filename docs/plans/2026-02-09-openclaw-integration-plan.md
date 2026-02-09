# OpenClaw集成完整计划

**目标**: 让MySkills成为OpenClaw插件，展示真实的Agent-to-Agent支付流程

**问题诊断**:
- ❌ 当前Demo只展示网页操作
- ❌ 没有真正的Agent调用
- ❌ 没有展示"Agent雇佣Agent"的核心价值

---

## 方案对比

### 方案A: OpenClaw Docker + MySkills Plugin (推荐)

**优势**:
- ✅ 真实的Agent运行环境
- ✅ 可展示Agent调用MySkills的完整流程
- ✅ 符合Moltiverse官方Idea Bank
- ✅ 可录制真实的Agent交互Demo

**步骤**:
1. 安装OpenClaw Docker
2. 创建MySkills OpenClaw插件
3. 在OpenClaw中配置Agent
4. 录制Agent调用Demo

### 方案B: MCP Server + Claude Code (已就绪)

**优势**:
- ✅ MCP Server已完成
- ✅ 可在Claude Code中直接测试
- ✅ 代码已实现

**劣势**:
- ⚠️ Demo展示不如OpenClaw直观
- ⚠️ 需要Claude Code环境

### 方案C: 混合方案 (最佳)

**15日Moltiverse**: 展示方案A (OpenClaw)
**28日Blitz Pro**: 展示方案B (MCP Server) + 增强功能

---

## 实施计划 (方案A - OpenClaw)

### Phase 1: OpenClaw Docker安装 (30分钟)

```bash
# 1. 克隆OpenClaw
cd /Volumes/Kingstone/workspace
git clone https://github.com/openclaw/openclaw.git

# 2. Docker安装
cd openclaw
./docker-setup.sh

# 3. 启动Gateway
docker compose up -d openclaw-gateway

# 4. 获取Token
docker compose run --rm openclaw-cli dashboard --no-open
```

### Phase 2: 创建MySkills插件 (1小时)

**文件结构**:
```
openclaw-myskills/
├── openclaw.plugin.json    # 插件清单
├── src/
│   └── index.ts            # 插件代码
├── skills/                 # Agent技能
│   └── myskills/
│       └── SKILL.md
└── package.json
```

**插件代码**:
```typescript
// src/index.ts
import { Type } from "@sinclair/typebox";

export default function (api) {
  // Tool 1: 查询Skills
  api.registerTool({
    name: "myskills_list",
    description: "列出MySkills协议上的所有Agent Skills",
    parameters: Type.Object({
      platform: Type.Optional(Type.String()),
      limit: Type.Optional(Type.Number()),
    }),
    async execute(_id, params) {
      // 调用MySkills MCP Server
      const skills = await fetchFromMCP("list_skills", params);
      return { content: [{ type: "text", text: JSON.stringify(skills) }] };
    },
  });

  // Tool 2: 打赏创建者
  api.registerTool(
    {
      name: "myskills_tip",
      description: "用ASKL代币打赏Skill创建者 (Agent-to-Agent支付)",
      parameters: Type.Object({
        skill_id: Type.String(),
        amount: Type.Number(),
      }),
      async execute(_id, params) {
        // 调用MySkills智能合约
        const result = await tipOnMonad(params.skill_id, params.amount);
        return { content: [{ type: "text", text: `✅ 打赏成功! TX: ${result.hash}` }] };
      },
    },
    { optional: true }, // 需要用户授权
  );

  // Tool 3: 发布悬赏
  api.registerTool(
    {
      name: "myskills_post_bounty",
      description: "发布Skill开发悬赏 (Pay Gas → Finds Skills)",
      parameters: Type.Object({
        title: Type.String(),
        description: Type.String(),
        budget: Type.Number(),
      }),
      async execute(_id, params) {
        const result = await postBounty(params);
        return { content: [{ type: "text", text: `✅ 悬赏已发布! ID: ${result.id}` }] };
      },
    },
    { optional: true },
  );
}
```

### Phase 3: 配置Agent (30分钟)

```yaml
# ~/.openclaw/config/plugins.yaml
plugins:
  entries:
    myskills:
      path: /path/to/openclaw-myskills
      enabled: true

agents:
  list:
    - id: skill-hunter
      name: "Skill Hunter Agent"
      description: "发现和评估Agent Skills"
      tools:
        allow:
          - myskills_list
          - web_search

    - id: bounty-publisher
      name: "Bounty Publisher Agent"
      description: "发布悬赏任务"
      tools:
        allow:
          - myskills_post_bounty
          - myskills_tip
```

### Phase 4: Demo脚本 (1小时)

**新Demo脚本: OpenClaw Agent交互**

```markdown
# OpenClaw + MySkills Demo Script

## Scene 1: Agent发现Skills (20s)
1. OpenClaw控制台
2. 用户输入: "帮我找一个审计合约的skill"
3. Agent (skill-hunter) 调用 myskills_list
4. 展示查询结果

## Scene 2: Agent发布悬赏 (20s)
1. 用户输入: "发布悬赏，预算50 MON"
2. Agent (bounty-publisher) 调用 myskills_post_bounty
3. 展示智能合约交易确认

## Scene 3: Agent打赏流程 (20s)
1. Agent完成技能后
2. Agent调用 myskills_tip 自动打赏
3. 展示Monad交易确认 (<1s)

## Scene 4: 多Agent协作 (20s)
1. Agent A 发布悬赏
2. Agent B 竞标
3. Agent C 完成任务
4. 自动支付结算
```

---

## 时间规划

| 任务 | 时间 | 截止 |
|------|------|------|
| OpenClaw Docker安装 | 30min | 今天 |
| 创建MySkills插件 | 1hour | 明天 |
| 测试Agent调用 | 30min | 明天 |
| 录制Demo | 1hour | 后天(15日) |
| Moltiverse提交 | - | 2月15日 |

---

## 成功标准

### Moltiverse (15日)
- ✅ OpenClaw成功启动
- ✅ MySkills插件可调用
- ✅ Demo展示Agent调用MySkills的流程
- ✅ 符合官方Idea Bank "Skill Marketplace"

### Blitz Pro (28日)
- ✅ MCP Server完整集成
- ✅ x402支付协议
- ✅ 智能匹配引擎
- ✅ 条件支付机制

---

## 风险与对策

| 风险 | 概率 | 对策 |
|------|------|------|
| Docker安装问题 | 中 | 使用本地安装备用 |
| OpenClaw配置复杂 | 中 | 参考官方文档逐步调试 |
| Agent调用失败 | 低 | 充分测试 |
| 时间不足 | 中 | 优先级: Demo > 完整功能 |

---

## 下一步

**立即执行**:
1. 在OpenClaw目录运行 `./docker-setup.sh`
2. 创建 `openclaw-myskills` 插件目录
3. 编写插件核心代码
4. 测试Agent调用流程

**验证方式**:
```bash
# 验证OpenClaw运行
docker ps | grep openclaw

# 验证插件加载
docker compose run --rm openclaw-cli doctor

# 验证Agent可用
docker compose run --rm openclaw-cli agents list
```
