# MySkills CLI - 测试文档

## 概述

本目录包含 MySkills Protocol 的完整测试套件，使用**自然语言描述的测试用例**，模拟真实用户使用场景。

## 测试结构

```
tests/
├── unit/              # 单元测试 - 测试各个模块的独立功能
│   ├── config.test.ts  # 配置模块测试
│   └── api.test.ts     # API 模块测试
└── integration/        # 集成测试 - 测试完整工作流程
    ├── cli.commands.test.ts  # CLI 命令集成测试
    └── workflow.test.ts    # 端到端工作流测试
```

## 运行测试

### 运行所有测试

```bash
# 从项目根目录运行
npm test

# 只运行单元测试
npm test --testPathPattern=tests/unit

# 只运行集成测试
npm test --testPathPattern=tests/integration

# 运行特定测试文件
npm test -- workflow.test.ts
```

### 生成覆盖率报告

```bash
npm test -- --coverage
```

覆盖率报告将生成在 `coverage/` 目录。

---

## 测试场景说明

### 单元测试 (unit/)

#### config.test.ts
- **测试目标**：验证 `@myskills/shared/config` 模块功能
- **测试内容**：
  - ✅ `loadConfig()` - 配置文件加载
  - ✅ `saveConfig()` - 配置文件保存
  - ✅ `MONAD_TESTNET` - 网络配置常量
  - ✅ `NETWORK` - 动态网络选择
  - ✅ `ASKL_TOKEN_ABI` - 合约 ABI

#### api.test.ts
- **测试目标**：验证 `@myskills/shared/api` 模块功能
- **测试内容**：
  - ✅ `apiPost()` - POST 请求发送
  - ✅ `searchSkills()` - 技能搜索
  - ✅ `scanSkill()` - 安全扫描
  - ✅ `parseGitHubUrl()` - GitHub URL 解析
  - ✅ `loadRegistry()` - 本地注册表加载

### 集成测试 (integration/)

#### cli.commands.test.ts
- **测试目标**：验证 CLI 命令与共享模块的集成
- **测试内容**：
  - ✅ 配置模块导入验证
  - ✅ API 模块导入验证
  - ✅ 注册表模块导入验证
  - ✅ OpenClaw 插件真实数据源验证

#### workflow.test.ts - **端到端工作流测试**
这是最重要的测试套件，使用**自然语言描述测试用例**，模拟以下真实用户场景：

---

##### 场景一：创作者首次发布技能

**用例名称**：`作为一个技能创作者，我想要将我的技能发布到 MySkills 平台`

**预期目标**：
- ✅ 用户可以成功登录钱包
- ✅ 系统能正确解析 GitHub 仓库 URL
- ✅ 安全扫描功能正常工作
- ✅ 技能可以成功发布到 Monad 区块链

**验证步骤**：
1. 钱包登录验证
2. GitHub 仓库解析验证
3. 安全扫描功能验证
4. 区块链发布验证

---

##### 场景二：用户搜索和发现技能

**用例名称**：`作为一个用户，我想要搜索适合我需求的技能`

**预期目标**：
- ✅ 用户可以通过关键词搜索技能
- ✅ 用户可以查看技能排行榜
- ✅ 用户可以获取技能详细信息

**验证步骤**：
1. 技能搜索功能验证
2. 排行榜功能验证
3. 技能详情获取验证

---

##### 场景三：用户支持创作者（提示功能）

**用例名称**：`作为一个用户，我想要给有用的技能创作者发送提示以示感谢`

**预期目标**：
- ✅ 用户可以查询钱包余额
- ✅ 用户可以发送 MON 代币作为提示
- ✅ 区块链交易正常确认

**验证步骤**：
1. 余额查询功能验证
2. 提示发送功能验证
3. 区块链交易验证

---

##### 场景四：OpenClaw 插件与主协议集成

**用例名称**：`通过 OpenClaw 插件使用 MySkills Protocol`

**预期目标**：
- ✅ OpenClaw 使用真实 API 数据（非 mock）
- ✅ OpenClaw 支持区块链交互
- ✅ OpenClaw 正确导入共享 API 模块

**验证步骤**：
1. 真实 API 数据验证（已移除 mock 数据）
2. 区块链功能验证
3. API 导入正确性验证

---

## 测试覆盖的功能模块

| 模块 | 单元测试 | 集成测试 |
|------|---------|---------|
| @myskills/shared/config | ✅ | ✅ |
| @myskills/shared/api | ✅ | ✅ |
| @myskills/shared/github | ✅ | ✅ |
| @myskills/shared/registry | ✅ | ✅ |
| @myskills/shared/core | - | ✅ |
| CLI commands | - | ✅ |
| OpenClaw plugin | - | ✅ |

## 持续集成 (CI/CD)

要在 CI/CD 流程中运行测试，确保：

1. **所有测试通过**后再合并代码
2. **覆盖率不低于 70%**
3. **所有场景的端到端测试通过**

## 故障排查

### 测试失败

如果测试失败，检查：
1. 共享包是否已构建：`cd ../shared && npm run build`
2. 共享包是否正确安装：`npm install file:../shared`
3. TypeScript 配置是否正确：检查 `tsconfig.json` 中的 `paths` 配置

### 调试模式

```bash
# 运行测试并进入调试模式
node --inspect-brk node_modules/.bin/jest --runInBand

# 或者使用 VSCode 调试器
npm test -- --watch
```

---

## 相关文档

- [主项目 README](../../README.md)
- [共享包文档](../../shared/README.md)
- [OpenClaw 插件文档](../../openclaw/README.md)
