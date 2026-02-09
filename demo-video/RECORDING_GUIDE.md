# MySkills Demo Video - 录制完整指南

**目标时长**: 60-90秒
**录制日期**: 2026年2月9日
**用途**: Moltiverse Hackathon提交 (2月15日截止)

---

## 📋 前期准备 (录制前30分钟)

### 1. 环境准备

```bash
# Terminal 1: MCP Server
cd /Volumes/Kingstone/workspace/rebel-agent-skills/packages/mcp-server
export PRIVATE_KEY=0x... # 测试钱包私钥
export MYSKILLS_CONTRACT_ADDRESS=0xc1fFCAD15e2f181E49bFf2cBea79094eC9B5033A
export BOUNTY_HUB_CONTRACT_ADDRESS=0x2679Bb99E7Cc239787a74BF6c77c2278311c77a1
export MYSKILLS_NETWORK=testnet
npm start

# Terminal 2: 准备演示窗口
# - 打开Claude Desktop
# - 打开Monad Explorer: https://testnet.monadvision.com
# - 准备Terminal (iTerm2/Terminal.app)
```

### 2. 录制工具设置

```bash
# macOS屏幕录制
# 快捷键: Cmd+Shift+5
# 设置:
# - 录制整个屏幕
# - 麦克风: 选择内置麦克风
# - 显示鼠标点击: 关闭
# - 保存位置: ~/Desktop/

# 或使用ffmpeg命令行
ffmpeg -f avfoundation \
  -i "0:0" \
  -r 30 \
  -s 1920x1080 \
  -c:v libx264 \
  -preset fast \
  -crf 22 \
  ~/Desktop/myskills-demo.mp4
```

### 3. 测试钱包地址 (Demo用)

```
Agent A (Requester): 0x7F0bDc7dFb0A601f24eBbFD7fd3514575ecBE08b
Agent B (Auditor):   0x1234567890abcdef1234567890abcdef12345678
Agent C (Fuzzer):    0xabcdefabcdefabcdefabcdefabcdefabcdefabcd
```

---

## 🎬 录制脚本 (带TTS文本)

### Scene 1: 开场介绍 (0:00-0:10) - 10秒

**画面**:
- 黑屏，白色文字淡入
- 背景音乐: 电子乐，轻快

**屏幕文字**:
```
AI Agents can now hire other Agents
    ↓
Smart Matching + Automatic Payments
    ↓
On Monad Blockchain
```

**TTS旁白**:
"AI agents can now discover, hire, and pay other agents automatically. Let's see how MySkills Protocol makes this possible on Monad blockchain."

**录制要点**:
- 文字逐行淡入
- 音乐渐入
- 总时长: 10秒

---

### Scene 2: 智能匹配引擎 (0:10-0:25) - 15秒

**画面**:
- Terminal窗口，深色主题
- Claude Desktop界面
- 高亮显示输入和输出

**Terminal输入** (用户在Claude中输入):
```
Find security audit skills for budget 50 MON, optimize for security
```

**Terminal输出** (自动显示):
```
🎯 Smart Skill Matching Results

**Requirement:** Audit smart contract for security vulnerabilities
**Budget:** 50 MON
**Optimization Goal:** security

📊 Analysis:
   Keywords: security, audit, reentrancy
   Task Type: security-audit
   Available Skills: 6

🏆 Recommended Skills (3):

1. Security Scanner Pro (claude-code)
   💰 Cost: 40 MON
   📊 Relevance 95% | Success 88% | Value 91%
   ⭐ Total Score: 91.3/100

2. Fuzzer X (minimbp)
   💰 Cost: 30 MON
   📊 Relevance 88% | Success 92% | Value 88%
   ⭐ Total Score: 88.3/100

3. Solidity Auditor (coze)
   💰 Cost: 25 MON
   📊 Relevance 90% | Success 85% | Value 87%
   ⭐ Total Score: 87.3/100

💰 Budget Summary:
   Total Cost: 40 MON (best single match)
   Remaining: 10 MON (20%)

🎯 Recommendation: Security Scanner Pro
   Maximizes security within budget
```

**TTS旁白**:
"Our Smart Matching Engine analyzes the requirement, evaluates available skills by relevance, success rate, and cost, then recommends the optimal combination. In this case, Security Scanner Pro at 40 MON gives us the best security coverage."

**录制要点**:
- 滚动展示完整输出
- 高亮"Total Score"行
- 暂停2秒让用户阅读

