# Security Scan Integration Plan: demo-moltiverse × skill-security-scan

## 项目概述

将 standalone 的 skill-security-scan 项目集成到 demo-moltiverse 平台，实现完整的 **安全扫描 → Agent 付费 → 分发结果**工作流。

---

## 架构说明

```
┌─────────────────────────────────────────────────────────┐
│                                                      ┌─────────────────────┐ │
│                    demo-moltiverse          skill-security-scan              │
│                      (Next.js)             (外部API)           │
│                            │                        │
│                      └─────────────┘     └───────────────────────┘     ┌─────────────────────┐
│                      │                      ┌───────────────────────┐     │                      │                      │
└───────────────────────────────────────────────────────────┘
│                                                             │
│                                                             │
│                      Skills DB                        │
└─────────────────────────────────────────────────────────────┘
└─────────────────────────────────────────────────────────────┘
```

---

## 集成任务

### Phase 1: API 桥接层

**任务：** 创建 demo-moltiverse 到 skill-security-scan 的 API 桥接

**文件：** `frontend/app/api/security-scan/`

**实现步骤：**
1. 创建新的 API 路由 `/api/security/scan/external`
   - 接收来自 demo-moltiverse 的请求
   - 验证 API key 或 token
   - 转发请求到 skill-security-scan API
   - 返回扫描结果和报告数据

2. 添加请求验证和错误处理
   - 添加 CORS 支持（如果需要）

**代码示例：**
```typescript
// frontend/app/api/security-scan/external/route.ts

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { repo_url, scan_type, skill_id } = await req.json();

  // 验证请求来源
  if (req.headers['x-api-key'] !== process.env.SKILL_SCAN_API_KEY) {
    return NextResponse.json({
      error: 'Unauthorized',
      status: 401
    }, {
      headers: {
        'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'X-API-Key': process.env.SKILL_SCAN_API_KEY
      };
  }

  // 调用 skill-security-scan API
  try {
    const response = await fetch(`${process.env.SKILL_SCAN_API_URL}/api/scan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SKILL_SCAN_API_TOKEN}`,
      },
      body: JSON.stringify({ repo_url, scan_type, skill_id }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'API request failed' }, { status: 500 });
    }

    const result = await response.json();

    // 返回扫描结果
    return NextResponse.json({
      data: result,
      message: 'Security scan completed successfully',
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

---

### Phase 2: 数据库扩展

**任务：** 扩展 demo-moltiverse 数据库存储安全扫描报告

**文件：** `frontend/lib/store.ts`

**实现步骤：**
1. 创建 scan_reports 表（如果不存在）
2. 添加 scan_jobs 表（追踪异步扫描任务）
3. 添加 getScanReport 函数（查询特定扫描报告）

**代码示例：**
```typescript
// frontend/lib/store.ts

interface ScanJob {
  id: string;
  scan_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
  result: any;
  error_message?: string;
}

// 创建表
await db.run(`
  CREATE TABLE IF NOT EXISTS scan_jobs (
    id TEXT PRIMARY KEY,
    scan_id TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    result JSON,
    error_message TEXT
  )
`);

// 查询函数
async function getScanReport(scanId: string) {
  const job = await db.get(`
    SELECT * FROM scan_reports
    WHERE scan_id = $1
  `);

  return job;
}

// 创建函数
async function createScanJob(scanId: string, repoUrl: string) {
  const result = await db.run(`
    INSERT INTO scan_jobs (scan_id, status, created_at)
    VALUES ($1)
  `);

  return { success: true, scanId };
}
```

---

### Phase 3: 用户界面集成

**任务：** 在 demo-moltiverse 页面添加安全扫描入口

**修改文件：** `frontend/app/demo-moltiverse/page.tsx`

**实现步骤：**
1. 在 Hero section 添加 "扫描项目 URL" 输入框
2. 添加 "启动扫描" 按钮
3. 显示扫描进度和结果
4. 集成报告分享功能

**代码示例：**
```typescript
// frontend/app/demo-moltiverse/page.tsx

const [scanning, setScanning] = useState(false);
const [scanResult, setScanResult] = useState(null);
const [scanProgress, setScanProgress] = useState(0);

