# Agent Reward Hub - 系统架构设计

## 整体架构

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              用户层 (Users)                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │  普通用户    │  │  Skill创作者  │  │  项目方      │  │   评委/投资人 │   │
│  │  (打赏者)    │  │  (收款方)    │  │  (赞助商)    │  │              │   │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              前端层 (Frontend)                                │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
││                     Next.js Web App (TypeScript)                      │   │
││  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │   │
││  │ 首页     │  │ Skill目录│  │ 打赏页面 │  │创建Skill │  │个人中心  │ │   │
││  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘ │   │
│└─────────────────────────────────────────────────────────────────────┘   │
│                                      │                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
││  Web3 集成层 (wagmi + viem + RainbowKit)                              │   │
││  - 钱包连接  - 交易签名  - 链上数据查询                                │   │
│└─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌────────────────────────────────────────────────────────────────────────��────┐
│                              后端层 (Backend)                                 │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
││                     Next.js API Routes / Express                       │   │
││  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐           │   │
││  │ /api/skills    │  │ /api/tips      │  │ /api/faucet    │           │   │
││  │ - 列表查询     │  │ - 打赏记录     │  │ - 测试币领取   │           │   │
││  │ - 详情查询     │  │ - 统计数据     │  │ - 限流控制     │           │   │
││  └────────────────┘  └────────────────┘  └────────────────┘           │   │
│└─────────────────────────────────────────────────────────────────────┘   │
│                                      │                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
││  数据存储层                                                            │   │
││  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐      │   │
││  │ PostgreSQL │  │   Redis    │  │   IPFS     │  │  链上存储  │      │   │
││  │ Skill元数据│  │  缓存数据  │  │ 留言/图片  │  │ 核心交易  │      │   │
││  └────────────┘  └────────────┘  └────────────┘  └────────────┘      │   │
│└─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            区块链层 (Blockchain)                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
││  ASKLToken.sol (Monad Testnet)                                         │   │
││  - ERC20 代币                                                         │   │
││  - Skill 注册表 (skillId => creator)                                   │   │
││  - 打赏分账逻辑 (98% 创作者 + 2% 销毁)                                 │   │
││  - 收益统计 (creator => totalEarned)                                   │   │
│└─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 数据流向

### 1. 用户打赏流程

```
用户                    前端                   后端                   智能合约
 │                      │                      │                       │
 ├── 1. 点击打赏 ──────►│                      │                       │
 │                      │                      │                       │
 │                      ├── 2. 查询余额 ──────►│                       │
 │                      │                      ├── 3. 调用��约 ────────►│
 │                      │                      │                       │
 │                      │                      │                       ├── 4. 验证余额
 │                      │                      │                       │
 │                      │                      │◄── 5. 返回结果 ────────┤
 │                      │                      │                       │
 │                      ├── 6. 显示弹窗 ─────►│                       │
 │                      │                      │                       │
 │◄─ 7. 用户确认 ───────┤                      │                       │
 │                      │                      │                       │
 │                      ├── 8. 签名交易 ───────────────────────────────►│
 │                      │                      │                       │
 │                      │                      │                       ├── 9. 执行分账
 │                      │                      │                       │    - 98% 创作者
 │                      │                      │                       │    - 2% 销毁
 │                      │                      │                       │
 │                      │◄───────────────────── 10. 交易确认 ──────────┤
 │                      │                      │                       │
 │◄─ 11. 显示成功 ──────┤                      │                       │
 │                      ├── 12. 记录到数据库 ──►│                       │
 │                      │                      │                       │
 │                      │                      ├── 13. 更新缓存 ──────►│
 │                      │                      │                       │
```

### 2. 创作者注册 Skill 流程

