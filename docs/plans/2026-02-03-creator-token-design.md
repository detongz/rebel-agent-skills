# 创作者代币功能设计

## 概述

允许创作者为自己发行的 Agent Skill 绑定或发行自己的代币，用户打赏时自动接收创作者代币，形成"创作者经济"飞轮。

---

## 核心价值

| 对于创作者 | 对于用户 | 对于平台 |
|-------------------|-----------------|-----------------|
| 发行自己的 meme 币 | 支持 = 投资创作者 | 交易手续费收入 |
| 代币升值 = 收益增加 | 早期支持可能获利 | 生态繁荣 |
| 建立 DAO 社区 | 参与创作者治理 | 锁定用户 |

---

## 功能架构

### 方案 A：绑定现有代币

创作者已经有代币，绑定到 Skill：

```bash
# 创作者命令
myskills register my-skill --token-address 0x123... --chain solana

# 用户打赏时
myskills reward my-skill 100 --token creator
# 自动接收创作者绑定的代币
```

### 方案 B：一键发币

创作者没有代币，平台帮其发行：

```bash
# 创作者一键发 meme 币
myskills launch-token my-skill \
  --name "MySkillToken" \
  --symbol "MST" \
  --supply 1000000 \
  --chain solana

# 自动部署代币合约并绑定到 Skill
```

---

## 支持的公链

| 公链 | 代币标准 | 优势 |
|------|----------|------|
| **Solana** | SPL Token | 便宜、快速、meme 生态活跃 |
| **Base** | ERC20 | Coinbase 生态、L2 便宜 |
| **Monad** | ERC20 | 平台原生链 |
| **BSC** | BEP20 | 低费、用户多 |

---

## 技术实现

### 数据库扩展

```sql
-- 创作者代币表
CREATE TABLE creator_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  skill_id INTEGER NOT NULL,
  creator_address TEXT NOT NULL,

  -- 代币信息
  token_name TEXT NOT NULL,
  token_symbol TEXT NOT NULL,
  token_address TEXT NOT NULL,
  chain TEXT NOT NULL,  -- solana, base, monad, bsc

  -- 经济参数
  total_supply TEXT NOT NULL,
  creator_allocation INTEGER DEFAULT 20,  -- 创作者保留 %
  reward_pool TEXT DEFAULT '0',  -- 打赏池

  -- 状态
  is_launched BOOLEAN DEFAULT FALSE,
  launch_tx_hash TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- 打赏记录（支持多代币）
CREATE TABLE tips_multi_token (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  skill_id INTEGER NOT NULL,
  tipper_address TEXT NOT NULL,
  creator_address TEXT NOT NULL,

  -- 打赏代币
  amount TEXT NOT NULL,
  token_address TEXT,
  token_symbol TEXT DEFAULT 'ASKL',

  -- 如果是创作者代币，记录汇率
  askl_price TEXT,  -- 1 个创作者代币 = 多少 ASKL

  created_at TEXT DEFAULT (datetime('now'))
);
```

### 智能合约扩展

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// 创作者可以部署自己的代币
contract CreatorTokenFactory {
    struct TokenConfig {
        string name;
        string symbol;
        uint256 totalSupply;
        address creator;
        uint256 creatorAllocation; // 基点，2000 = 20%
    }

    mapping(address => address[]) public creatorTokens;
    mapping(address => uint256) public skillToToken;

    event TokenCreated(
        address indexed token,
        address indexed creator,
        string name,
        string symbol
    );

    function createToken(TokenConfig memory config, uint256 skillId)
        external
        returns (address tokenAddress)
    {
        CreatorToken newToken = new CreatorToken(
            config.name,
            config.symbol,
            config.totalSupply,
            config.creator,
            config.creatorAllocation
        );

        tokenAddress = address(newToken);
        creatorTokens[config.creator].push(tokenAddress);
        skillToToken[skillId] = tokenAddress;

        emit TokenCreated(tokenAddress, config.creator, config.name, config.symbol);
    }
}

// 创作者代币合约
contract CreatorToken is ERC20, Ownable {
    uint256 public constant REWARD_POOL = 8000; // 80% 用于打赏池

    constructor(
        string memory name,
        string memory symbol,
        uint256 totalSupply,
        address creator,
        uint256 creatorAllocation
    ) ERC20(name, symbol) Ownable(creator) {
        // 创作者分配
        _mint(creator, (totalSupply * creatorAllocation) / 10000);
        // 打赏池分配（托管在平台）
        _mint(msg.sender, (totalSupply * REWARD_POOL) / 10000);
    }

    function claimRewardPool(address to) external onlyOwner {
        // 创作者可以申请提取打赏池
        // 需要满足一定条件（如 Skill 评分、活跃度）
    }
}
```

### CLI 命令

```bash
# 绑定现有代币
myskills link-token <skill> \
  --address <token-address> \
  --chain <solana|base|monad|bsc>

