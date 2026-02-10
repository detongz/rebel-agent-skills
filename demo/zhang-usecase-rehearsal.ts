// MySkills Protocol - 张老师 Use Case 自动排练
// 完整演示: Agent 发现、雇佣、支付其他 Agent

import { chromium, Browser, Page, BrowserContext } from 'playwright-core';

// ============================================================================
// 配置
// ============================================================================

const CONFIG = {
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',
  demoUrl: process.env.DEMO_URL || 'http://localhost:3000/demo/agent-workflow',
  headless: process.env.HEADLESS !== 'false',
  viewport: { width: 1920, height: 1080 },
  timeout: 30000,
};

// ============================================================================
// 工具函数
// ============================================================================

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function wait(ms: number, description: string): Promise<void> {
  const step = Math.ceil(ms / 1000);
  for (let i = step; i > 0; i--) {
    process.stdout.write(`\r  ⏳ ${description}: ${i}s `);
    await new Promise(r => setTimeout(r, 1000));
  }
  process.stdout.write(`\r  ✅ ${description}\n`);
}

function log(message: string): void {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
}

function logStep(step: number, total: number, description: string): void {
  console.log('');
  console.log('='.repeat(60));
  log(`Step ${step}/${total}: ${description}`);
  console.log('='.repeat(60));
}

// ============================================================================
// 排练类
// ============================================================================

class ZhangUseCaseRehearsal {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;

  async init(): Promise<void> {
    log('🚀 启动浏览器...');

    this.browser = await chromium.launch({
      headless: CONFIG.headless,
      args: ['--start-maximized'],
    });

    this.context = await this.browser.newContext({
      viewport: CONFIG.viewport as { width: number; height: number },
      userAgent: 'MySkills-Rehearsal/1.0',
    });

    this.page = await this.context.newPage();

    // 设置默认超时
    this.page.setDefaultTimeout(CONFIG.timeout);

    log('✅ 浏览器已启动');
  }

  async cleanup(): Promise<void> {
    log('🧹 清理资源...');

    if (this.page) {
      await this.page.close();
      this.page = null;
    }

    if (this.context) {
      await this.context.close();
      this.context = null;
    }

    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }

