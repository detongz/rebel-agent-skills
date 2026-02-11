/**
 * Jest 测试配置
 */

module.exports = {
  // 测试环境
  testEnvironment: 'node',

  // 测试文件匹配模式
  testMatch: [
    '**/tests/**/*.test.ts'
  ],

  // 覆盖率收集（可选）
  collectCoverageFrom: [
    'src/**/*.ts',
  ],

  // 覆盖率阈值
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },

  // 覆盖率报告格式
  coverageReporters: [
    'text',
    'lcov',
    'html'
  ],

  // verbose output
  verbose: true,

  // 每个测试文件运行时清除模拟
  clearMocks: true,

  // 模块名称映射（用于 TypeScript 路径解析）
  moduleNameMapper: {
    '^@myskills/shared/(.*)$': '<rootDir>/../shared/src/$1',
    '^@myskills/(.*)$': '<rootDir>/../shared/src/$1',
  },
};
