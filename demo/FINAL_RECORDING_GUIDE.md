# MySkills Demo Video - 最终录制方案

## 🎯 自动录制方案（已创建）

### 方案 1: 自动播放幻灯片 (推荐)

**文件**: `demo/myskills-slideshow.html`

**使用方法**:
```bash
cd demo
chmod +x record-slideshow.sh
./record-slideshow.sh
```

**效果**:
- 72秒自动播放
- 5个场景循环
- 自动下载视频 (myskills-demo.webm)

**场景内容**:
1. Hero - "MySkills Protocol"
2. Smart Matching Engine 特性
3. Agent Payment 统计
4. Cross-Platform Value
5. Final CTA

**字幕** (每个场景都有):
- 场景1: "AI agents can now discover, hire, and pay other agents automatically."
- 场景2: "Our Smart Matching Engine analyzes 127+ skills to find the perfect combination within budget."
- 场景3: "Payment confirmed in 0.6 seconds. 98% goes to agents, 2% to platform."
- 场景4: "One skill registration works across all agent platforms."
- 场景5: "Skill creators can finally earn from their work. Agents can discover and hire other agents."

### 方案 2: 手动录制 macOS

```bash
# 1. 打开幻灯片
open demo/myskills-slideshow.html

# 2. 开始录屏
# 按 Cmd+Shift+5

# 3. 选择录制整个屏幕
# 点击"录制"

# 4. 等待幻灯片播放完成 (72秒)

# 5. 停止录制
# 点击停止按钮

# 6. 保存视频
# 文件会保存到桌面/Movies
```

---

## 📋 幻灯片内容详解

### Scene 1: Hero (12秒)
- 🏪 图标
- "MySkills Protocol"
- "Agent Skill App Store on Monad"
- "Where AI Agents Hire and Pay Each Other"
- **字幕**: "AI agents can now discover, hire, and pay other agents automatically."

### Scene 2: Smart Matching Engine (15秒)
- 标题: "Smart Matching Engine"
- 4个特性:
  - ✓ NLP Keyword Extraction
  - ✓ Multi-Dimensional Scoring
  - ✓ Budget Optimization (Knapsack Algorithm)
  - ✓ Parallel Agent Coordination
- **字幕**: "Our Smart Matching Engine analyzes 127+ skills to find the perfect combination within budget."

### Scene 3: Agent Payment (15秒)
- 标题: "Agent-to-Agent Payment"
- 4个统计:
  - Confirmation: < 1s
  - Gas Cost: $0.001
  - Creator Share: 98%
  - Platform Fee: 2%
- **字幕**: "Payment confirmed in 0.6 seconds. 98% goes to agents, 2% to platform."

### Scene 4: Cross-Platform (15秒)
- 标题: "Cross-Platform Value"
- 4个平台: Claude Code, Coze, Manus, MiniMax
- "Build Once, Earn Everywhere"
- **字幕**: "One skill registration works across all agent platforms."

### Scene 5: Final CTA (15秒)
- 🚀 图标
- "MySkills Protocol"
- "Where Agents Hire Agents"
- URL: myskills2026.ddttupupo.buzz
- **字幕**: "Skill creators can finally earn from their work. Agents can discover and hire other agents."

---

## 🎬 转换为 MP4

如果视频是 WebM 格式，转换为 MP4:

```bash
cd demo/videos
ffmpeg -i myskills-demo.webm -c:v libx264 -crf 23 -c:a aac myskills-demo.mp4
```

---

## ✅ 检查清单

- [x] 幻灯片 HTML 已创建
- [x] 字幕已嵌入每个场景
- [x] 自动播放功能
- [x] 视频下载功能
- [x] 录制脚本已创建
- [x] 转换指南已准备

---

## 🚀 立即开始录制

```bash
cd demo
open myskills-slideshow.html
```

然后使用 macOS 录屏工具 (Cmd+Shift+5) 录制 60-90 秒即可！

视频已经准备好，字幕已嵌入，只需录制即可！ 🎬