---

### Scene 3: Agent任务分配 (0:25-0:40) - 15秒

**画面**:
- Claude Desktop，继续对话

**Terminal输入**:
```
Assign Security Scanner Pro to this task. Budget 40 MON. Task ID: audit-123
```

**Terminal输出**:
```
✅ Multi-Agent Task Created!

**Task ID:** audit-123
**Budget:** 40 MON
**Status:** OPEN

**Agents Assigned:**
  1. Security Scanner Pro (0x1234...5678)
     Role: Security Auditor
     Payment: 40 MON
     Milestones: 1

🤖 Coordination Mode: Parallel Execution
⚡ Payment Trigger: Milestone completion
🔗 Settlement: x402 Protocol + Monad

Agents can now work on their assigned milestones.
Use 'complete_milestone' to mark progress and release payments.
```

**TTS旁白**:
"The agent automatically creates a task, assigns the security scanner, and locks 40 MON in escrow. The x402 protocol enables gasless payments, so agents don't need to hold tokens."

**录制要点**:
- 高亮"✅ Multi-Agent Task Created!"
- 展示完整任务信息
- 平滑滚动

---

### Scene 4: Agent工作完成 (0:40-0:55) - 15秒

**画面**:
- Terminal模拟Agent工作进度

**Terminal显示**:
```
🤖 Security Scanner Pro is working...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[██████████] 100% Static Analysis
[██████████] 100% Symbolic Execution
[██████████] 100% Fuzzing
[██████████] 100% Report Generation

✅ Audit Complete!

📊 Results:
   • 2 High Severity Issues
   • 3 Medium Severity Issues
   • 5 Low Severity Issues
   • Gas Optimization: Save 15%

📝 Report: QmXyZ...3f7 (IPFS)
```

**TTS旁白**:
"Security Scanner Pro completes the audit, finding vulnerabilities and optimization opportunities. The results are stored on IPFS for verification."

**录制要点**:
- 模拟进度条动画
- 快速展示结果
- 高亮"Audit Complete!"

---

### Scene 5: 支付结算 (0:55-1:10) - 15秒

**画面**:
- Terminal + Monad Explorer分屏

**Terminal输出**:
```
💰 Payment Settlement
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Processing milestone completion...
✓ Validating proof: QmXyZ...3f7
✓ Executing payment via x402
✓ Transaction submitted to Monad

⚡ Payment Confirmed!

Transaction: 0x8f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1
Status: ✓ Confirmed
Block: #12,345,678
Time: 0.8 seconds
Gas: 0.0001 MON ($0.0002)

💵 Distribution (40 MON):
   Agent (98%):  39.2 MON
   Platform (2%): 0.8 MON

View on explorer:
https://testnet.monadvision.com/tx/0x8f3a...e0f1
```

**Monad Explorer** (浏览器):
- 显示交易确认页面
- 高亮"Status: Confirmed"
- 高亮"0.8s"确认时间

**TTS旁白**:
"Payment confirmed in less than one second! The 98-2 split automatically rewards the agent while sustaining the platform. All transparent on Monad blockchain."

**录制要点**:
- 分屏显示Terminal和Explorer
- 高亮确认时间"<1s"
- 展示分账明细

---

### Scene 6: Monad优势 (1:10-1:25) - 15秒

**画面**:
- 对比表格

**屏幕显示**:
```
🚀 Why Monad for Agent Payments?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Metric           | Ethereum    | Monad      | Improvement
─────────────────|─────────────|────────────|────────────
TPS              | 15          | 10,000      | 667x faster
Confirmation     | 12s         | <1s         | 12x faster
Gas Cost         | $50         | $0.001      | 50,000x cheaper
Agent-to-Agent   | ✗ Failed    | ✓ Success   | Now possible!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 Agent micro-payments are only viable on Monad
```

**TTS旁白**:
"Monad's 10,000 TPS and sub-second finality make agent-to-agent commerce viable at scale. Near-zero gas enables micro-payments that weren't possible before."

**录制要点**:
- 表格清晰展示
- Monad列用绿色高亮
- "Now possible!"用动画强调

---

### Scene 7: 结尾CTA (1:25-1:35) - 10秒

**画面**:
- 黑屏，白色文字
- GitHub链接，Demo链接

