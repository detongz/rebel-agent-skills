# OpenClaw 集成方案

## 概述

Agent Reward Hub 的 Monad Skills 可以无缝集成到 OpenClaw/ClawHub 生态，让用户获得**经过评测的高质量 Skills**。

---

## 核心价值

| 对于 OpenClaw 用户 | 对于 Agent Reward Hub |
|-------------------|----------------------|
| 安装经过评测的 Skills | 分发渠道扩大 |
| 看到评分和排名 | 获得更多创作者 |
| 避免安装低质量代码 | 评测数据发挥作用 |

---

## 技术方案

### 方案架构

```
┌─────────────────────────────────────────────────────────────────┐
│                    用户工作流                                    │
└─────────────────────────────────────────────────────────────────┘

[用户]                    [命令                     [结果]
  │                          │                          │
  ├── 搜索 Skills ────────►│ myskills search     │ 带评分的列表
  │                         │   --platform openclaw   │
  │                          │                          │
  ├── 安装 Skill ─────────►│ myskills install    │ 下载到 OpenClaw
  │                         │   --target openclaw     │ 目录
  │                          │                          │
  └── OpenClaw 自动加载 ───►│ (OpenClaw 重启会话)     │ Skill 可用
```

### Skill 格式映射

| Agent Reward Hub | OpenClaw (SKILL.md) |
|------------------|---------------------|
| skillName | name |
| description | description |
| platform | metadata.openclaw.* |
| testScore | metadata.myskills.score |
| grade | metadata.myskills.grade |

**生成的 SKILL.md 示例**：

```yaml
---
name: ai-writer
description: 高质量 AI 写作助手，支持多种文体
metadata:
  {
    "openclaw": {
      "emoji": "✍️",
      "user-invocable": true
    },
    "myskills": {
      "score": 92,
      "grade": "Gold",
      "testDate": "2026-02-03",
      "testCount": 150,
      "testsPassed": "pass@1: 88%, pass@3: 96%"
    }
  }
---

# AI 写作助手

一个经过 Agent Reward Hub 评测的高质量写作助手。

## 评测结果
- **综合评分**: 92/100 (Gold 级别)
- **质量**: 95/100
- **相关性**: 90/100
- **可靠性**: 89/100
- **效率**: 93/100
- **准确性**: 94/100
- **安全性**: 92/100

## 使用方法
直接在对话中使用，或通过斜杠命令调用。

## 创作者
- 地址: 0x1234...5678
- 打赏: 使用 myskills reward ai-writer
```

---

## CLI 集成命令

### 搜索 OpenClaw Skills

```bash
# 搜索所有 OpenClaw Skills（带评分）
myskills search --platform openclaw

# 搜索高评分 Skills
myskills search --platform openclaw --min-score 80

# 搜索特定类别
myskills search --platform openclaw --tag writing
```

### 安装到 OpenClaw

```bash
# 安装到默认 OpenClaw 目录
myskills install ai-writer --target openclaw

# 指定安装目录
monad-skells install ai-writer --target openclaw --dir ~/.openclaw/skills

# 安装特定版本
myskills install ai-writer@1.2.0 --target openclaw
```

### 与 ClawHub 配合

```bash
# 用我们的评分过滤 ClawHub Skills
clawhub search "writing" | myskills filter --min-score 85

# 从 ClawHub 安装，但显示我们的评分
clawhub install ai-writer --verify-with myskills
```

---

## API 集成

OpenClaw/ClawHub 可以调用我们的 API 获取评分：

```javascript
// 获取 Skill 评分信息
const response = await fetch('https://api.myskills.xyz/v1/skills/ai-writer', {
  headers: {
    'X-Platform': 'openclaw'
  }
})

const skill = await response.json()
// {
//   name: "ai-writer",
//   score: 92,
//   grade: "Gold",
//   tests: { ... }
// }
```

---

## 收益与激励

### 对于创作者

- 在 OpenClaw 生态获得曝光
- 通过打赏获得收益
- 评测分数成为质量信号

### 对于用户

- 一键安装经过评测的 Skills
- 避免低质量代码
- 看到透明的评测报告

### 对于 OpenClaw

- 丰富的高质量 Skills 生态
- 评测数据增强用户体验
- 与 Monad 生态连接

---

## 实施路线图

| 阶段 | 内容 |
|------|------|
| **Phase 1** | CLI 基础命令（search/install --target openclaw） |
| **Phase 2** | SKILL.md 格式转换器 |
| **Phase 3** | ClawHub 集成（API 对接） |
| **Phase 4** | OpenClaw 内置支持（显示我们的评分） |

---

## 示例：完整工作流

```bash
# 1. 用户搜索写作助手
myskills search --platform openclaw --tag writing

# 输出：
# ✍️ ai-writer          Score: 92 (Gold)   [安装]
# 📝 blog-assistant     Score: 78 (Silver) [安装]
# ✒️ copy-writer        Score: 65 (Bronze) [安装]

# 2. 选择高分 Skill 安装
myskills install ai-writer --target openclaw

# 输出：
# ✓ Downloading ai-writer from myskills registry
# ✓ Converting to OpenClaw format
# ✓ Installing to ~/.openclaw/skills/ai-writer/
# ✓ Generating SKILL.md with test scores
#
# 重启 OpenClaw 会话以使用新 Skill

# 3. 打赏创作者
myskills reward ai-writer 50 ASKL
```

---

## 配置文件

用户可以在 `~/.myskills/config.json` 配置 OpenClaw 目录：

```json
{
  "targets": {
    "openclaw": {
      "skillsDir": "~/.openclaw/skills",
      "autoConvert": true,
      "includeScores": true
    }
  }
}
```
