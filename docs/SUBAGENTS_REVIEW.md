# Subagents 目录移除说明

## 背景

队友 leon 提交了一个包含 `subagents/` 目录的代码包，该目录包含约 5000+ 行 Python 代码，是一个 AI Agent 协作开发框架。

## 移除原因

### 1. 与项目核心功能无关

本项目 **Agent Reward Hub** 是一个 Agent Skills 评测与激励平台，核心功能包括：
- 智能合约（Solidity）
- 前端应用（Next.js + TypeScript）
- 用户打赏和激励系统

而 `subagents/` 目录是一个**自动化开发工具框架**，用于自动化执行开发任务（如合约开发、前端开发、文档编写等）。这属于"开发工具"，而非"产品功能"。

### 2. 硬编码路径问题

`master_agent.py` 中包含大量硬编码路径：
```python
PROJECT_DIR = Path("/root/mycode/rebel-agent-skills")
SUBAGENTS_DIR = Path("/root/investment/subagents")
LOGS_DIR = Path("/root/investment/logs")
```

这些路径与��前项目结构不匹配，需要大量修改才能使用。

### 3. 实用性存疑

在黑客松开发场景下：
- 团队规模小，不需要复杂的 Agent 协作框架
- 开发节奏快，手动开发比自动化工具更灵活
- Agent 调度的复杂性可能反而增加维护成本

## 已合并的有用内容

以下内容已合并到主项目：

| 文件 | 说明 |
|------|------|
| `frontend/components/SkillCard.tsx` | 修复 TypeScript 类型错误 |
| `frontend/lib/wagmi.ts` | 修复 monadTestnet 命名冲突 |
| `docs/ORGANIZATION_AND_FIX_REPORT.md` | 项目整理报告 |

## 结论

`subagents/` 目录已从队友提交中移除，不合并到主项目。

如有需要使用自动化开发工具，建议：
1. 使用成熟的工具（如 GitHub Copilot, Cursor 等）
2. 针对特定场景编写简单脚本，而非通用框架

---
**Review Date**: 2026-02-06
**Reviewer**: zhangdetong
