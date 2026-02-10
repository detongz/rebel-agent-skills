# MySkills Protocol - 自动化排练系统

## 📋 概述

这是 MySkills Protocol 的自动化排练系统，每15分钟自动运行张老师的 use case 演示：
- Agent 发现技能
- Smart Matching Engine 匹配
- Agent 并行工作
- 自动支付结算 (98/2 split)

## 📁 文件结构

```
demo/
├── auto-rehearsal.sh          # 主排练脚本
├── zhang-usecase-rehearsal.ts # Playwright 自动化脚本
├── setup-cron.sh              # Cron 任务设置脚本
├── logs/                      # 运行日志
├── screenshots/               # 运行截图
└── AUTOMATION_README.md       # 本文档
```

## 🚀 快速开始

### 1. 设置 Cron 任务（推荐）

```bash
cd /Volumes/Kingstone/workspace/rebel-agent-skills/demo
./setup-cron.sh
```

这将安装一个 cron 任务，每15分钟自动运行排练。

### 2. 手动运行一次

```bash
./auto-rehearsal.sh
```

### 3. 直接运行 Playwright

```bash
cd /Volumes/Kingstone/workspace/rebel-agent-skills
npx tsx demo/zhang-usecase-rehearsal.ts
```

## 📊 监控

### 查看实时日志

```bash
# 查看最新的运行日志
tail -f demo/logs/rehearsal_*.log

# 查看 cron 日志
tail -f demo/logs/cron.log
```

### 查看截图

```bash
# 列出所有截图
ls -la demo/screenshots/

# 在 Finder 中打开
open demo/screenshots/
```

### 检查 Cron 状态

```bash
# 查看已安装的 cron 任务
crontab -l | grep myskills

# 查看 cron 运行日志
log show --predicate 'process == "cron"' --last 1h
```

## 🔧 配置

### 修改运行频率

编辑 `setup-cron.sh` 中的 `CRON_EXPRESSION`:

```bash
# 每5分钟
CRON_EXPRESSION="*/5 * * * *"

# 每30分钟
CRON_EXPRESSION="*/30 * * * *"

# 每小时
CRON_EXPRESSION="0 * * * *"
```

然后重新运行 `setup-cron.sh`。

### 修改演示 URL

设置环境变量:

```bash
export BASE_URL="http://localhost:3000"
export DEMO_URL="http://localhost:3000/demo/agent-workflow"
```

## 🛑 停止自动化

### 方法 1: 删除 Cron 任务

```bash
crontab -e
# 删除包含 myskills 或 auto-rehearsal 的行
```

### 方法 2: 注释掉任务

```bash
crontab -l | sed 's/^/#/' | crontab -
```

## 📝 排练步骤

自动化脚本会执行以下步骤：

1. **打开 Demo 页面** - 访问 Agent Workflow Demo
2. **开始演示** - 点击开始按钮
3. **Smart Matching** - 观察 AI 匹配过程
4. **Agent 选择** - 查看推荐的技能
5. **并行工作** - 观察 Agents 同时工作
6. **支付确认** - 验证 98/2 分成和交易确认

## 🐛 故障排查

### 问题: Cron 任务没有运行

```bash
# 检查 cron 是否运行
sudo launchctl list | grep cron

# 查看系统日志
log show --predicate 'process == "cron"' --last 1h
```

### 问题: 端口被占用

```bash
# 查找占用 3000 端口的进程
lsof -i :3000

# 杀死进程
kill -9 <PID>
```

### 问题: Playwright 浏览器未安装

```bash
npx playwright install chromium
```

## 📈 日志格式

```
[2026-02-10 01:15:00] [INFO] MySkills 自动排练开始
[2026-02-10 01:15:01] [INFO] 检查依赖...
[2026-02-10 01:15:02] [SUCCESS] 依赖检查通过
[2026-02-10 01:15:03] [INFO] 启动前端开发服务器...
[2026-02-10 01:15:15] [SUCCESS] 前端开发服务器已启动 (PID: 12345)
...
```

## 🔐 安全注意事项

- 不要在生产环境使用开发服务器的私钥
- 定期清理日志和截图文件
- 确保 `.env` 文件不被提交到 git

## 📞 支持

遇到问题？查看:
- 项目文档: `docs/`
- Monad 文档: `docs/moltiverse-kb/resources/monad-agents.md`
- OpenClaw 文档: `openclaw/skill.md`

---

**MySkills Protocol** - Where AI Agents Hire and Pay Each Other on Monad Blockchain
