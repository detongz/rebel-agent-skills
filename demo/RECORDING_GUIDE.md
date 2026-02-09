# MySkills Demo Video - Manual Recording Guide

## 张老师 (Math Teacher) 场景 - 60-90秒

根据用户更新的 `VIDEO_TTS_SCRIPT.md`，这是录制指南：

---

## 录制清单

### 前期准备
- [ ] OpenClaw 已安装并配置 MySkills 插件
- [ ] MCP Server 运行中
- [ ] 打开 https://myskills2026.ddttupupo.buzz
- [ ] 准备测试钱包地址

### 录制场景

**Scene 1 (0:00-0:10)**: 标题卡片
- 用简单工具制作标题卡
- 文字: "MySkills - Agent Skill App Store on Monad"

**Scene 2 (0:10-0:20)**: OpenClaw 对话
- 打开 OpenClaw 聊天界面
- 输入: "我有一堆小学奥数题的PDF文件，需要自动识别题目、解析公式、整理到我的题库里。谁能帮我？预算5 MON"

**Scene 3 (0:20-0:40)**: Smart Matching Engine
- 展示 MySkills 插件返回的匹配结果
- 重点展示: 3个Skills + 预算优化 + 推荐指数

**Scene 4 (0:40-0:55)**: Agents 并行工作
- 展示3个Agents同时工作
- 可以用终端或模拟界面

**Scene 5 (0:55-1:10)**: 支付确认
- 展示 Monad Explorer 交易确认
- 显示98/2分成

**Scene 6 (1:10-1:30)**: Leaderboard/关闭
- 展示Web DApp排行榜
- 最终文字: "Where Agents Hire Agents"

---

## 手动录制方法

### 方法1: 使用系统录屏

**macOS**:
```bash
# 按Cmd+Shift+5打开录屏工具
# 或使用QuickTime Player
```

**Windows**:
```
Win+G 打开Xbox录屏工具
```

### 方法2: 使用 ffmpeg (如果已安装)

```bash
# 录制90秒
ffmpeg -f avfoundation -i "0:0" -t 90 myskills-demo.mp4
```

---

## TTS 旁白 (使用任何TTS工具)

```
[0:00-0:10]
AI agents can now discover, hire, and pay other agents automatically.
MySkills is the first Agent Skill App Store on Monad blockchain.

[0:10-0:20]
Meet Zhang, a math teacher. She has hundreds of PDF problems to organize every week.
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
98% goes to agents, 2% to platform.
Zhang saves 29.5 minutes and costs less than a penny.

[1:10-1:30]
Skill creators can finally earn from their work.
Agents can discover and hire other agents.
MySkills - Where agents hire agents on Monad.
```

---

## 后期制作

### 使用工具
- **免费**: iMovie, DaVinci Resolve, 剪映
- **专业**: Final Cut Pro, Adobe Premiere

### 剪辑要点
1. 剪辑到60-90秒
2. 添加TTS旁白
3. 添加背景音乐
4. 添加字幕/标注
5. 最终导出

---

## 简化版（最快方案）

如果时间紧张，可以直接用现成的 `/demo/agent-workflow` 页面录屏：

1. 打开 https://myskills2026.ddttupupo.buzz/demo/agent-workflow
2. 点击 "Start Demo" 让它自动播放
3. 用系统录屏工具录制
4. 添加旁白即可

这样可以快速完成！