```
创作者                  前端                   后端                   智能合约
 │                      │                      │                       │
 ├── 1. 填写表单 ──────►│                      │                       │
 │  (名称/描述/平台)     │                      │                       │
 │                      │                      │                       │
 │                      ├── 2. 生成 skillId ───►│                       │
 │                      │   keccak256(name+ver) │                       │
 │                      │                      │                       │
 │                      ├── 3. 调用合约注册 ────────────────────────────►│
 │                      │                      │                       │
 │                      │                      │                       ├── 4. 存储映射
 │                      │                      │                       │ skillId=>creator
 │                      │                      │                       │
 │                      │◄───────────────────── 5. 交易��认 ───────────┤
 │                      │                      │                       │
 │◄─ 6. 显示成功 ───────┤                      │                       │
 │                      ├── 7. 存储元数据 ─────►│                       │
 │                      │                      │                       │
 │                      │                      ├── 8. 写入 PostgreSQL   │
 │                      │                      │                       │
```

---

## 技术栈详解

### 前端 (Frontend)

| 技术 | 用途 | 版本 |
|------|------|------|
| **Next.js** | React 框架，支持 SSR/SSG | 14+ |
| **TypeScript** | 类型安全 | 5+ |
| **Tailwind CSS** | 样式框架 | 3+ |
| **shadcn/ui** | UI 组件库 | latest |
| **wagmi** | 以太坊 React Hooks | 2+ |
| **viem** | 以太坊客户端库 | 2+ |
| **RainbowKit** | 钱包连接 UI | 2+ |
| **TanStack Query** | 数据缓存和状态管理 | 5+ |

### 后端 (Backend)

| 技术 | 用途 | 版本 |
|------|------|------|
| **Next.js API Routes** | 服务端 API | 14+ |
| **Prisma** | ORM 数据库访问 | 5+ |
| **PostgreSQL** | 关系型数据库 | 16+ |
| **Redis** | 缓存层 | 7+ |
| **Viem** | 链上数据读取 | 2+ |

### 智能合约 (Smart Contract)

| 技术 | 用途 | 版本 |
|------|------|------|
| **Solidity** | 合约语言 | 0.8.20+ |
| **OpenZeppelin** | 安全合约库 | 5+ |
| **Hardhat** | 开发框架 | 2+ |
| **Monad Testnet** | 部署链 | latest |

---

## 数据库设计

### PostgreSQL 表结构

#### skills (Skills 表)
```sql
CREATE TABLE skills (
  id SERIAL PRIMARY KEY,
  skill_id BYTEA NOT NULL UNIQUE,        -- 链上 skillId (bytes32)
  name VARCHAR(255) NOT NULL,
  description TEXT,
  platform VARCHAR(50) NOT NULL,          -- 'coze' | 'claude-code' | 'manus' | 'minimax'
  version VARCHAR(50),
  creator_address VARCHAR(42) NOT NULL,   -- 创作者钱包地址
  creator_email VARCHAR(255),             -- 可选：联系邮箱
  github_url TEXT,                        -- 可选：GitHub 仓库
  npm_url TEXT,                           -- 可选：npm 包地址
  logo_url TEXT,                          -- 可选：Skill 图标
  total_tips NUMERIC DEFAULT 0,           -- 累计打赏（冗余，加速查询）
  install_count INTEGER DEFAULT 0,        -- 安装量（后续从 npm 获取）
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_skills_platform ON skills(platform);
CREATE INDEX idx_skills_creator ON skills(creator_address);
CREATE INDEX idx_skills_tips ON skills(total_tips DESC);
```

#### tips (打赏记录表)
```sql
CREATE TABLE tips (
  id SERIAL PRIMARY KEY,
  tx_hash VARCHAR(66) NOT NULL UNIQUE,    -- 交易哈希
  skill_id BYTEA,                         -- NULL 表示直接打赏创作者
  from_address VARCHAR(42) NOT NULL,       -- 打赏者
  to_address VARCHAR(42) NOT NULL,        -- 收款创作者
  amount NUMERIC NOT NULL,                -- 打赏金额
  creator_received NUMERIC NOT NULL,      -- 创作者实际收到
  platform_fee NUMERIC NOT NULL,          -- 平台费用
  message TEXT,                           -- 留言（IPFS hash）
  block_number BIGINT,
  transaction_index INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_tips_from ON tips(from_address);
CREATE INDEX idx_tips_to ON tips(to_address);
CREATE INDEX idx_tips_skill ON tips(skill_id);
CREATE INDEX idx_tips_created ON tips(created_at DESC);
```