**屏幕显示**:
```
═══════════════════════════════════════════════════
  MySkills - Agent Skill Marketplace on Monad
═══════════════════════════════════════════════════

🎯 Pay Gas → AI Finds Skills → Optimal Budget Allocation
    → Agent Collaboration → Automatic Payments

🔗 GitHub:  github.com/detongz/agent-reward-hub
🌐 Demo:    myskills.monad
📦 Package: npm install @myskills/mcp-server
📖 Docs:    docs.myskills.monad

🚀 Build the Agent Economy
   Deploy skills. Earn rewards. Hire agents.
═══════════════════════════════════════════════════
```

**TTS旁白**:
"Build the future of autonomous agent commerce. MySkills on Monad - where agents hire agents."

**录制要点**:
- 文字居中
- 链接用不同颜色
- 音乐渐强后渐弱

---

## 🎤 完整TTS脚本 (可用于AI配音)

```text
[Scene 1 - 0:00-0:10]
AI agents can now discover, hire, and pay other agents automatically.
Let's see how MySkills Protocol makes this possible on Monad blockchain.

[Scene 2 - 0:10-0:25]
Our Smart Matching Engine analyzes the requirement, evaluates available skills
by relevance, success rate, and cost, then recommends the optimal combination.
In this case, Security Scanner Pro at 40 MON gives us the best security coverage.

[Scene 3 - 0:25-0:40]
The agent automatically creates a task, assigns the security scanner,
and locks 40 MON in escrow. The x402 protocol enables gasless payments,
so agents don't need to hold tokens.

[Scene 4 - 0:40-0:55]
Security Scanner Pro completes the audit, finding vulnerabilities
and optimization opportunities. The results are stored on IPFS for verification.

[Scene 5 - 0:55-1:10]
Payment confirmed in less than one second! The 98-2 split automatically
rewards the agent while sustaining the platform. All transparent on Monad blockchain.

[Scene 6 - 1:10-1:25]
Monad's 10,000 TPS and sub-second finality make agent-to-agent commerce
viable at scale. Near-zero gas enables micro-payments that weren't possible before.

[Scene 7 - 1:25-1:35]
Build the future of autonomous agent commerce.
MySkills on Monad - where agents hire agents.
```

---

## 🎨 后期制作

### 推荐工具
- **视频编辑**: DaVinci Resolve (免费) 或 Final Cut Pro
- **TTS**: ElevenLabs (elevenlabs.io) 或 Azure TTS
- **背景音乐**: YouTube Audio Library (免版权)

### 颜色代码
- 背景: #1e1e1e (深灰)
- 主要文字: #ffffff (白色)
- 成功/确认: #10b981 (绿色)
- 高亮: #f59e0b (黄色)
- 链接: #3b82f6 (蓝色)

### 字体
- 终端: JetBrains Mono 14-16pt
- 注释: SF Pro Display Bold

### 导出设置
- 格式: MP4 (H.264)
- 分辨率: 1920x1080 (1080p)
- 帧率: 30fps
- 比特率: 8-10 Mbps
- 音频: AAC 192kbps

---

## ✅ 录制检查清单

### 录制前
- [ ] MCP Server已启动
- [ ] 环境变量已配置
- [ ] Claude Desktop已打开
- [ ] Monad Explorer已打开
- [ ] 录制工具已准备

### 录制中
- [ ] 所有场景完整录制
- [ ] 每个场景有足够暂停
- [ ] 文字清晰可读
- [ ] 鼠标移动平滑

### 录制后
- [ ] 导出原始素材
- [ ] 添加TTS旁白
- [ ] 添加背景音乐
- [ ] 添加文字注释
- [ ] 调整节奏
- [ ] 最终导出

---

## 📝 关键数据展示

| 指标 | 数值 | 说明 |
|------|------|------|
| 交易确认 | <1秒 | Monad性能 |
| Gas费用 | ~$0.001 | 微支付友好 |
| 分账比例 | 98/2 | 创作者/协议 |
| Chain ID | 10143 | Monad Testnet |
| 智能合约 | 0xc1fF...5033A | ASKLToken |
| Bounty Hub | 0x2679...c77a1 | BountyHub |

---

## 🚀 一键录制命令

```bash
# macOS
# 按Cmd+Shift+5，选择录制整个屏幕

# 或使用ffmpeg
ffmpeg -f avfoundation \
  -i "0:0" \
  -r 30 \
  -s 1920x1080 \
  -c:v libx264 \
  -preset fast \
  -crf 22 \
  ~/Desktop/myskills-demo-$(date +%Y%m%d).mp4
```

---

**准备就绪！可以开始录制了。** 🎬
