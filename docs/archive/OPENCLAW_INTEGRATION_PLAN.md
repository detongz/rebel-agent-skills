# OpenClaw Integration Plan for MySkills

## 📚 OpenClaw 架构理解

### OpenClaw 是什么？
OpenClaw 是一个 AI Agent Gateway（网关），用于管理多个 AI 代理的执行。

### 核心概念

1. **Plugins (插件)**
   - TypeScript 模块，通过 `api.registerTool()` 注册工具
   - 可以注册：Agent Tools、RPC 方法、CLI 命令、HTTP 处理器
   - 插件必须包含 `openclaw.plugin.json` 清单文件

2. **Agent Tools (代理工具)**
   - JSON-Schema 格式的函数定义
   - LLM 在代理运行期间可以调用这些工具
   - 工具有 `execute()` 函数，执行具体业务逻辑

3. **Skills (技能)**
   - AgentSkills 格式的文件夹
   - 教 LLM 如何使用工具
   - 包含 `SKILL.md` 文件

4. **Channels (通道)**
   - 消息平台集成（WhatsApp、Discord、Slack 等）
   - 用户通过通道与 Agent 交互

## 🎯 用户需求

> "OpenClaw可以调用我agent然后paygas来做事情"

**翻译：**
- OpenClaw 可以调用用户的 MySkills Agent
- MySkills Agent 支付 Gas 费用
- 执行任务（链上操作）
- 返回结果给 OpenClaw

## 🛠️ 集成方案

### 方案：创建 OpenClaw Plugin

**Plugin 结构：**
```
openclaw-myskills-plugin/
├── openclaw.plugin.json    # Plugin 清单
├── package.json             # NPM 包配置
├── src/
│   └── index.ts            # Plugin 入口
└── skills/
    └── myskills/
        └── SKILL.md        # Agent 教学文件
```

### 注册的 Agent Tools

| 工具名称 | 描述 | 参数 |
|---------|------|------|
| `myskills_tip_skill` | 打赏技能创作者 | `skillId` (bytes32), `amount` (uint256) |
| `myskills_create_bounty` | 创建链上任务 | `title`, `description`, `reward` |
| `myskills_submit_work` | 提交任务成果 | `bountyId`, `workProof` |
| `myskills_stake_juror` | 质押成为陪审员 | `amount` (uint256) |
| `myskills_cast_vote` | 对争议投票 | `bountyId`, `vote` (boolean) |
| `myskills_get_bounty` | 查询任务详情 | `bountyId` |
| `myskills_list_bounties` | 列出所有任务 | - |

### Gas 支付方式

1. **x402 Protocol** - HTTP 402 支付标准
   - 无需 MetaMask 弹窗
   - 自动 Gas 支付
   - 用户友好的体验

2. **ASKL Token** - 项目原生代币
   - 直接转账支付
   - 需要用户授权

## 📝 Plugin 代码示例

```typescript
// src/index.ts
import { ethers } from 'ethers';

const BOUNTY_HUB_ADDRESS = '0x2679Bb99E7Cc239787a74BF6c77c2278311c77a1';
const ASKL_TOKEN_ADDRESS = '0xc1fFCAD15e2f181E49bFf2cBea79094eC9B5033A';

// ABI fragments (只包含需要的函数)
const BOUNTY_HUB_ABI = [
  'function createBounty(uint256 reward, bytes32 skillId, string calldata title) external',
  'function submitWork(uint256 bountyId, string calldata proof) external',
  'function tipSkill(bytes32 skillId, uint256 amount) external',
  'function getBounty(uint256 bountyId) external view returns (tuple(...))',
];

export default function (api) {
  // 注册工具：创建任务
  api.registerTool({
    name: 'myskills_create_bounty',
    description: 'Create a bounty on MySkills platform with ASKL token reward',
    parameters: {
      type: 'object',
      properties: {
        skillId: {
          type: 'string',
          description: 'Skill identifier (hex string or human-readable name)',
        },
        title: {
          type: 'string',
          description: 'Bounty title',
        },
        reward: {
          type: 'string',
          description: 'Reward amount in ASKL tokens (e.g., "100" for 100 ASKL)',
        },
      },
      required: ['skillId', 'title', 'reward'],
    },
    async execute(_id, params) {
      try {
        // 连接到 Monad testnet
        const provider = new ethers.JsonRpcProvider('https://testnet-rpc.monad.xyz');
        const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
        const bountyHub = new ethers.Contract(BOUNTY_HUB_ADDRESS, BOUNTY_HUB_ABI, wallet);

        // 转换 reward 单位
        const rewardAmount = ethers.parseEther(params.reward);

        // 调用合约 (Gas 由 wallet 支付)
        const tx = await bountyHub.createBounty(
          rewardAmount,
          params.skillId,
          params.title
        );

        // 等待交易确认
        const receipt = await tx.wait();

        return {
          content: [{
            type: 'text',
            text: `✅ Bounty created successfully!\n` +
                  `Transaction: ${receipt.hash}\n` +
                  `Bounty ID: ${receipt.logs[0].topics[1]}\n` +
                  `Gas used: ${receipt.gasUsed.toString()}`,
          }],
        };
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: `❌ Failed to create bounty: ${error.message}`,
          }],
          isError: true,
        };
      }
    },
  });

  // 注册更多工具...
}
```

