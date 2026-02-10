# Discord服务器快速启动指南

**目标**：今天内完成Discord服务器搭建

---

## 第一步：创建服务器（5分钟）

### 1.1 基础设置

1. 打开Discord
2. 点击左侧 "+" 创建服务器
3. 选择"从头开始"
4. 服务器名称：`MySkills Protocol`
5. 上传logo（使用myskills logo）

### 1.2 初次设置

```
服务器类型：🎮 游戏社区
服务器区域：根据用户选择
```

---

## 第二步：创建频道结构（15分钟）

### 按照以下顺序创建频道：

#### 信息区（Information）

```
# 📢 announcements
类型：文字
描述：重要公告和更新

# 📋 rules
类型：文字
描述：服务器规则（见下方内容）

# 🎁 welcome
类型：文字
描述：欢迎新成员

# ❓ faq
类型：文字
描述：常见问题

# 📺 demo
类型：文字
描述：Demo视频和教程
```

#### 社区区（Community）

```
# 💬 general
类型：文字
描述：一般讨论

# 📢 introductions
类型：文字
描述：介绍你自己

# 💡 ideas
类型：文字
描述：分享你的想法

# 📈 show-off
类型：文字
描述：展示你的成果

# 🤝 networking
类型：文字
描述：合作机会
```

#### 开发区（Development）

```
# 💻 smart-matching
类型：文字
描述：Smart Matching Engine讨论

# 🔧 mcp-integration
类型：文字
描述：MCP集成帮助

# 📜 smart-contracts
类型：文字
描述：合约开发讨论

# 🐛 bug-reports
类型：文字
描述：报告问题

# 🔒 security
类型：文字
描述：安全问题（私密）
```

#### Bounty区（Bounty Program）

```
# 🎯 active-bounties
类型：文字
描述：当前bounty列表

# 📤 submissions
类型：文字
描述：提交作品

# 🏆 leaderboard
类型：文字
描述：排行榜

# 💰 bounty-support
类型：文字
描述：Bounty相关问题
```

#### 语音区（Voice）

```
🎙️ General Voice
🎙️ Dev Hangout
🎙️ Community Call
🎙️ AMA Room
```

---

## 第三步：设置角色（10分钟）

### 创建以下角色（按优先级排序）：

#### 管理角色

```
👑 Founder
- 权限：管理员
- 颜色：金色 (#FFD700)
- 人数：1-3人

🛡️ Moderator
- 权限：管理消息、踢人
- 颜色：蓝色 (#3B82F6)
- 人数：3-5人
```

#### 社区角色

```
🎁 Early Creator
- 描述：前100名技能创作者
- 权限：特殊频道访问
- 颜色：橙色 (#F97316)

⭐ Verified Creator
- 描述：验证过的创作者
- 权限：发布技能
- 颜色：绿色 (#22C55E)

🦅 Super Contributor
- 描述：活跃贡献者
- 权限：高级功能
- 颜色：紫色 (#A855F7)

💎 Diamond Member
- 描述：持有超过1000 MON
- 权限：VIP通道
- 颜色：青色 (#06B6D4)
```

#### 身份角色（可选）

```
👨‍💻 Developer
🎨 Designer
📝 Writer
📊 Analyst
🔍 Auditor
💹 Trader
```

---

## 第四步：设置欢迎消息（10分钟）

### 使用Carl-bot或MEE6设置

#### 欢迎消息模板

```
{member} 欢迎来到 MySkills Protocol! 🎉

📋 接下来：

1️⃣ 去 📢introductions 介绍你自己
2️⃣ 阅读 📋rules 了解社区规范
3️⃣ 查看 🎁active-bounties 获取赚钱机会
4️⃣ 访问 myskills2026.ddttupupo.buzz

🎁 早期成员福利：
- 前100名创作者获得 50 MON
- "Founding Member" 徽章
- 启动时featured展示

有问题随时@mod！🚀

让我们共同构建agent经济！
```

#### 自动分配角色

```
新成员加入时自动分配：
- 🌱 Newcomer 角色

当用户发布介绍后：
- 移除 🌱 Newcomer
- 添加 ✅ Verified Member
```

---

## 第五步：设置规则频道（5分钟）

### 复制以下规则：

```
📋 MySkills Protocol 社区规则

1️⃣ 尊重他人
   - 禁止骚扰、歧视、仇恨言论
   - 保持建设性讨论

2️⃣ 内容相关
   - 讨论与MySkills Protocol相关
   - General频道可以闲聊

3️⃣ 禁止 spam
   - 不要刷屏
   - 不要重复发布相同内容
   - 不要广告（除非授权）

4️⃣ 诚实守信
   - Bounty作弊=永久封禁
   - 伪造信息=永久封禁
   - 欺诈行为=永久封禁

5️⃣ 安全第一
   - 疑似安全问题私聊mod
   - 不要公开分享exploit
   - 漏洞奖励：up to 1000 MON

6️⃣ 语言友好
   - 英文和中文都可以
   - 尊重不同文化背景

⚠️ 违规处罚：
- 第一次：警告
- 第二次：禁言24小时
- 第三次：永久封禁

有问题？@mod

最后更新：2025-02-10
```

---

## 第六步：设置Bot（15分钟）

### 推荐Bot列表

#### 1. Carl-bot（必备）

```
功能：
- 欢迎消息
- 自动角色分配
- Reaction roles
- Mod logs

安装：
1. 访问 carl.gg
2. 添加到服务器
3. 配置欢迎消息
4. 设置反应角色
```

#### 2. MEE6（可选）

```
功能：
- Leveling system
- Custom commands
- Moderation

安装：
1. 访问 mee6.xyz
2. 添加到服务器
3. 配置leveling
```

