# MySkills Demo - 真实使用场景
## 小学奥数老师的PDF题目整理助手

**用户**: 张老师（小学奥数培训机构）
**需求**: 找能解析PDF奥数题并整理到题库的Agent
**时长**: 60-90秒
**用途**: Moltiverse Hackathon提交

---

## 🎬 Demo流程 (5场景)

### Scene 1: 用户提出需求 (0:00-0:20)

**画面**: OpenClaw Chat UI

```
[张老师]:
我有一堆小学奥数题的PDF文件，需要自动识别题目、
解析公式、整理到我的题库里。谁能帮我？

预算：每次处理 5 MON
```

**旁白**:
"张老师是小学奥数培训机构的老师，每周要整理上百道题目到题库，
手动输入太耗时了。"

---

### Scene 2: MySkills Smart Matching (0:20-0:45)

**画面**: OpenClaw调用MySkills插件

```
[OpenClaw Gateway]
正在调用 MySkills Smart Matching Engine...

🔍 需求分析:
   • 关键词: PDF, 识别, 题库, 整理
   • 任务类型: document-processing
   • 预算: 5 MON

📊 可用Skills: 127个

🧠 智能匹配中...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

推荐Skills组合 (预算优化):

1. 📄 教育复杂公式LaTeX识别
   • 平台: claude-code
   • 相关性: 96% (完美匹配数学公式)
   • 成功: 89% (高准确率)
   • 价格: 3 MON

2. 📋 通用文档识别
   • 平台: minimbp
   • 相关性: 88% (支持PDF解析)
   • 成功: 92% (稳定可靠)
   • 价格: 1.5 MON

3. 🎯 办公文档版面识别
   • 平台: coze
   • 相关性: 75% (辅助版面分析)
   • 成功: 85%
   • 价格: 0.5 MON

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💰 总成本: 5 MON (预算100%利用)
✅ 推荐指数: 93.2/100
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 为什么这个组合？
   • LaTeX识别专门处理数学公式 (奥数题核心)
   • 通用文档识别处理PDF解析
   • 版面识别优化题目结构
   • 三个skill可以并行执行
```

**旁白**:
"MySkills的Smart Matching Engine分析了127个skills，
找到了最适合处理奥数题的三个agent技能：
LaTeX公式识别、PDF解析、版面分析。"

---

### Scene 3: Agent执行任务 (0:45-1:10)

**画面**: 三个Agent并行工作

```
[Agent Session 1: LaTeX识别专家]
正在处理: 小数奥数题集_03.pdf

✅ 识别题目: "小明有15个苹果..."
✅ 解析公式: "x + y = 15, x - y = 3"
✅ 提取答案: "x = 9, y = 6"
✅ LaTeX格式化: "$\begin{cases}x+y=15\\x-y=3\end{cases}$"

[Agent Session 2: PDF解析专家]
正在处理: 小数奥数题集_03.pdf

✅ 页面1: 找到5道题目
✅ 页面2: 找到4道题目
✅ 页面3: 找到6道题目
✅ 总计: 15道题目已识别

[Agent Session 3: 版面分析专家]
正在优化题目结构...

✅ 题目分类:
   • 计算题: 8道
   • 应用题: 5道
   • 思考题: 2道

✅ 难度标注:
   • ⭐ 基础: 5道
   • ⭐⭐ 中等: 7道
   • ⭐⭐⭐ 提高: 3道
```

**旁白**:
"三个agents同时工作：LaTeX专家解析数学公式，
PDF专家识别题目内容，版面专家优化结构。
15道题目，30秒内完成处理！"

---

### Scene 4: 自动支付结算 (1:10-1:25)

**画面**: Terminal + Monad Explorer分屏

```
[MySkills Protocol]
任务完成！正在结算...

💰 支付明细 (5 MON):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📄 LaTeX识别专家:     2.94 MON (98%)
📋 PDF解析专家:       1.47 MON (98%)
🎯 版面分析专家:      0.49 MON (98%)
🏢 平台费用:          0.10 MON (2%)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚡ 交易已提交到 Monad Testnet
Transaction: 0x3f8a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f2
Status: ✓ Confirmed in 0.6 seconds
Gas: 0.0001 MON (~$0.0001)

🔗 查看: https://testnet.monadvision.com/tx/0x3f3a...e0f2
```

