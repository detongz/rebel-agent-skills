# Playwright 测试套件

Agent Skills Protocol 的端到端测试套件。

## 测试结构

```
tests/
├── api/              # API 层测试（不涉及 UI）
│   └── tip-api.spec.ts
├── e2e/              # 端到端 UI 测试
│   └── tip-flow.spec.ts
├── contract/         # 智能合约交互测试
│   └── contract-interaction.spec.ts
├── integration/      # 集成测试（完整流程）
│   └── full-tip-flow.spec.ts
└── helpers/          # 测试辅助工具和数据
    └── test-data.ts
```

## 运行测试

### 所有测试
```bash
npm test
```

### 分类运行
```bash
npm run test:api          # 只运行 API 测试
npm run test:e2e          # 只运行 E2E 测试
npm run test:contract     # 只运行合约测试
npm run test:integration  # 只运行集成测试
```

### 调试模式
```bash
npm run test:ui           # 使用 Playwright UI
npm run test:debug        # 调试模式，逐步执行
npm run test:headed       # 显示浏览器窗口
```

### 查看报告
```bash
npm run test:report       # 查看 HTML 测试报告
```

## 测试覆盖

### API 测试 (`tests/api/`)
- ✅ POST /api/tip - 创建打赏记录
- ✅ 参数验证
- ✅ 错误处理
- ✅ 费用分账计算 (98/2)

### E2E 测试 (`tests/e2e/`)
- ✅ 页面加载和导航
- ✅ TipModal 交互
- ✅ 表单验证
- ✅ 费用分账显示
- ✅ 钱包连接流程

### 合约测试 (`tests/contract/`)
- ✅ 合约部署验证
- ✅ 代币信息读取
- ✅ 余额查询
- ✅ Monad Testnet 连接

### 集成测试 (`tests/integration/`)
- ✅ 完整打赏流程
- ✅ 错误处理
- ✅ 数据一致性

## CI/CD 集成

在 GitHub Actions 中运行：

```yaml
- name: Run tests
  run: |
    npm install
    npm run test
```

## 注意事项

1. **Web3 测试限制**：真实的合约交易需要钱包签名，目前测试主要验证 UI 和 API 层

2. **测试数据**：测试使用 mock 数据，不会影响生产数据库

3. **网络依赖**：合约测试需要连接到 Monad Testnet RPC

4. **浏览器要求**：首次运行需要安装 Playwright 浏览器：
   ```bash
   npx playwright install
   ```

## 添加新测试

1. 在对应目录创建 `.spec.ts` 文件
2. 导入测试数据：`import { ... } from '../helpers/test-data'`
3. 使用 `test.describe()` 组织测试
4. 运行 `npm test` 验证
