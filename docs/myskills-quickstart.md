# MySkills 最简集成示例

## 你只需要做一件事：

在你的 Agent Skill 的 `SKILL.md` metadata 中添加一行：

```yaml
---
name: your-skill-name
description: Your skill description
metadata:
  monad_wallet: "0xYourWalletAddress"  # ← 就这一行！
---
```

## 完整示例

```yaml
---
name: my-cool-agent
description: Does cool stuff with AI
metadata:
  author: yourname
  version: "1.0.0"
  monad_wallet: "0x1234...5678"  # ← 添加这一行
---
```

## 之后会发生什么

1. **自动发现**: MySkills Protocol 扫描 GitHub 发现你的 skill
2. **自动注册**: 你的 skill 自动注册到协议中
3. **使用追踪**: 每次 agent 使用都会被记录
4. **自动收款**: 每周自动分配奖励到你的钱包

## 就这样！

不需要：
- ❌ 注册账号
- ❌ 填写表单
- ❌ 连接钱包到平台
- ❌ 手动提现

只需要：
- ✅ 在 SKILL.md 添加一行
- ✅ Push 到 GitHub
