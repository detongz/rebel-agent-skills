# MySkills Integration with Agent Skills Standard

## Concept

Agent Skills 是 Anthropic 发起的开放标准。我们**不需要重新发明格式**，只需要：
1. 利用 Agent Skills 标准的 `metadata` 字段
2. 添加钱包地址用于接收奖励
3. 扫描 GitHub 上的 SKILL.md 文件自动注册

## SKILL.md 格式扩展

### 标准 Agent Skills 格式

```yaml
---
name: solidity-auditor
description: AI-powered smart contract security auditor for Solidity code
license: MIT
metadata:
  author: example-org
  version: "1.0"
  category: security
  tags: [solidity, audit, security]
---
```

### MySkills 扩展（添加 monad_wallet）

```yaml
---
name: solidity-auditor
description: AI-powered smart contract security auditor for Solidity code
license: MIT
metadata:
  author: example-org
  version: "1.0"
  category: security
  tags: [solidity, audit, security]
  # MySkills-specific fields (non-breaking)
  monad_wallet: "0xYourMonadWalletAddress"
  reward_rate: "1 ASKL per 100 uses"
---
```

## 自动发现流程

### 1. GitHub 扫描

```
MySkills Protocol Scanner
    ↓
扫描 GitHub repositories
    ↓
查找 .claude/skills/*/SKILL.md
    ↓
解析 YAML frontmatter metadata
    ↓
提取 monad_wallet 字段
    ↓
自动注册到 MySkills Protocol
```

### 2. CLI 安装追踪

```
用户运行: npx @anthropic-ai/claude-code install skill-name
    ↓
MySkills Protocol 监听 npm events
    ↓
记录技能安装
    ↓
每周统计使用量
    ↓
自动分配奖励
```

## 完整示例

### skill-name/.claude/skills/solidity-auditor/SKILL.md

```yaml
---
name: solidity-auditor
description: Scans Solidity smart contracts for security vulnerabilities, gas optimization opportunities, and best practices violations. Outputs detailed audit reports with severity ratings and remediation suggestions.

license: MIT
metadata:
  author: security-research-labs
  version: "2.1.0"
  category: security-audit
  tags: [solidity, audit, security, smart-contracts]

  # MySkills Protocol Integration
  monad_wallet: "0x7F0bDc7dFb0A601f24eBbFD7fd3514575ecBE08b"
  reward_rate: "1 ASKL per 100 uses"
  documentation: "https://github.com/security-research-labs/solidity-auditor"
  repository: "https://github.com/security-research-labs/solidity-auditor"

# Agent Skills Hooks (optional)
hooks:
  pre-invoke: "./scripts/verify-solc-version.sh"
  post-invoke: "./scripts/submit-metrics.sh"
---

# Solidity Auditor

This skill analyzes Solidity smart contracts for security issues and provides actionable remediation guidance.

## Features

- Comprehensive vulnerability scanning
- Gas optimization analysis
- Best practices compliance checking
- Automated report generation

## Usage

```bash
/solidity-auditor contracts/MyContract.sol
```

## Requirements

- Solidity compiler (solc)
- Node.js for report generation
```

## 技术实现

### MCP Server 扩展 - 自动发现技能

```typescript
// packages/mcp-server/src/skill-scanner.ts

import { Octokit } from "octokit";

interface AgentSkill {
  name: string;
  description: string;
  repository: string;
  monadWallet?: string;
  category?: string;
  tags?: string[];
}

/**
 * Scan GitHub for Agent Skills with MySkills metadata
 */
export async function scanGitHubForSkills(
  query: string = "monad_wallet",
  limit: number = 100
): Promise<AgentSkill[]> {
  const octokit = new Octokit();
  const skills: AgentSkill[] = [];

  // GitHub code search for SKILL.md files
  const results = await octokit.rest.search.code({
    q: `myskills_metadata extension:md ${query}`,
    per_page: limit,
  });

  for (const item of results.data.items) {
    try {
      // Fetch SKILL.md content
      const response = await fetch(item.url);
      const content = await response.text();

      // Parse YAML frontmatter
      const frontmatter = parseYamlFrontmatter(content);

      if (frontmatter.metadata?.monad_wallet) {
        skills.push({
          name: frontmatter.name,
          description: frontmatter.description,
          repository: item.repository.full_name,
          monadWallet: frontmatter.metadata.monad_wallet,
          category: frontmatter.metadata.category,
          tags: frontmatter.metadata.tags,
        });
      }
    } catch (error) {
      console.error(`Failed to parse ${item.url}:`, error);
    }
  }

  return skills;
}

/**
 * Auto-register discovered skills
 */
export async function autoRegisterSkills(
  skills: AgentSkill[]
): Promise<number> {
  let registered = 0;

  for (const skill of skills) {
    try {
      // Generate skill ID from repository
      const skillId = `0x${Buffer.from(skill.repository).toString('hex')}`.padEnd(66, '0');

      // Register on MySkills Protocol
      await registerSkillOnContract({
        skillId,
        name: skill.name,
        creator: skill.monadWallet!,
      });

      registered++;
    } catch (error) {
      console.error(`Failed to register ${skill.name}:`, error);
    }
  }

  return registered;
}
```