#### 3. Tip.Bot（加密货币tip）

```
功能：
- MON tip
- Leaderboard
- Wallet integration

安装：
1. 访问 tip.bot
2. 添加到服务器
3. 配置MON token
```

---

## 第七步：设置FAQ频道（10分钟）

### 复制以下FAQ：

```
❓ 常见问题

Q: MySkills Protocol是什么？
A: Agent技能的支付协议，就像"Agent App Store"。
   详细：myskills2026.ddttupupo.buzz

Q: 如何注册技能？
A: 访问网站 → 点击"Register" → 填写表单

Q: 我能赚多少？
A: 取决于你的技能需求度。
   示例：审计技能(10 MON/次) × 10次/周 = 100 MON/周

Q: 需要会写代码吗？
A: 不一定！Prompt engineering也算技能。

Q: 支持哪些平台？
A: Claude Code, Coze, Manus, MiniMax等。

Q: 如何获得50 MON奖励？
A: 前100名注册技能的创作者。

Q: MON是什么？
A: Monad区块链的原生token。
   Testnet: 免费获取
   Mainnet: 需要购买

Q: 什么时候主网？
A: Monad主网预计Q2 2025。
   我们先在testnet运行。

Q: 如何参与bounty？
A: 查看 🎁active-bounties 频道

Q: 可以提现收益吗？
A: 主网上线后可以。

更多问题？在 💬general 提问！
```

---

## 第八步：设置公告（5分钟）

### 第一条公告模板

```
🎉 欢迎来到 MySkills Protocol Discord!

我们正在构建：
🏪 Agent App Store
🤖 Smart Matching Engine
💸 Instant Payments on Monad

🎁 早期成员福利：
- 前100名创作者：50 MON
- 所有成员：参与社区活动

📅 接下来的活动：
- [ ] Bounty Program Launch (Day 3)
- [ ] First Community Call (Day 5)
- [ ] Smart Matching Workshop (TBD)

📺 快速开始：
1. 观看Demo: myskills2026.ddttupupo.buzz
2. 介绍你自己: #introductions
3. 查看Bounty: #active-bounties

🚀 让我们共同构建agent经济！
```

---

## 第九步：邀请种子用户（立即执行）

### 邀请链接设置

```
创建永久邀请链接：
1. 服务器设置 → 邀请
2. 创建邀请
3. 设置为永久有效
4. 无使用次数限制

链接示例：
https://discord.gg/myskills
```

### 首批邀请目标（20-30人）

```
Web3开发者朋友：
- [ ] 朋友1 (Solidity dev)
- [ ] 朋友2 (Full-stack web3)
- [ ] 朋友3 (AI/ML engineer)

Twitter followers:
- [ ] @活跃follower1
- [ ] @活跃follower2
- [ ] @活跃follower3

GitHub contributors:
- [ ] @contributor1
- [ ] @contributor2

社区成员:
- [ ] Monad Discord成员
- [ ] Claude Code社区成员
- [ ] Web3 builder groups
```

---

## 第十步：启动活动（Day 1-3）

### Day 1活动：介绍派对

```
🎉 INTRODUCTION PARTY

时间：Launch当天晚上8PM EST
地点：🎙️ General Voice

活动内容：
- 自我介绍
- 分享你的agent skill想法
- Q&A session
- 随机drop 10 MON奖励参与者

Duration: 1 hour
```

### Day 3活动：Bounty Program Launch

```
🎁 BOUNTY PROGRAM LAUNCH

时间：Day 3 上午10AM
地点：💬 general

活动内容：
- 宣布bounty详情
- Q&A about requirements
- 开始接受提交

Duration: Ongoing
```

---

## 检查清单（Launch前）

**基础设置**：
- [ ] 服务器创建
- [ ] 所有频道创建
- [ ] 角色设置完成
- [ ] Bot添加并配置

**内容准备**：
- [ ] Rules频道内容
- [ ] FAQ频道内容
- [ ] Welcome消息设置
- [ ] 首条公告发布

**用户准备**：
- [ ] 邀请20-30个种子用户
- [ ] 设置mod团队
- [ ] 准备欢迎消息

**活动准备**：
- [ ] Day 1活动安排
- [ ] Bounty program ready
- [ ] Calendar events设置

---

## 立即行动

**今天就做**：
1. [ ] 创建Discord服务器（5分钟）
2. [ ] 创建所有频道（15分钟）
3. [ ] 设置角色（10分钟）
4. [ ] 写好rules和welcome（15分钟）
5. [ ] 邀请前10个朋友（5分钟）

**今天完成总计：50分钟**

**明天**：
1. [ ] 添加Carl-bot
2. [ ] 设置reaction roles
3. [ ] 邀请更多用户
4. [ ] 举办intro party

**Day 3**：
1. [ ] 发布bounty program
2. [ ] 开始community call
3. [ ] 更新leaderboard

---

## 成功指标

**Week 1目标**：
- 50+ Discord members
- 20+ introductions
- 10+ skills registered
- 100+ messages per day

**Week 2目标**：
- 200+ Discord members
- 50+ introductions
- 30+ skills registered
- 500+ messages per day

---

## 需要帮助？

**Discord Bot Resources**：
- carl.gg - Carl-bot setup
- mee6.xyz - MEE6 setup
- discord.js - Build custom bot

**Design Resources**：
- Canva - Server banner
- Figma - Channel icons
- Discord Templates - Server templates

**Community Resources**：
- Discord Moderators subreddit
- Discord Community server
- r/discordapp

---

开始搭建吧！今天完成基础设置，明天开始邀请用户！🚀
