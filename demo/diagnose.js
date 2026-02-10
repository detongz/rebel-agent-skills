#!/usr/bin/env node
/**
 * MySkills Protocol - 简单诊断脚本
 * 检查前端服务器和页面状态
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000';
const DEMO_URL = 'http://localhost:3000/demo/agent-workflow';

function log(message) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
}

async function checkUrl(url, description) {
  return new Promise((resolve) => {
    log(`检查 ${description}: ${url}`);

    const req = http.get(url, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        log(`✅ ${description} 响应: ${res.statusCode}`);
        if (data.includes('DOCTYPE') || data.includes('<html')) {
          log(`✅ ${description} 返回 HTML 内容`);
        }
        if (data.includes('Agent') || data.includes('Workflow')) {
          log(`✅ ${description} 包含预期内容`);
        }
        resolve({ success: true, statusCode: res.statusCode, hasContent: data.length > 0 });
      });
    });

    req.on('error', (error) => {
      log(`❌ ${description} 错误: ${error.message}`);
      resolve({ success: false, error: error.message });
    });

    req.setTimeout(10000, () => {
      req.destroy();
      log(`⏱️  ${description} 超时 (10秒)`);
      resolve({ success: false, error: 'timeout' });
    });
  });
}

async function checkServer() {
  log('========================================');
  log('MySkills Protocol - 诊断脚本');
  log('========================================');
  log('');

  // 检查根路径
  const rootResult = await checkUrl(BASE_URL, '根路径 (首页)');
  log('');

  // 检查 demo 路径
  const demoResult = await checkUrl(DEMO_URL, 'Agent Workflow Demo');
  log('');

  // 总结
  log('========================================');
  log('诊断结果总结:');
  log('========================================');
  log(`首页: ${rootResult.success ? '✅ 可访问' : '❌ 不可访问'}`);
  log(`Demo: ${demoResult.success ? '✅ 可访问' : '❌ 不可访问'}`);
  log('');

  if (!rootResult.success) {
    log('⚠️  首页不可访问 - 开发服务器可能未正常运行');
    log('');
    log('💡 建议: 检查开发服务器状态');
    log('   cd frontend && npm run dev');
  }

  if (!demoResult.success) {
    log('⚠️  Demo 页面不可访问');
    log('');
    log('💡 可能的原因:');
    log('   1. 页面路由配置问题');
    log('   2. Next.js 需要重新构建');
    log('   3. 文件路径错误');
  }

  process.exit(rootResult.success && demoResult.success ? 0 : 1);
}

checkServer().catch(error => {
  log(`💥 脚本错误: ${error.message}`);
  process.exit(1);
});