const handleStartScan = async () => {
  setScanning(true);
  setScanProgress(10);

  try {
    // 调用外部扫描 API
    const response = await fetch('/api/security-scan/external', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        repo_url: scanUrl,
        scan_type: 'github' // or 'website' or 'solidity'
      }),
    });

    const result = await response.json();

    if (!result.ok) {
      throw new Error(result.message);
    }

    // 轮询扫描状态
    const pollScan = async () => {
      const response = await fetch(`/api/security-scan/status/${result.data.scan_id}`);
      const data = await response.json();

      setScanProgress(data.progress);

      if (data.status === 'completed') {
        setScanResult(data.result);
      }
    };

    // 启动轮询（每2秒）
    const pollInterval = setInterval(pollScan, 2000);
  setScanning(false);

    return () => {
      clearInterval(pollInterval);
    };
  } catch (error) {
    setScanning(false);
    setScanResult({ error: error.message });
  }
};
```

---

### Phase 4: 钱包集成

**任务：** 在 demo-moltiverse 中集成 Monad 钱包功能

**修改文件：** `frontend/app/demo-moltiverse/page.tsx`

**实现步骤：**
1. 连接现有 RainbowKit 钱包（如果已存在）
2. 添加 "支付扫描" 按钮
3. 创建 usePrepareWriteContract hook
4. 实现支付成功回调

**代码示例：**
```typescript
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';