#### sponsors (赞助活动表)
```sql
CREATE TABLE sponsors (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  sponsor_address VARCHAR(42) NOT NULL,    -- 项目方钱包
  total_amount NUMERIC NOT NULL,           -- 总赞助金额
  remaining_amount NUMERIC NOT NULL,       -- 剩余金额
  tags TEXT[],                             -- 相关标签 ['ai', 'coding', 'data']
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP,
  description TEXT,
  logo_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### faucet_claim (水龙头领取记录)
```sql
CREATE TABLE faucet_claim (
  id SERIAL PRIMARY KEY,
  address VARCHAR(42) NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 1000,
  tx_hash VARCHAR(66),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_faucet_address ON faucet_claim(address);
CREATE INDEX idx_faucet_created ON faucet_claim(created_at);
```

---

## Redis 缓存策略

### 缓存 Key 设计

```
# Skill 详情缓存
skill:detail:{skill_id}          TTL: 1小时

# Skills 列表缓存（分页）
skills:list:{platform}:{page}:{sort}  TTL: 5分钟

# 创作者收益缓存
creator:earnings:{address}       TTL: 10分钟

# 热门排行榜缓存
rankings:hot:daily               TTL: 1小时
rankings:tips:weekly             TTL: 1小时

# 水龙头限流
faucet:limit:{address}           TTL: 24小时
```

---

## API 设计

### REST API 端点

#### Skills 相关
```
GET    /api/skills              # 获取 Skills 列表（分页、筛选）
GET    /api/skills/:skillId     # 获取 Skill 详情
GET    /api/skills/trending     # 获取热门 Skills
POST   /api/skills              # 创建 Skill（需要签名）
```

#### 打赏相关
```
GET    /api/tips                # 获取打赏记录
GET    /api/tips/stats          # 获取平台统计数据
GET    /api/tips/creator/:address  # 获取创作者收益详情
```

#### 用户相关
```
GET    /api/user/:address       # 获取用户信息
GET    /api/user/:address/tips  # 获取用户打赏历史
GET    /api/user/:address/skills  # 获取用户创建的 Skills
```

#### 水龙头相关
```
POST   /api/faucet/claim        # 领取测试币（限流）
GET    /api/faucet/status       # 查询领取状态
```

---

## 安全考虑

### 1. 前端安全
- 钱包连接：仅与 Monad 测试网交互
- 交易签名：所有写操作需要用户签名确认
- 输入验证：所有用户输入进行验证和清理

### 2. 后端安全
- API 限流：防止 DDoS 攻击
- CORS 配置：限制允许的域名
- 环境变量：敏感信息不存放在代码中

### 3. 智能合约安全
- 使用 OpenZeppelin 审计过的合约
- 重入攻击防护（使用 ReentrancyGuard）
- 权限控制（使用 Ownable）
- 金额安全检查（防止溢出）

---

## 部署架构

```
┌─────────────────────────────────────────────────────────────┐
│                        用户                                  │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    Vercel (CDN)                              │
│              前端静态资源 + Serverless                       │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                  Neon / Supabase                            │
│                    PostgreSQL 数据库                         │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                   Upstash Redis                              │
│                      缓存层                                  │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                 Monad Testnet RPC                            │
│                    智能合约层                                │
└─────────────────────────────────────────────────────────────┘
```

---

## MVP 范围

### 黑客松期间完成（P0）
- [x] 智能合约部署到 Monad 测试网
- [ ] 前端基础页面（首页、Skill列表、打赏弹窗）
- [ ] 钱包连接功能
- [ ] 打赏功能完整流程
- [ ] Skill 创建/注册功能
- [ ] 水龙头功能（测试币领取）

### 黑客松后迭代（P1）
- [ ] 完整后端 API
- [ ] 数据库集成
- [ ] Redis 缓存
- [ ] npm 流量抓取
- [ ] 项目方赞助功能

### 未来扩展（P2）
- [ ] 多链部署（Solana）
- [ ] 移动端 App
- [ ] 创作者个人主页
- [ ] 技能评论/评分系统
