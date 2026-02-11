# 付费扫描 + 技能发布流程设计

## 需求确认

- **付费模式**: 发布必须付费 + 支持订阅制
- **数据存储**: 直接上链
- **审核机制**: 自动发布

## 完整流程

```
┌─────────────────────────────────────────────────────────────────────┐
│                        用户触发发布流程                              │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│  1. 基础扫描 (免费)                                                  │
│     - GitHub URL 验证                                               │
│     - 基础代码检查 (grep 危险模式)                                   │
│     - npm audit 检查                                                │
│     - 输出: 基础评分 (0-100)                                        │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│  2. 付费判断                                                         │
│                                                                     │
│  ┌─────────────────┐    ┌─────────────────┐                        │
│  │ 单次发布: $5    │    │ 订阅制: $49/月  │                        │
│  │ - 深度扫描      │    │ - 无限次发布    │                        │
│  │ - 链上注册      │    │ - 优先排名      │                        │
│  └─────────────────┘    └─────────────────┘                        │
│                                                                     │
│  支付方式: x402 协议 (USDC on Monad Testnet)                        │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│  3. 深度扫描 (付费后执行)                                           │
│     - VirusTotal API 扫描                                          │
│     - 依赖包漏洞深度检查                                            │
│     - 代码静态分析                                                  │
│     - 输出: 深度评分 + 详细报告                                     │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│  4. 链上注册 (自动)                                                 │
│     - 调用 ASKLToken.registerSkill()                               │
│     - 存储: skillId, name, creator, securityScore                  │
│     - 返回: 链上 skillId                                           │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│  5. 索引 + 可搜索                                                   │
│     - 监听 SkillRegistered 事件                                     │
│     - 更新技能列表                                                  │
│     - CLI & Web 可搜索                                             │
└─────────────────────────────────────────────────────────────────────┘
```

## CLI 命令

```bash
# 1. 查看扫描状态（免费）
npx myskills scan https://github.com/user/repo

# 2. 发布技能（需要付费）
npx myskills publish https://github.com/user/repo \
  --name "My Skill" \
  --category "productivity" \
  --plan single  # 或 subscription

# 3. 查看我的技能
npx myskills my-skills

# 4. 订阅状态
npx myskills subscription status
```

## API 设计

### POST /api/scan
基础扫描（免费）
```json
POST /api/scan
{
  "url": "https://github.com/user/repo"
}

Response:
{
  "score": 75,
  "status": "warning",
  "can_publish": true,
  "warnings": [...],
  "next_step": "payment_required"
}
```

### POST /api/publish/prepare
准备发布，返回支付信息
```json
POST /api/publish/prepare
{
  "url": "https://github.com/user/repo",
  "name": "My Skill",
  "category": "productivity",
  "plan": "single"  // or "subscription"
}

Response:
{
  "payment_required": true,
  "amount": "5000000",  // USDC (6 decimals)
  "currency": "USDC",
  "network": "eip155:10143",
  "x402_facilitator": "https://x402-facilitator.molandak.org"
}
```

### POST /api/publish/confirm
确认支付后执行发布
```json
POST /api/publish/confirm
Headers:
  x402-payment: <payment_proof>
  x402-signature: <signature>

Body:
{
  "url": "https://github.com/user/repo",
  "name": "My Skill",
  "category": "productivity"
}

Response:
{
  "success": true,
  "skill_id": "0x...",
  "transaction_hash": "0x...",
  "security_score": 85,
  "explorer_url": "https://testnet.monadvision.com/tx/0x..."
}
```

### GET /api/skills
获取所有已发布技能（从链上）
```json
GET /api/skills

Response:
{
  "skills": [
    {
      "id": "0x...",
      "name": "My Skill",
      "creator": "0x...",
      "category": "productivity",
      "security_score": 85,
      "total_tips": "1000000",
      "created_at": 1701234567
    }
  ]
}
```

## 智能合约更新

需要在 ASKLToken 合约添加或确认以下功能：

```solidity
// 技能注册事件
event SkillRegistered(
    bytes32 indexed skillId,
    string name,
    address indexed creator,
    uint256 securityScore,
    uint256 timestamp
);

// 注册技能
function registerSkill(
    string memory name,
    string memory repoUrl,
    string memory category
) external returns (bytes32 skillId);

// 获取技能信息
function getSkill(bytes32 skillId) external view returns (
    string memory name,
    address creator,
    uint256 securityScore,
    uint256 totalTips
);

// 订阅检查 (可选)
function hasActiveSubscription(address user) external view returns (bool);
```

## 订阅制设计

### 定价
- 单次发布: $5 USDC
- 月订阅: $49 USDC
- 年订阅: $490 USDC (省 2 个月)

### 订阅权益
- 无限次发布
- 优先排名
- 订阅者徽章
- 高级分析报告

## 实现步骤

1. ✅ 更新智能合约（添加 registerSkill）
2. ✅ 实现 POST /api/publish/* 端点
3. ✅ 实现 CLI publish 命令
4. ✅ 集成 x402 支付协议
5. ✅ 实现链上事件索引
6. ✅ 测试完整流程

## 文件结构

```
/Volumes/Kingstone/workspace/rebel-agent-skills
├── contracts/
│   └── MSKLToken.sol          # 更新: 添加 registerSkill
├── frontend/
│   └── app/api/
│       ├── scan/route.ts       # ✅ 已有, 更新
│       ├── publish/
│       │   ├── prepare/route.ts  # 新建
│       │   └── confirm/route.ts  # 新建
│       └── skills/route.ts      # ✅ 已有, 更新
└── packages/cli/
    └── src/commands/
        ├── scan.ts              # ✅ 已有
        └── publish.ts           # 新建
```

## 数据流

```
用户 CLI              API 层                智能合约
    │                   │                      │
    ├─ scan ────────────> ├─ grep scan          │
    │                   ├─ npm audit            │
    │<───────────────────┤─ 返回评分            │
    │                   │                      │
    ├─ publish ─────────> ├─ 检查付费           │
    │                   ├─ 返回支付信息 ───────>│
    │<───────────────────┤                      │
    │                   │                      │
    ├─ 支付完成 ─────────> ├─ 深度扫描           │
    │                   ├─ 调用 registerSkill ─>│
    │                   │                      │─ 写入链上
    │<───────────────────┤<─────────────────────┤─ 返回 skillId
    │                   │                      │
    └─ 显示结果          │                      │
```