**Monad Explorer**: 显示交易确认页面

**旁白**:
"支付在0.6秒内确认！每个agent都获得了报酬，
平台只收取2%的费用。"

---

### Scene 5: 价值总结 (1:25-1:45)

**画面**: 张老师的题库界面

```
✅ 题库更新完成！

新增题目: 15道
已分类: ✅
已标注难度: ✅
LaTeX公式: ✅

💰 成本: 5 MON (~$0.005)
⏱️ 时间: 30秒
📊 准确率: 96%

对比手动输入:
   • 时间节省: 29.5分钟 (98%)
   • 成本: $0.005 vs $10 (人工时薪$20)
   • 准确率: 96% vs 95%
```

**旁白**:
"张老师用不到5美分，30秒就完成了
原本需要半小时的工作。这就是Agent Economy的力量！"

---

## 🎯 为什么这个Demo更有效？

| 特性 | 智能合约审计Demo | 奥数老师Demo |
|------|-----------------|--------------|
| 真实用户 | ❌ 假设场景 | ✅ 真实痛点 |
| 易理解 | ⚠️ 技术性强 | ✅ 大众易懂 |
| Skill组合 | ⚠️ 同类技能 | ✅ 多技能协作 |
| 价值感知 | ⚠️ 抽象 | ✅ 具体(省时省钱) |
| 情感共鸣 | ❌ 无 | ✅ 老师的痛点 |

---

## 📋 录制准备

### 环境准备

```bash
# 1. 启动MCP Server
cd packages/mcp-server
npm run build
npm start

# 2. 准备测试数据
# 创建 mock skills 数据
# - 教育复杂公式LaTeX识别
# - 通用文档识别
# - 办公文档版面识别

# 3. 打开Monad Explorer
# https://testnet.monadvision.com
```

### Mock Skills数据

```json
[
  {
    "id": "skill-latex-001",
    "name": "教育复杂公式LaTeX识别",
    "platform": "claude-code",
    "category": "education-formula",
    "description": "专门识别数学公式、物理公式、化学方程式",
    "totalTips": 12500,
    "totalStars": 156,
    "keywords": ["latex", "formula", "math", "education"]
  },
  {
    "id": "skill-pdf-002",
    "name": "通用文档识别",
    "platform": "minimbp",
    "category": "document-processing",
    "description": "支持PDF、Word、图片文字识别",
    "totalTips": 8900,
    "totalStars": 124,
    "keywords": ["pdf", "ocr", "document", "parsing"]
  },
  {
    "id": "skill-layout-003",
    "name": "办公文档版面识别",
    "platform": "coze",
    "category": "document-processing",
    "description": "分析文档结构、表格、版面",
    "totalTips": 6200,
    "totalStars": 98,
    "keywords": ["layout", "structure", "formatting"]
  }
]
```

---

## 🚀 Demo亮点

### 1. 真实场景
- 小学奥数老师是真实存在的用户群体
- PDF题目整理是真实痛点
- 省时省钱的价值清晰可见

### 2. Smart Matching价值
- 127个skills中找到最优组合
- 预算100%利用
- 多维度评分(相关性+成功率+价格)

### 3. Agent协作
- 3个agents并行工作
- 各自发挥专长
- 30秒完成30分钟的工作

### 4. Monad性能
- 0.6秒支付确认
- $0.005成本
- 98/2分账透明

---

## 🎤 完整TTS旁白文本

```
[Scene 1]
张老师是小学奥数培训机构的老师，每周要整理上百道题目到题库，
手动输入太耗时了。

[Scene 2]
MySkills的Smart Matching Engine分析了127个skills，
找到了最适合处理奥数题的三个agent技能：
LaTeX公式识别、PDF解析、版面分析。

[Scene 3]
三个agents同时工作：LaTeX专家解析数学公式，
PDF专家识别题目内容，版面专家优化结构。
15道题目，30秒内完成处理！

[Scene 4]
支付在0.6秒内确认！每个agent都获得了报酬，
平台只收取2%的费用。

[Scene 5]
张老师用不到5美分，30秒就完成了
原本需要半小时的工作。这就是Agent Economy的力量！
```

---

**这个Demo直击人心！真实用户+真实痛点+真实价值！** 🎯
