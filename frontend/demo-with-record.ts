// demo-with-record.ts - Playwright 自动演示 + 录屏
import { chromium } from 'playwright';

async function wait(ms: number) {
  await new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('🎬 启动带录屏的自动演示...');

  const browser = await chromium.launch({
    headless: false, // 必须非 headless 才能录屏
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: {
      dir: './videos',
      size: { width: 1920, height: 1080 },
    },
  });

  const page = await context.newPage();

  // ========== 步骤 1: 首页 ==========
  console.log('📍 [0:00] 步骤 1: 首页');
  await page.goto('http://localhost:3000');
  await wait(5000);
  await page.evaluate(() => window.scrollBy(0, 400));
  await wait(5000);
  await page.evaluate(() => window.scrollBy(0, 400));
  await wait(5000);
  await page.evaluate(() => window.scrollTo(0, 0));
  await wait(5000);

  // ========== 步骤 2: 排行榜 ==========
  console.log('📍 [0:20] 步骤 2: 排行榜');
  await page.goto('http://localhost:3000/leaderboard');
  await wait(5000);
  await page.evaluate(() => window.scrollBy(0, 400));
  await wait(8000);
  await page.evaluate(() => window.scrollBy(0, 400));
  await wait(7000);

  // ========== 步骤 3: Skill 详情 ==========
  console.log('📍 [0:40] 步骤 3: Skill 详情');
  await page.goto('http://localhost:3000/skill/1');
  await wait(5000);
  await page.evaluate(() => window.scrollBy(0, 300));
  await wait(5000);
  await page.evaluate(() => window.scrollBy(0, 300));
  await wait(5000);
  await page.evaluate(() => window.scrollBy(0, 300));
  await wait(5000);
  await page.evaluate(() => window.scrollTo(0, 0));
  await wait(3000);

  // ========== 步骤 4: 打赏功能 ==========
  console.log('📍 [1:00] 步骤 4: 打赏功能');
  try {
    const tipButton = await page.$('text=打赏');
    if (tipButton) {
      await tipButton.click();
      await wait(8000);
      await page.keyboard.press('Escape');
      await wait(3000);
    }
  } catch (e) {
    console.log('⚠️  跳过打赏步骤');
  }

  // ========== 步骤 5: 数据更新 ==========
  console.log('📍 [1:30] 步骤 5: 数据更新');
  await page.goto('http://localhost:3000');
  await wait(5000);
  await page.evaluate(() => window.scrollBy(0, 400));
  await wait(8000);

  // ========== 步骤 6: 总结 ==========
  console.log('📍 [1:50] 步骤 6: 总结');
  await page.goto('http://localhost:3000');
  await wait(10000);

  console.log('��� [2:00] 演示完成！');

  await context.close();
  await browser.close();

  console.log('🎬 视频已保存到 ./videos 目录');
}

main().catch(console.error);