## 🚀 使用场景示例

### 场景 1：Discord 用户创建任务
```
User (Discord): /create_bounty skill:react fix navigation bug reward:50

OpenClaw Gateway:
  1. 解析命令
  2. 调用 `myskills_create_bounty` 工具
  3. Plugin 调用 MySkills 智能合约
  4. 返回交易结果

Bot (Discord): ✅ Bounty created! Tx: 0x123...
```

### 场景 2：WhatsApp 用户打赏技能
```
User (WhatsApp): Tip 100 ASKL to the react-hooks skill

OpenClaw Agent:
  1. 理解意图
  2. 调用 `myskills_tip_skill` 工具
  3. 执行链上转账
  4. 返回确认

Bot (WhatsApp): ✅ Tipped 100 ASKL! Creator receives 98 ASKL.
```

## 📦 部署方式

### 选项 1：NPM 包发布
```bash
npm publish @myskills/openclaw-plugin
```

用户安装：
```bash
openclaw plugins install @myskills/openclaw-plugin
```

### 选项 2：本地插件
```bash
cp -r openclaw-myskills-plugin ~/.openclaw/extensions/myskills
```

配置：
```json5
// ~/.openclaw/openclaw.json
{
  plugins: {
    entries: {
      myskills: {
        enabled: true,
        config: {
          privateKey: process.env.PRIVATE_KEY,  // 或通过环境变量
          rpcUrl: 'https://testnet-rpc.monad.xyz',
        },
      },
    },
  },
  agents: {
    list: [{
      id: 'main',
      tools: {
        allow: ['myskills_*'],  // 允许所有 MySkills 工具
      },
    }],
  },
}
```

## 🎬 Demo 视频展示

**建议的 Demo 流程：**

1. **展示 OpenClaw Agent 配置**
   - 显示已安装的 MySkills 插件
   - 显示可用的工具列表

2. **Discord/WhatsApp 交互**
   - 用户发送：`/bounty create skill:solidity reward:100 title:Fix smart contract`
   - Agent 调用 MySkills 合约
   - 显示链上交易确认

3. **Gas 支付演示**
   - 展示 x402 无缝支付（无需 MetaMask）
   - 或展示 ASKL Token 授权和转账

4. **查询功能**
   - 查询任务状态
   - 显示排行榜

## ✅ 当前状态

- ✅ OpenClaw 文档已下载到 `docs/openclawdoc/`
- ✅ 理解了 Plugin 和 Agent Tools 机制
- ✅ MySkills 智能合约已部署到 Monad testnet
- ⏳ 需要创建 OpenClaw Plugin 代码
- ⏳ 需要测试集成

## 🤔 讨论问题

1. **Gas 费用由谁支付？**
   - OpenClaw 插件使用统一的私钥？（中心化风险）
   - 用户通过 x402 支付？（更好，但需要 x402 集成）

2. **插件如何签名交易？**
   - 使用环境变量中的私钥？
   - 集成 x402 协议自动支付？

3. **Demo 视频重点展示什么？**
   - OpenClaw Agent 通过自然语言创建任务？
   - Gas 自动支付（x402）？
   - 跨平台操作（Discord/WhatsApp）？

请确认这个方向是否正确，然后我开始实现 Plugin 代码！
