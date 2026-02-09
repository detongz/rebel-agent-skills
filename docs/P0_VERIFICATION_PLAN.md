# P0 Verification Plan

## Overview
验证所有 P0 修复正常工作，确保可以开始录制 demo 视频。

## Checklist

### 1. Smart Contract (已部署)
- ✅ 合约地址: `0xc1fFCAD15e2f181E49bFf2cBea79094eC9B5033A`
- ✅ 网络: Monad Testnet (Chain ID: 10143)
- ✅ 98/2 分账比例
- ✅ 部署者钱包: `0x7F0bDc7dFb0A601f24eBbFD7fd3514575ecBE08b`

### 2. MCP Server
- [ ] 启动成功 (`cd packages/mcp-server && npm start`)
- [ ] 合约连接正常
- [ ] 所有工具可用

### 3. Core Functions
- [ ] `list_skills` - 列出所有技能
- [ ] `get_skill` - 获取技能详情
- [ ] `tip_creator` - 打赏创作者
- [ ] `register_skill` - 注册新技能
- [ ] `get_leaderboard` - 获取排行榜
- [ ] `get_mon_balance` - 查询 MON 余额
- [ ] `get_askl_balance` - 查询 ASKL 余额

### 4. Frontend
- [ ] `/demo-moltiverse` 页面可访问
- [ ] `/demo-blitz-pro` 页面可访问
- [ ] RainbowKit 钱包连接正常
- [ ] 打赏功能可用

### 5. Bounty System (MVP - off-chain)
- [ ] `post_bounty` - 发布赏金
- [ ] `list_bounties` - 列出赏金
- [ ] `submit_audit` - 提交审计
- [ ] 注意: MVP 使用 Map 存储，重启后数据丢失

## Test Scenarios

### Scenario 1: 完整打赏流程
```bash
1. 注册技能
2. 查询排行榜
3. 打赏创作者
4. 验证 98/2 分账
5. 查询更新后的排行榜
```

### Scenario 2: Bounty 流程 (MVP)
```bash
1. 发布赏金
2. 列出赏金
3. 提交审计
4. 查询赏金状态
```

## Success Criteria

- ✅ 所有核心功能正常工作
- ✅ 无严重 bug 或错误
- ✅ Monad testnet 交易成功确认
- ✅ Demo 视频可以开始录制

## Roles

- **dev-agent**: 代码层面验证，启动 MCP Server
- **test-agent**: 端到端测试，边界情况测试
- **gatekeeper-agent**: 安全性审查，Gas 优化验证

## Timeline

- 预计开始: review-agent 完成 pitch 更新后
- 预计完成: 30 分钟内
- 输出: P0 验证报告

---

Generated: 2026-02-09
