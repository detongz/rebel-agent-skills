# Moltiverse 资源快速参考

## 🎯 核心文档 (最常用)

### 1. Monad 开发
**[monad-agents.md](./monad-agents.md)**
- Agent Faucet: `curl -X POST https://agents.devnads.com/v1/faucet -d '{"chainId": 10143, "address": "0x..."}'`
- Agent Verification API (验证所有浏览器)
- Monad Testnet: Chain 10143, RPC: https://testnet-rpc.monad.xyz

### 2. x402 支付协议 ⭐
**[doc-15-x402-guide.md](./doc-15-x402-guide.md)**
- HTTP 402 Payment Required for AI agents
- Facilitator: https://x402-facilitator.molandak.org
- Perfect for direction B (AaaS 平台)

### 3. MCP 服务器
**[doc-16-monad-mcp.md](./doc-16-monad-mcp.md)**
- Model Context Protocol for AI agents
- 让 Agent 能查询/支付 Skills
- 已创建框架在 `packages/mcp-server/`

### 4. OpenClaw Skill
**[openclaw-monad-skill.md](./openclaw-monad-skill.md)**
- npx clawhub install monad-development
- Agent 开发工具包

### 5. Moltbook 集成
**[moltbook-skill.md](./moltbook-skill.md)**
- Agent 社交网络
- Sign in with Moltbook
- API: https://www.moltbook.com/api/v1

### 6. Nad.fun Token Launch
**[nad-fun-llms.txt](./nad-fun-llms.txt)**
- 代币发射平台
- Bonding curves → Uniswap V3
- Agent API: https://nad.fun/agent-api.md

**[doc-2-How-to-launch-a-token-on-Nad-f.md](./doc-2-How-to-launch-a-token-on-Nad-f.md)** ⭐ 已修复
- Nad.fun OpenClaw 使用指南
- 如何用 OpenClaw 发布代币

### 7. Circle Wallets
**[doc-4-circle-wallet.md](./doc-4-circle-wallet.md)** ⭐ 已修复
- Circle Wallet ClawHub Skill
- USDC 钱包操作
- 21 条支持的区块链

---

## 📋 比赛信息

### Moltiverse.dev
- **奖金**: $200K (16 × $10K + 1 × $40K)
- **截止**: 2月15日
- **赛道**: Agent Track
- **提交**: 方向 A (安全检测+悬赏)

### Monad Blitz Pro
- **奖金**: $40K ($20K现金 + $20K资源)
- **截止**: 2月28日 (注册 2月15日)
- **赛道**: Track 1 - Agent-native Payments & Infrastructure
- **提交**: 方向 B (AaaS 代理平台)

---

## 🚀 方向 A vs 方向 B

| 维度 | 方向 A: 安全检测+悬赏 | 方向 B: AaaS 代理平台 |
|------|---------------------|-------------------|
| **定位** | 垂直安全审计平台 | 智能调度代理平台 |
| **提交** | Moltiverse (2/15) | Blitz Pro (2/28) |
| **核心功能** | 悬赏 + 验收闭环 | 智能匹配 + 自动分账 |
| **关键技术** | 安全扫描 | x402 + Monad |
| **营销点** | "让 Agent Skills 更安全" | "首个真正自治的 Agent 经济" |

---

## 📁 项目状态

### 已完成
- ✅ 智能合约 (Monad Testnet)
- ✅ Web 前端 (Next.js + RainbowKit)
- ✅ CLI 工具
- ✅ 两个版本 Pitch

### 进行中
- ⏳ MCP Server (框架已创建)
- ⏳ OpenClaw Skill

### 待完成
- ⏳ 方向 A: 安全审计功能
- ⏳ 方向 B: 智能匹配引擎
- ⏳ x402 集成
- ⏳ 演示视频

---

## 🔗 关键链接

- **Moltiverse**: https://moltiverse.dev/
- **Monad Docs**: https://docs.monad.xyz
- **Moltbook**: https://www.moltbook.com
- **Nad.fun**: https://nad.fun
- **OpenClaw**: https://www.clawhub.ai
- **x402 Facilitator**: https://x402-facilitator.molandak.org

---

**更新时间**: 2026年2月8日
**状态**: 准备就绪，等待开始开发
