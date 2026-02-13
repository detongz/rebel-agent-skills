# 安全扫描插件集成计划

## Context

将独立的安全扫描服务 (`skill-security-scan`) 集成到 MySkills OpenClaw plugin 中，实现完整的"用户付费 → 扫描 → Agent决策 → Hire/打赏"流程。

**现状**:
- `/app/skill/page.tsx` 是简单占位页面
- `SecurityScanCard` 组件已存在，调用 `/api/security-scan/external`
- `/api/security-scan/external` 已有外部API代理和fallback机制
- OpenClaw Plugin 可直接调用前端 API

**目标**: 实现 API 代理集成，让用户可在网页版直接提交 scan 获取可分享的安全报告。

---

## Implementation Plan

### Phase 1: 增强 /api/security-scan/external 路由

**文件**: `/Volumes/Kingstone/workspace/rebel-agent-skills/frontend/app/api/security-scan/external/route.ts`

**修改**:
1. 更新响应格式以匹配 skill-security-scan 服务
2. 确保外部API调用失败时正确fallback到内部扫描
3. 增加响应缓存减少重复扫描

### Phase 2: 更新 /app/skill/page.tsx 主页面

**文件**: `/Volumes/Kingstone/workspace/rebel-agent-skills/frontend/app/skill/page.tsx`

**修改**:
1. 引入 `SecurityScanCard` 和 `ScanReportCard` 组件
2. 实现扫描状态管理（idle → scanning → completed/error）
3. 扫描完成后显示 `ScanReportCard`
4. 添加分享功能（调用 `/api/security-scan/share` 生成分享链接）

### Phase 3: 完善 /app/scan/report/[id]/page.tsx

**文件**: `/Volumes/Kingstone/workspace/rebel-agent-skills/frontend/app/scan/report/[id]/page.tsx`

**修改**:
1. 确保从外部扫描服务获取的完整报告数据正确映射
2. 添加二维码生成用于移动端分享
3. 添加 "Hire" 按钮链接到 TipModal

### Phase 4: 增强安全扫描分享功能

**文件**: `/Volumes/Kingstone/workspace/rebel-agent-skills/frontend/app/api/security-scan/share/route.ts`

**修改**:
1. 整合 poster 数据获取逻辑
2. 生成包含完整 URL 的二维码
3. 支持生成可嵌入的 HTML poster

### Phase 5: OpenClaw Plugin 集成

**文件**: `/Volumes/Kingstone/workspace/rebel-agent-skills/openclaw/src/index.ts`

**修改**:
1. 添加 `scan` 工具调用 `/api/security-scan/external`
2. 添加 `report` 工具获取扫描报告
3. Agent 可基于扫描结果决定是否 Hire

---

## 关键文件清单

| 路径 | 操作 |
|------|------|
| `frontend/app/skill/page.tsx` | 集成 SecurityScanCard + ScanReportCard |
| `frontend/app/api/security-scan/external/route.ts` | 更新响应格式映射 |
| `frontend/app/scan/report/[id]/page.tsx` | 增强报告显示和分享 |
| `frontend/app/api/security-scan/share/route.ts` | 完善二维码和poster生成 |
| `openclaw/src/index.ts` | 添加 scan/report 工具 |
| `components/SecurityScanCard.tsx` | 复用现有组件 |
| `components/ScanReportCard.tsx` | 复用现有组件 |

---

## 现有可复用组件/函数

| 组件 | 文件 | 用途 |
|------|------|------|
| `SecurityScanCard` | `components/SecurityScanCard.tsx` | 扫描表单UI |
| `ScanReportCard` | `components/ScanReportCard.tsx` | 报告展示UI |
| `TipModal` | `components/TipModal.tsx` | 打赏/支付模态框 |
| `getScanDecision()` | `components/ScanReportCard.tsx:51` | 决策逻辑（ACCEPT/REVIEW/REJECT） |
| `ConnectButton` | `components/ConnectButton.tsx` | 钱包连接 |

---

## 环境变量配置

在 `.env` 中添加:
```bash
# 外部安全扫描服务URL
SKILL_SCAN_API_URL=https://your-scan-service.com
SKILL_SCAN_API_KEY=your-api-key

# 报告页面基础URL（用于分享链接）
NEXT_PUBLIC_BASE_URL=https://myskills2026.ddttupupo.buzz
```

---

## 数据流图

```
┌─────────────────┐
│   用户/Agent   │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│  /app/skill/page.tsx      │
│  - SecurityScanCard         │
└────────┬────────────────────┘
         │ POST /api/security-scan/external
         │ { repo_url: "https://github.com/owner/repo" }
         ▼
┌─────────────────────────────────────┐
│  /api/security-scan/external/route │
└────────┬────────────────────────────┘
         │
         ├─→ 外部扫描服务 (skill-security-scan)
         │   │
         │   └─→ POST /api/scan
         │        { repoUrl }
         │        ↓
         │   返回: { scanId, score, grade, findings... }
         │
         └─→ Fallback: 内部扫描 (/api/scan)
             │
             └─→ 返回简化报告
         │
         ▼
┌────────────────────────────┐
│  SQLite (scan_reports)     │
│  - 存储完整报告            │
└────────┬───────────────────┘
         │
         ▼
┌───────────────────────────────────┐
│  /app/scan/report/[id]/page.tsx │
│  - 显示完整报告                 │
│  - 二维码分享                   │
└────────┬──────────────────────────┘
         │
         ▼
┌────────────────────────────┐
│  用户决策                 │
│  - 查看评分 (A/B/C)       │
│  - 查看发现                │
│  - Hire / 打赏            │
└────────────────────────────┘
```

---

## 验证步骤

1. **前端扫描流程**:
   - 访问 `/skill` 页面
   - 输入 GitHub URL
   - 点击 START SCAN
   - 验证进度条和状态更新
   - 验证扫描完成后显示报告卡片

2. **报告分享功能**:
   - 扫描完成后点击分享按钮
   - 验证生成分享链接和二维码
   - 用手机扫描二维码，验证链接可访问

3. **OpenClaw Plugin 集成**:
   - Agent 调用 `scan` 工具
   - 验证返回正确的 scanId 和评分
   - Agent 调用 `report` 工具获取完整报告

4. **Fallback 机制**:
   - 停止外部扫描服务
   - 验证自动fallback到内部扫描
   - 验证报告格式兼容性
