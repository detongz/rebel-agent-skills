// Use existing chromium version
import { chromium } from 'playwright';

async function wait(ms: number) {
  await new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('🎬 Starting MySkills demo recording...');

  // Launch browser
  const browser = await chromium.launch({
    headless: false,
    args: ['--disable-web-security']
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: {
      dir: './demo/videos',
      size: { width: 1920, height: 1080 },
    },
  });

  const page = await context.newPage();

  try {
    console.log('📍 [0:00] Scene 1: Homepage');
    await page.goto('https://myskills2026.ddttupupo.buzz', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await wait(5000);

    console.log('📍 [0:05] Scrolling to show skill cards');
    await page.evaluate(() => window.scrollBy({ top: 500, behavior: 'smooth' }));
    await wait(5000);

    await page.evaluate(() => window.scrollBy({ top: 500, behavior: 'smooth' }));
    await wait(5000);

    console.log('📍 [0:15] Back to top for final CTA');
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
    await wait(5000);

    console.log('📍 [0:20] Final shot');
    await wait(10000);

    console.log('✅ [0:30] Recording complete!');

  } catch (error) {
    console.error('Error during recording:', error.message);
  } finally {
    await context.close();
    await browser.close();
  }

  console.log('🎬 Video saved to ./demo/videos directory');
}

main().catch(console.error);
