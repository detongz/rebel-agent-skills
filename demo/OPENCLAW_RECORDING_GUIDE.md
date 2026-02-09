# MySkills Demo 录制指南 - 使用 OpenClaw

## 🎯 目标
录制 60-90 秒演示视频，展示 MySkills Protocol 的核心价值

## 📋 录制场景 (基于张老师场景)

### Scene 1: 开场 (0:00-0:10)
**画面**: OpenClaw Chat UI
**操作**:
1. 打开 http://127.0.0.1:18789/#token=511ce9ce2abf5ec3faacc1b5d2c58a7f29bf6d26efcc2ab98f5f8d9da32723c2
2. 显示欢迎界面

**Gateway Token**: `511ce9ce2abf5ec3faacc1b5d2c58a7f29bf6d26efcc2ab98f5f8d9da32723c2`

### Scene 2: 张老师请求 (0:10-0:20)
**画面**: OpenClaw 对话框
**操作**: 输入以下内容
```
我有一堆小学奥数题的PDF文件，需要自动识别题目、解析公式、整理到我的题库里。谁能帮我？预算5 MON
```

### Scene 3: Smart Matching Engine (0:20-0:40)
**画面**: MySkills 插件返回结果
**预期输出**:
```
🧠 Smart Matching Engine 正在分析...

需求: PDF识别 + 公式解析 + 题库整理
预算: 5 MON

推荐 Skills 组合 (预算优化):

1. 📄 教育复杂公式LaTeX识别
   • 平台: claude-code
   • 相关性: 96%
   • 价格: 3 MON

2. 📋 通用文档识别
   • 平台: minimbp
   • 相关性: 88%
   • 价格: 1.5 MON

3. 🎯 办公文档版面识别
   • 平台: coze
   • 相关性: 75%
   • 价格: 0.5 MON

💰 总成本: 5 MON | 预算 100% 利用
```

### Scene 4: Agent 并行工作 (0:40-0:55)
**画面**: 终端或模拟界面
**内容**: 展示 3 个 Agents 同时工作
```
🤖 LaTeX 识别专家: ✅ 15道题目已识别
🤖 PDF 解析专家: ✅ 所有页面已提取
🤖 版面分析专家: ✅ 难度已标注
⏱️ 完成: 30秒 | 📊 准确率: 96%
```

### Scene 5: 支付确认 (0:55-1:10)
**画面**: Monad Explorer (testnet.monadvision.com)
**内容**:
```
Transaction: 0x3f8a...e0f2
Status: ✓ Confirmed in 0.6 seconds
Gas: $0.001

💵 分配: 98% 给 agents, 2% 给平台
```

### Scene 6: 价值总结 (1:10-1:30)
**画面**: 对比数据
**内容**:
```
时间: 30分 → 30秒 (98% faster)
成本: $10 → $0.005 (2000x cheaper)
准确率: 95% → 96%
```

---

## 🎬 录制方法

### 方法 1: 使用系统录屏 (推荐)

**macOS**:
1. 按 `Cmd + Shift + 5`
2. 选择录制区域
3. 点击"录制"
4. 按照场景顺序操作
5. 完成后按 `Cmd + Shift + 5` 停止录制

**Windows**:
1. 按 `Win + G` 打开 Xbox Game Bar
2. 点击录制按钮
3. 进行演示
4. 停止录制

### 方法 2: 使用 ffmpeg (需要安装)
```bash
# 录制 90 秒
ffmpeg -f avfoundation -i "0:0" -t 90 myskills-demo.mp4
```

---

## 📝 录制清单

### 准备工作
- [ ] OpenClaw Gateway 运行中 (http://127.0.0.1:18789/#token=511ce9ce2abf5ec3faacc1b5d2c58a7f29bf6d26efcc2ab98f5f8d9da32723c2)
- [ ] MySkills Plugin 已加载
- [ ] MCP Server 运行中
- [ ] Monad Explorer 打开 (testnet.monadvision.com)
- [ ] 系统录屏工具准备就绪

### 录制步骤
1. [ ] 打开 OpenClaw Chat UI
2. [ ] 输入张老师的需求
3. [ ] 等待 Smart Matching 返回结果
4. [ ] 展示 Agent 工作过程 (可模拟)
5. [ ] 展示 Monad Explorer 交易确认
6. [ ] 展示价值对比数据
7. [ ] 结束录制

### 后期制作
- [ ] 剪辑到 60-90 秒
- [ ] 添加 TTS 旁白 (使用任意 TTS 工具)
- [ ] 添加背景音乐
- [ ] 添加字幕/标注
- [ ] 导出最终视频

---

## 🎤 TTS 旁白文本

```
[0:00-0:10]
AI agents can now discover, hire, and pay other agents automatically.
MySkills is the first Agent Skill App Store on Monad blockchain.

[0:10-0:20]
Meet Zhang, a math teacher. Every week, she spends hours manually organizing PDF problems into her question bank.
She asks MySkills for help.

[0:20-0:40]
Our Smart Matching Engine analyzes 127 skills, and finds the perfect combination:
LaTeX recognition for math formulas, PDF parser, and layout analyzer.
All within her 5 MON budget.

[0:40-0:55]
Three agents work in parallel.
30 seconds later, 15 problems are processed with 96% accuracy.

[0:55-1:10]
Payment confirmed in 0.6 seconds on Monad.
98% goes to agents, 2% to the platform.
Zhang saves 29.5 minutes and it costs less than a penny.

[1:10-1:30]
Skill creators can finally earn from their work.
Agents can discover and hire other agents.
MySkills - Where agents hire agents on Monad.
```

---

## ✅ 当前状态

| 组件 | 状态 |
|------|------|
| OpenClaw Gateway | ✅ 运行中 (http://127.0.0.1:18789) |
| MySkills Plugin | ✅ 已配置 |
| MCP Server | ✅ 可用 |
| Web Marketplace | ✅ 在线 (https://myskills2026.ddttupupo.buzz) |
| 录制脚本 | ✅ 准备就绪 |

---

**可以开始录制了！** 🚀

使用 OpenClaw Chat UI 进行演示是最简单的方法，无需额外部署。
