// MySkills Demo - Rehearsal Test
// 使用 Playwright 走一遍完整流程进行排练

import { chromium, Browser, Page, BrowserContext } from 'playwright-core';

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

async function runRehearsal() {
  console.log('🎬 MySkills Demo - 排练测试');
  console.log('========================');
  console.log('');

  console.log('📍 启动浏览器...');
  const browser = await chromium.launch({
    headless: false,
    args: ['--start-maximized']
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  try {
    // Scene 1: 打开 MySkills 网站
    console.log('📍 Scene 1: MySkills Website');
    await page.goto('https://myskills2026.ddttupupo.buzz', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    await wait(5000, '显示主页');

    // Scene 2: 滚动展示技能卡片
    console.log('📍 Scene 2: 滚动展示技能卡片');
    await page.evaluate(() => window.scrollBy({ top: 400, behavior: 'smooth' }));
    await sleep(3000);

    await page.evaluate(() => window.scrollBy({ top: 400, behavior: 'smooth' }));
    await sleep(3000);

    await page.evaluate(() => window.scrollBy({ top: 400, behavior: 'smooth' }));
    await sleep(3000);

    // Scene 3: 回到顶部
    console.log('📍 Scene 3: 回到顶部');
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
    await wait(3000, '回到顶部');

    // Scene 4: 查找 Smart Matching
    console.log('📍 Scene 4: Smart Matching');
    try {
      const smartMatch = await page.$('text=Smart Matching');
      if (smartMatch) {
        await smartMatch.click();
        await wait(5000, 'Smart Matching 页面');
      } else {
        console.log('  ⚠️  Smart Matching 按钮未找到');
      }
    } catch (e) {
      console.log('  ⚠️  Smart Matching 查找失败');
    }

    // Scene 5: 查找钱包连接
    console.log('📍 Scene 5: 钱包连接');
    try {
      // 尝试多种方式查找钱包按钮
      // 1. 先检查页面结构
      const navElements = await page.$$('nav, .nav, [class*="nav"]');
      console.log(`  ℹ️  找到 ${navElements.length} 个导航相关元素`);

      // 2. 尝试查找所有按钮
      const allButtons = await page.$$('button');
      console.log(`  ℹ️  页面上共有 ${allButtons.length} 个按钮`);

      // 3. 列出前3个按钮的文本内容
      for (let i = 0; i < Math.min(3, allButtons.length); i++) {
        const btn = allButtons[i];
        const text = await btn.evaluate((el: HTMLElement) => el.textContent?.trim() || '');
        const className = await btn.evaluate((el: HTMLElement) => el.className || '');
        console.log(`  ℹ️  按钮 ${i + 1}: "${text}" (class: ${className.substring(0, 50)})`);
      }

      // 4. 尝试找到 RainbowKit 按钮
      const rainbowBtn = await page.$('[data-rk]');
      if (rainbowBtn) {
        console.log('  ✓ 找到 RainbowKit 元素');
        await page.evaluate((el: HTMLElement) => el.scrollIntoView({ block: 'center' }), rainbowBtn);
        await sleep(2000);
        console.log('  ✓ 钱包连接按钮已显示');
      } else {
        console.log('  ⚠️  RainbowKit 元素未找到，使用页面右上角区域');
        // 5. 回退方案：滚动到页面顶部，钱包按钮应该在导航栏右侧
        await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
        await sleep(1000);
        console.log('  ✓ 已回到顶部 (钱包按钮区域)');
      }
    } catch (e) {
      console.log('  ⚠️  钱包按钮查找失败:', (e as Error).message);
    }

    await wait(5000, '钱包区域');

    // Scene 6: Final CTA
    console.log('📍 Scene 6: Final CTA');
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
    await wait(5000, 'Final CTA');

    console.log('');
    console.log('✅ 排练完成!');
    console.log('');
    console.log('💡 等待 10 秒后关闭浏览器 (可以手动检查页面)...');
    await sleep(10000, '等待检查');

  } catch (error) {
    console.error('❌ 排练过程出错:', error);
  } finally {
    await context.close();
    await browser.close();
    console.log('👋 浏览器已关闭');
  }
}

// 运行排练
runRehearsal().catch(error => {
  console.error('💥 排练失败:', error);
  process.exit(1);
});