const SecurityScanPayment = () => {
  if (!isConnected) {
    alert('请先连接钱包');
    return;
  }

  const handlePayment = async () => {
    const { data } = await writeContract({
      address: CONTRACT_ADDRESS,
      abi: SKILL_TOKEN_ABI,
      functionName: 'tipSkill',
      args: [skillId, BigInt(scanAmount * 1e18)], // 0.01 ASKL per tip
      value: BigInt(scanAmount * 1e18),
    });

    setProcessing(true);

    try {
      const hash = await writeContract(PrepareTransactionRequest({
        account: address,
        to: CONTRACT_ADDRESS,
        data: encodePacked(abI, [skillId, scanAmount * 1e18]),
      });

      const receipt = await waitForTransactionReceipt({ hash });

      alert(`✅ 支付成功！扫描报告即将发送到您的 Agent`);
      setScanResult(receipt);
    } catch (error) {
      alert(`❌ 支付失败: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };
};
```

---

### Phase 5: Agent 决策逻辑

**任务：** Agent 根据扫描结果决定是否雇佣

**修改文件：** `frontend/components/ScanResultCard.tsx`

**实现步骤：**
1. 显示扫描分数和安全等级
2. 根据 scan 结果动态显示"可雇佣"/"不建议"标签
3. 添加风险提示信息
4. 集成与雇佣决策流程

**决策逻辑：**
```typescript
// frontend/components/ScanResultCard.tsx

interface ScanDecision {
  scan: Report;
  score: number;
  grade: 'A' | 'B' | 'C' | 'F';
  gradeLabel: string;
  action: 'ACCEPT' | 'REJECT' | 'REVIEW';
}

const getScanDecision = (report: ScanReport): ScanDecision => {
  const findings = report.result;

  // 基础评分（0-100）
  let baseScore = 100;

  // 调整分数
  findings.forEach((finding: ScanFinding) => {
    switch (finding.severity) {
      case 'critical':
        baseScore -= 50;
        break;
      case 'high':
        baseScore -= 20;
        break;
      case 'medium':
        baseScore -= 10;
      case 'low':
        baseScore -= 5;
    case 'info':
        baseScore -= 0;
    }
  });

  // 临界值设置
  const CRITICAL_THRESHOLD = 50;
  const REJECT_THRESHOLD = 30;

  // 决策
  if (baseScore < CRITICAL_THRESHOLD) {
    return {
      grade: 'REJECT',
      gradeLabel: 'DANGEROUS - Critical Issues',
      action: 'REJECT',
      message: '⚠️ 该技能存在严重安全风险，不建议使用',
    };
  } else if (baseScore < REJECT_THRESHOLD) {
    return {
      grade: 'REVIEW',
      gradeLabel: 'REVIEW WITH CAUTION',
      action: 'REVIEW',
      message: '⚠️ 该技能存在安全风险，建议谨慎使用',
    };
  } else {
    return {
      grade: 'ACCEPT',
      gradeLabel: 'APPROVED',
      action: 'ACCEPT',
      message: '✅ 该技能可以安全使用',
    };
  }
};
```

---

### Phase 6: 报告分享

**任务：** 实现安全报告的分享功能

**文件：** `frontend/app/api/security-scan/external/share/route.ts`

**实现步骤：**
1. 创建 `/api/security-scan/share` POST 端点
2. 生成唯一的分享链接
3. 添加 QR 码生成
4. 设置过期时间（24小时）

**代码示例：**
```typescript
// frontend/app/api/security-scan/external/share/route.ts

import { NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { scan_id } = await req.json();

  // 生成唯一分享 ID
  const shareId = `scan_${scan_id}_${Date.now()}`;

  // 保存到数据库
  await db.run(`
    INSERT INTO scan_shares (share_id, scan_id, expires_at)
    VALUES ($1)
  `);

  // 生成分享链接
  const shareUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/scan/${shareId}`;

  return NextResponse.json({
    data: {
      shareId,
      shareUrl,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24小时
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create share link' }, { status: 500 });
  }
}
```

---

## 技术依赖

### 新增依赖
```json
{
  "dependencies": {
    "@skill-security-scan/skill-api": "file:/Volumes/Kingstone/workspace/skill-security-scan/package.json",
    "skill-security-scan-types": "file:/Volumes/Kingstone/workspace/skill-security-scan/types",
    "frontend": {
      "wagmi": "^0.6.12",
      "@rainbow-me/rainbowkit/skill-security-scan-core": "^0.5.3"
    }
  }
}
```

### 环境变量需求
```bash
# skill-security-scan 相关
SKILL_SCAN_API_URL=https://api.security-scan.xyz/api/scan
SKILL_SCAN_API_KEY=your_api_key_here

# 数据库
DATABASE_URL=postgresql://...
MONAD_TESTNET_RPC=https://testnet.monad.xyz
MONAD_TESTNET_CONTRACT_ADDRESS=0xc1fFCAD15e2f181E49bFf2cBea79094eC9B5033A

# Vercel (for future deployment)
NEXT_PUBLIC_BASE_URL=https://your-project.vercel.app
```

---

## 实施步骤

### Step 1: 创建外部 API 桥接
1. ✅ 创建 `frontend/app/api/security-scan/external/route.ts`
2. ✅ 添加环境变量验证
3. ✅ 测试 API 端点

### Step 2: 数据库扩展
1. ✅ 创建 scan_reports 和 scan_jobs 表
2. ✅ 实现 getScanReport 函数
3. ✅ 测试数据库操作

### Step 3: 用户界面更新
1. ✅ 添加扫描输入框和启动按钮
2. ✅ 实现轮询和结果显示
3. ✅ 创建 ScanResultCard 组件

### Step 4: 钱包集成
1. ✅ 连接 RainbowKit
2. ✅ 添加 usePrepareWriteContract hook
3. ✅ 实现支付回调

### Step 5: Agent 决策
1. ✅ 创建决策逻辑组件
2. ✅ 实现基于扫描结果的建议/拒绝系统

### Step 6: 报告分享
1. ✅ 创建分享 API 端点
2. ✅ 实现 QR 码生成

---

## 预计工作量

| 任务 | 预计时间 | 复杂度 |
|------|------|----------|
| 创建 API 桥接 | 2-3 小时 |
| 数据库扩展 | 1 小时 |
| 用户界面更新 | 2 小时 |
| 钱包集成 | 2 小时 |
| Agent 决策逻辑 | 2 小时 |
| 报告分享 | 1 小时 |
| 测试和调试 | 2 小时 |
| **总计** | 约 12-16 小时 |

---

## 风险和注意事项

1. **API 安全**：需要验证和鉴权 skill-security-scan API
2. **数据库**：需要备份现有数据库
3. **错误处理**：需要优雅处理 API 失败情况
4. **异步处理**：所有扫描操作应该是异步的
5. **成本控制**：监控 API 调用次数

**用户流程**
1. 用户在 demo 页面输入项目 URL
2. 点击"启动扫描"按钮
3. 等待扫描完成（2-5分钟）
4. 查看扫描结果
5. 如果结果可接受，点击"支付并获取报告"
6. Agent 根据报告决定是否雇佣该 skill

---

你想我开始实施这个集成计划吗？