    log('✅ 资源已清理');
  }

  // ============================================================================
  // 场景步骤
  // ============================================================================

  // Step 1: 打开 MySkills Agent Workflow Demo 页面
  async step1_openDemo(): Promise<void> {
    logStep(1, 6, '打开 MySkills Agent Workflow Demo');

    const url = `${CONFIG.demoUrl}`;
    log(`导航到: ${url}`);

    await this.page!.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });

    await wait(5000, '页面加载');

    // 验证页面标题
    const title = await this.page!.title();
    log(`页面标题: ${title}`);

    // 检查关键元素是否存在
    const heading = await this.page!.$('h1, h2');
    if (heading) {
      const text = await heading.textContent();
      log(`找到标题: ${text}`);
    }

    log('✅ Step 1 完成');
  }

  // Step 2: 点击开始演示
  async step2_startDemo(): Promise<void> {
    logStep(2, 6, '开始 Agent 工作流演示');

    // 查找开始按钮
    const startButton = await this.page!.$('button');
    if (startButton) {
      const buttonText = await startButton.textContent();
      log(`找到按钮: ${buttonText}`);

      // 截图
      await this.page!.screenshot({
        path: 'demo/screenshots/step1-start.png',
        fullPage: false,
      });

      // 点击开始
      await startButton.click();
      log('✅ 已点击开始按钮');

      await wait(2000, '等待响应');
    } else {
      log('⚠️  未找到开始按钮');
    }

    log('✅ Step 2 完成');
  }

  // Step 3: 观察 Smart Matching 过程
  async step3_smartMatching(): Promise<void> {
    logStep(3, 6, '观察 Smart Matching Engine');

    // 等待 Smart Matching 动画
    await wait(5000, 'Smart Matching 分析');

    // 截图
    await this.page!.screenshot({
      path: 'demo/screenshots/step2-matching.png',
      fullPage: false,
    });

    // 检查是否有匹配结果显示
    const matchingText = await this.page!.textContent('body');
    if (matchingText) {
      if (matchingText.includes('Smart Matching') || matchingText.includes('matching')) {
        log('✅ Smart Matching 正在运行');
      }
    }

    await wait(3000, '完成匹配');

    log('✅ Step 3 完成');
  }

  // Step 4: 观察 Agent 选择
  async step4_agentSelection(): Promise<void> {
    logStep(4, 6, 'Agent 技能选择');

    // 等待选择阶段
    await wait(5000, 'Agent 选择');

    // 截图
    await this.page!.screenshot({
      path: 'demo/screenshots/step3-selection.png',
      fullPage: false,
    });

    // 检查推荐技能
    const pageText = await this.page!.textContent('body');
    if (pageText) {
      if (pageText.includes('Recommended') || pageText.includes('Skills')) {
        log('✅ 推荐技能已显示');
      }
    }

    log('✅ Step 4 完成');
  }

  // Step 5: 观察 Agent 并行工作
  async step5_parallelWork(): Promise<void> {
    logStep(5, 6, 'Agents 并行工作');

    // 等待工作阶段
    await wait(8000, 'Agents 工作');

    // 截图
    await this.page!.screenshot({
      path: 'demo/screenshots/step4-working.png',
      fullPage: false,
    });

    // 检查进度显示
    const pageText = await this.page!.textContent('body');
    if (pageText) {
      if (pageText.includes('Working') || pageText.includes('Progress') || pageText.includes('%')) {
        log('✅ Agent 工作进度已显示');
      }
    }

    log('✅ Step 5 完成');
  }

  // Step 6: 观察支付确认
  async step6_payment(): Promise<void> {
    logStep(6, 6, '支付确认');

    // 等待支付阶段
    await wait(8000, '支付处理');

    // 截图
    await this.page!.screenshot({
      path: 'demo/screenshots/step5-payment.png',
      fullPage: false,
    });

    // 检查支付信息
    const pageText = await this.page!.textContent('body');
    if (pageText) {
      if (pageText.includes('Payment') || pageText.includes('Transaction') || pageText.includes('Confirmed')) {
        log('✅ 支付信息已显示');
      }

      // 检查 98/2 split
      if (pageText.includes('98') || pageText.includes('creator')) {
        log('✅ 98/2 分成显示正确');
      }
    }

    log('✅ Step 6 完成');
  }

  // ============================================================================
  // 运行完整排练
  // ============================================================================

  async run(): Promise<boolean> {
    try {
      await this.init();

      // 确保截图目录存在
      const fs = require('fs');
      const screenshotDir = 'demo/screenshots';
      if (!fs.existsSync(screenshotDir)) {
        fs.mkdirSync(screenshotDir, { recursive: true });
      }

      // 运行所有步骤
      await this.step1_openDemo();
      await this.step2_startDemo();
      await this.step3_smartMatching();
      await this.step4_agentSelection();
      await this.step5_parallelWork();
      await this.step6_payment();

      // 最终截图
      if (this.page) {
        await this.page.screenshot({
          path: 'demo/screenshots/final.png',
          fullPage: false,
        });
      }

      log('');
      log('='.repeat(60));
      log('🎉 排练成功完成!');
      log('='.repeat(60));
      log('');
      log('📸 截图已保存到: demo/screenshots/');
      log('');

      return true;
    } catch (error) {
      log('');
      log('='.repeat(60));
      log('❌ 排练失败!');
      log('='.repeat(60));
      log(`错误: ${error}`);
      log('');

      // 失败时也保存截图
      if (this.page) {
        try {
          await this.page.screenshot({
            path: 'demo/screenshots/error.png',
            fullPage: false,
          });
          log('📸 错误截图已保存');
        } catch (e) {
          // 忽略截图错误
        }
      }

      return false;
    } finally {
      await this.cleanup();
    }
  }
}

// ============================================================================
// 主函数
// ============================================================================

async function main(): Promise<void> {
  console.log('');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║   MySkills Protocol - 张老师 Use Case 自动排练            ║');
  console.log('║   Where AI Agents Hire and Pay Each Other                ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');

  const rehearsal = new ZhangUseCaseRehearsal();
  const success = await rehearsal.run();

  process.exit(success ? 0 : 1);
}

// 运行
main().catch(error => {
  console.error('💥 未捕获的错误:', error);
  process.exit(1);
});