# 一键发币
monad-skells launch-token <skill> \
  --name <token-name> \
  --symbol <symbol> \
  --supply <amount> \
  --chain <solana|base|monad|bsc> \
  --creator-alloc <%>  # 创作者保留百分比

# 用创作者代币打赏
myskills reward <skill> <amount> --token creator

# 查看创作者代币价格
monad-skells price <skill>
# 输出：1 MST = 0.05 ASKL ($0.02)

# 创作者提现打赏池
myskills claim-reward <skill>
```

---

## 代币经济模型

### 创作者代币用途

1. **打赏支付**：用户打赏时接收创作者代币
2. **DAO 治理**：持有者可投票决定 Skill 发展方向
3. **优先体验**：代币持有者优先体验新功能
4. **收益分成**：代币持有者分享 Skill 收入

### 价格发现机制

```
供需决定价格：
┌─────────────────────────────────────────────────┐
│ 需求增加 → 价格涨                               │
│   - Skill 评分高 → 更多人打赏 → 需求增加        │
│   - Skill 功能强 → 更多用户使用 → 需求增加      │
│                                                  │
│ 供应固定（或通缩）                               │
│   - 总供应量固定                                 │
│   - 打赏销毁 2%                                  │
│   - 平台回购优质代币                             │
└─────────────────────────────────────────────────┘
```

---

## 安全与风控

### 防撸毛机制

| 风险 | 防护 |
|------|------|
| 发垃圾币骗打赏 | • Skill 评分 ≥ 80 才能发币<br/>• 创作者保证金质押 |
| 拉地毯 Rug Pull | • 代币锁仓 6 个月<br/>• 打赏池分批释放 |
| 操纵价格 | • 交易量限制<br/>• 异常交易监控 |

### KYC 要求

```
发币前需要：
✓ GitPoap/Gitcoin Passport 验证
✓ Skill 评分 ≥ 80（白银以上）
✓ 质押 1000 ASKL 保证金
✓ 实名认证（可选，提高信任度）
```

---

## 收益模式

### 平台收入

| 来源 | 费率 |
|------|------|
| 发币服务费 | 0.1 SOL / 次 |
| 代币交易手续费 | 0.5% |
| 打赏池抽成 | 2% |
| 高级功能（溢价发行） | 订阅制 |

### 创作者收入

```
创作者收益 =
  初始代币分配 (20%) +
  打赏池分成 (78%) +
  代币升值收益 (资本利得)
```

---

## 用户体验示例

### 场景：用户发现一个优质 Skill

```bash
# 1. 用户搜索高分 Skills
myskills search --min-score 85 --has-token

# 输出：
# ✍️ ai-writer     Score: 92  🪙 MST ($0.05)  [购买]
# 📝 blog-assist    Score: 88  🪙 BAT ($0.02)  [购买]

# 2. 用户打赏，获得创作者代币
myskills reward ai-writer 10 ASKL
# 自动按当前汇率转换为 MST
# 收到 200 MST（价值 $10）

# 3. Skill 越火，代币越值钱
# 一个月后：
myskills price ai-writer
# 1 MST = 0.1 ASKL ($0.04)  ↗️ 2x

# 4. 用户可以：
# - 持有等待升值
# - 在 DEX 交易
# - 参与 Skill 治理
```

---

## 实施路线图

| 阶段 | 内容 | 优先级 |
|------|------|--------|
| **P0** | 绑定现有代币功能 | 高 |
| **P0** | 多代币打赏支持 | 高 |
| **P1** | Monad 链一键发币 | 中 |
| **P1** | Solana 集成 | 高 |
| **P2** | Base/BSC 集成 | 低 |
| **P2** | DEX 价格聚合 | 中 |
| **P3** | DAO 治理功能 | 低 |

---

## 合规提示

⚠️ **免责声明**：
- 创作者代币属于高风险投资
- 平台不承担价格波动责任
- 用户需自行判断投资价值
- 遵守当地法律法规

---

## 参考案例

| 项目 | 借鉴点 |
|------|--------|
| **friend.tech** | Keys 机制、创作者经济 |
| **pump.fun** | 一键发 meme 币 |
| **Galxe** | Passport 验证防女巫 |
| **Uniswap** | DEX 价格发现 |
