// demo-script.ts - 2分钟自动演示脚本
import { chromium, Page, Browser } from 'playwright';

async function wait(ms: number) {
  await new Promise(resolve => setTimeout(resolve, ms));
}

async function smoothScroll(page: Page, targetY: number) {
  await page.evaluate((y) => {
    window.scrollTo({ top: y, behavior: 'smooth' });
  }, targetY);
  await wait(500);
}

async function closeModal(page: Page) {
  // 尝试关闭可能的模态框
  try {
    await page.keyboard.press('Escape');
    await wait(500);
  } catch (e) {
    // 忽略
  }
}

async function main() {
  console.log('🎬 启动 2 分钟自动演示...');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 50,
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });

  const page = await context.newPage();

  // ========== 步骤 1: 首页 (0:00-0:20, 20秒) ==========
  console.log('📍 [0:00] 步骤 1: 首页 - 展示 Hero、Skills、同步按钮');
  await page.goto('http://localhost:3000');
  await wait(5000);

  await smoothScroll(page, 400);
  await wait(5000);

  const scrollHeight = await page.evaluate(() => document.body.scrollHeight);
  await smoothScroll(page, scrollHeight);
  await wait(5000);
  await smoothScroll(page, 0);
  await wait(5000);

  // ========== 步骤 2: 排行榜 (0:20-0:40, 20秒) ==========
  console.log('📍 [0:20] 步骤 2: 排行榜 - 展示 tier 系统');
  await page.goto('http://localhost:3000/leaderboard');
  await wait(3000);

  await smoothScroll(page, 300);
  await wait(8000);
  await smoothScroll(page, 600);
  await wait(5000);
  await smoothScroll(page, 0);
  await wait(4000);

  // ========== 步骤 3: Skill 详情 (0:40-1:00, 20秒) ==========
  console.log('📍 [0:40] 步骤 3: Skill 详情页');
  await page.goto('http://localhost:3000/skill/1');
  await wait(3000);

  await smoothScroll(page, 300);
  await wait(5000);
  await smoothScroll(page, 600);
  await wait(5000);
  await smoothScroll(page, 900);
  await wait(4000);
  await smoothScroll(page, 0);
  await wait(3000);

  // ========== 步骤 4: 打赏功能 (1:00-1:30, 30秒) ==========
  console.log('📍 [1:00] 步骤 4: 打赏功能演示');
  await page.waitForLoadState('networkidle');
  await wait(2000);

  // 尝试点击打赏按钮
  try {
    // 先检查是否有打开的模态框
    await closeModal(page);

    const tipButton = await page.$('button:has-text("打赏")');
    if (tipButton) {
      await tipButton.click();
      await wait(5000);

      // 尝试连接钱包
      const connectButton = await page.$('button:has-text("Connect Wallet")');
      if (connectButton) {
        await connectButton.click();
        await wait(3000);
      }

      // 输入金额（如果有输入框）
      const amountInput = await page.$('input[type="number"]');
      if (amountInput && await amountInput.isVisible()) {
        await amountInput.fill('10');
        await wait(2000);
      }

      await wait(5000);

      await closeModal(page);
      await wait(3000);
    }
  } catch (e) {
    console.log('⚠️  打赏步骤遇到问题，继续下一步');
    await closeModal(page);
  }

  // ========== 步骤 5: 数据更新 (1:30-1:50, 20秒) ==========
  console.log('📍 [1:30] 步骤 5: 返回查看数据更新');
  await page.goto('http://localhost:3000');
  await wait(3000);

  await smoothScroll(page, 400);
  await wait(8000);
  await smoothScroll(page, 0);
  await wait(5000);
  await page.goto('http://localhost:3000/leaderboard');
  await wait(4000);

  // ========== 步骤 6: 结束 (1:50-2:00, 10秒) ==========
  console.log('📍 [1:50] 步骤 6: 演示总结');
  await page.goto('http://localhost:3000');
  await wait(5000);
  await smoothScroll(page, 400);
  await wait(5000);

  console.log('✅ [2:00] 演示完成！');
  console.log('⏹️  3 秒���关闭浏览器...');

  await wait(3000);
  await browser.close();
}

main().catch(console.error);
