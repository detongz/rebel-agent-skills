// Use existing Playwright with older chromium
const { chromium } = require('playwright/lib/rpc');

(async () => {
  console.log('🎬 Starting MySkills demo recording via RPC...');

  // Try to launch with legacy chromium
  const browser = await chromium.launch({
    headless: false,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  }).catch(async () => {
    // Fallback to system Chrome
    return await chromium.launch({
      headless: false,
      channel: 'chrome'
    });
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: {
      dir: './demo/videos',
      size: { width: 1920, height: 1080 },
    },
  });

  const page = await context.newPage();

  // Demo flow
  await page.goto('https://myskills2026.ddttupupo.buzz');
  await page.waitForTimeout(5000);

  await page.evaluate(() => window.scrollBy(0, 400));
  await page.waitForTimeout(5000);

  await page.evaluate(() => window.scrollBy(0, 400));
  await page.waitForTimeout(5000);

  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(10000);

  await context.close();
  await browser.close();

  console.log('✅ Recording complete!');
})();
