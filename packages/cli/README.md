# MySkills CLI

> 跨平台 Agent Skill 工具 - 搜索、扫描、发布技能，支持安全验证和 Monad 打赏

## 🎯 核心功能

- **聚合搜索** - 一次搜索，返回多个平台的技能（Vercel Skills + ClawHub）
- **安全扫描** - 安装前强制代码安全检查
- **技能发布** - 发布技能到 MySkills 平台并获得打赏
- **Monad 打赏** - 在 Monad 区块链上打赏技能创作者（98% 收益）

---

## 安装

```bash
# 直接使用（无需安装）
npx myskills <command>

# 全局安装
npm install -g myskills
```

---

## 命令完整列表

### 🔍 搜索技能

```bash
npx myskills search [query...]
```

**选项**：
- `-p, --platform <type>` - 按平台筛选 (claude-code|openclaw|coze|manus|minimbp|all)
- `-s, --min-score <score>` - 最低安全评分 (0-100)
- `-l, --limit <number>` - 最大结果数 (默认: 20)

**示例**：
```bash
npx myskills search "productivity"
npx myskills search "audit" --platform claude-code --min-score 80
```

### 🛡️ 安全扫描

```bash
npx myskills scan <url>
```

**选项**：
- `-f, --full` - 运行深度安全扫描（付费）
- `-o, --output <format>` - 输出格式 (text|json)

**输出**：
- 安全评分 (0-100)
- 代码模式检测结果
- 依赖漏洞扫描
- 安装建议

### ➕ 添加技能

```bash
npx myskills add <source>
```

**支持的来源**：
- GitHub: `github:user/repo`, `gh:user/repo`, `user/repo`
- 本地: `./path`, `~/path`, `/absolute/path`

**选项**：
- `-b, --batch <file>` - 从文件批量添加
- `-d, --dir <path>` - 添加目录下所有技能
- `--skip-scan` - 跳过安全扫描

**示例**：
```bash
npx myskills add github:anthropics/claude-code-skills
npx myskills add ./my-custom-skill
npx myskills add --dir ~/all-my-skills/
```

### 📤 发布技能

```bash
npx myskills publish <url>
```

**选项**：
- `-n, --name <name>` - 技能名称（默认: 仓库名）
- `-c, --category <category>` - 技能分类
- `-p, --plan <plan>` - 付费方案 (single|subscription)

**流程**：
1. 验证 GitHub URL
2. 运行安全扫描
3. 检查付费要求（$5 单次 或 $49/月订阅）
4. 注册到链上
5. 返回技能 ID

**注意**：需要先登录钱包

### 📋 查看我的技能

```bash
npx myskills my-skills
```

显示你已发布的所有技能及收益情况。

### 💰 打赏创作者

```bash
npx myskills tip <skill-id> <amount>
```

**选项**：
- `-m, --message <text>` - 附言消息
- `--token <symbol>` - 代币符号（默认: ASKL）

### 🔐 钱包操作

```bash
npx myskills login [private-key]    # 连接 Monad 钱包
npx myskills whoami                 # 查看账户信息
```

### 📊 排行榜

```bash
npx myskills leaderboard
```

**选项**：
- `-t, --timeframe <period>` - 时间范围 (week|month|all)
- `-l, --limit <number>` - 结果数量

---

## 典型工作流

### 作为用户：发现并使用技能

```bash
# 1. 搜索技能
npx myskills search "code review"

# 2. 扫描技能
npx myskills scan https://github.com/user/repo

# 3. 安装技能（通过原平台）
npx clawhub install <skill>
# 或
npx skills add <repo>
```

### 作为创作者：发布技能并获得收益

```bash
# 1. 连接钱包
npx myskills login <private-key>

# 2. 添加技能到平台
npx myskills add github:your-org/your-skill

# 3. 发布技能（需要付费）
npx myskills publish https://github.com/your-org/your-skill \
  --name "Your Skill" \
  --category "productivity"

# 4. 分享技能 ID，用户可以打赏
# npx myskills tip <skill-id> <amount>

# 5. 查看收益
npx myskills my-skills
```

---

## 架构

```
npx myskills
    │
    ▼
┌─────────────────────────────────────┐
│         Unified API Layer           │
│  /api/search  /api/scan  /api/tip   │
└─────────────────────────────────────┘
    │
    ▼
┌──────────┬──────────┬──────────┐
│ Vercel   │ ClawHub  │ MySkills │
│  Skills  │          │Database  │
└──────────┴──────────┴──────────┘
```

---

## 相关项目

- **[MySkills Protocol](https://github.com/detongz/rebel-agent-skills)** - 主项目
- **[MCP Server](../mcp-server)** - MCP Server 实现
- **[OpenClaw Plugin](../../openclaw)** - OpenClaw 插件

---

## License

MIT