### CLI 安装追踪 - npm hook

```typescript
// packages/myskills-cli/src/install-tracker.ts

/**
 * MySkills CLI - 追踪技能安装和使用
 */
export async function trackSkillInstall(skillName: string) {
  // Record installation event
  await fetch("https://api.myskills.monad/usage", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      event: "install",
      skill: skillName,
      timestamp: Date.now(),
      userAgent: process.env.npm_config_user_agent,
    }),
  });
}

/**
 * Post-install hook for npm
 */
// package.json scripts:
// "postinstall": "myskills-track-install || true"
```

## 开发者体验

### 传统流程（手动注册）

```
1. 去平台网站注册账号
2. 填写表单
3. 连接钱包
4. 等待审核
```

### MySkills 流程（零门槛）

```
1. 在 SKILL.md 添加一行: monad_wallet: "0x..."
2. Push to GitHub
3. 完成！自动发现 + 自动追踪 + 自动收款
```

## 反垄断机制

### 长尾开发者优势

```typescript
function calculateReward(
  usageCount: number,
  creatorEarnings: bigint
): bigint {
  const baseReward = BigInt(usageCount) * REWARD_PER_USE;

  // 长尾加成
  if (creatorEarnings < parseEther("1000")) {
    return baseReward * 150n / 100n; // +50%
  }
  if (creatorEarnings < parseEther("10000")) {
    return baseReward * 120n / 100n; // +20%
  }

  // 大厂商递减
  if (creatorEarnings > parseEther("100000")) {
    return baseReward * 50n / 100n; // -50%
  }

  return baseReward;
}
```

### 为什么这有效

1. **大厂商不在乎**：Anthropic 不会为了这点钱来集成
2. **小开发者受益**：被动收入让全职开发成为可能
3. **生态自然多样化**：长尾开发者主导创新

## 与 Agent Skills 的协同

| Agent Skills | MySkills Protocol |
|--------------|-------------------|
| 技能定义格式 | 收益分配协议 |
| 标准化发现 | 自动化奖励 |
| Claude Code 集成 | 区块链结算 |
| 开发者工具 | 创作者经济 |

## 更新的 Pitch

### 旧 Pitch
"MySkills - Agent Skill Marketplace where developers register skills and users tip creators"

### 新 Pitch
"MySkills Protocol - Usage-based revenue for Agent Skills creators, integrated with Agent Skills standard"

**One-liner**: "让 Agent Skills 创作者能够可持续地靠技能谋生"

**Key Message**:
- ✅ 零注册：只需在 SKILL.md 添加一行
- ✅ 自动发现：GitHub 扫描自动注册技能
- ✅ 使用追踪：npm install 自动统计
- ✅ 自动收款：每周自动分配到钱包
- ✅ 长尾友好：小开发者有额外奖励

## 实现路径

### Phase 1: MVP（当前）
- 手动注册 + 手动打赏
- 展示基本功能

### Phase 2: Agent Skills 集成
- SKILL.md 扫描
- 自动注册
- GitHub webhook

### Phase 3: 使用追踪
- npm install hook
- GitHub clone 追踪
- The Graph 集成

### Phase 4: 自动分配
- 每周自动分配奖励
- 长尾加成机制
- 反垄断递减

## 总结

| 方面 | 你的原始想法 | 当前实现 | 差距 |
|------|-------------|----------|------|
| 钱包来源 | SKILL.md metadata | 用户连接钱包 | ⚠️ **需要集成** |
| 收益依据 | 下载/使用量 | 手动打赏 | ⚠️ **需要追踪** |
| 注册方式 | 被动（SKILL.md） | 主动（表单） | ⚠️ **需要扫描** |

**关键洞察**：不是重建标准，而是扩展现有标准
