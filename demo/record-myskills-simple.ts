// Simple MySkills recording using existing chromium
import { chromium } from 'playwright';

async function wait(ms: number) {
  await new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('🎬 Starting MySkills demo recording...');

  // Use existing chromium
  const browser = await chromium.launch({
    headless: false,
    channel: undefined, // Use playwright's bundled chromium
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: {
      dir: './videos',
      size: { width: 1920, height: 1080 },
    },
  });

  const page = await context.newPage();

  console.log('📍 [0:00] Scene 1: Homepage');
  await page.goto('https://myskills2026.ddttupupo.buzz', { waitUntil: 'networkidle', timeout: 30000 });
  await wait(5000);

  console.log('📍 [0:05] Scrolling to show skill cards');
  await page.evaluate(() => window.scrollBy({ top: 500, behavior: 'smooth' }));
  await wait(5000);
  await page.evaluate(() => window.scrollBy({ top: 500, behavior: 'smooth' }));
  await wait(5000);

  console.log('📍 [0:15] Back to top');
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  await wait(5000);

  console.log('📍 [0:20] Showing final CTA');
  await wait(10000);

  console.log('✅ [0:30] Recording complete!');

  await context.close();
  await browser.close();

  console.log('🎬 Video saved to ./videos directory');
  console.log('');
  console.log('Video files:');
  const fs = require('fs');
  const files = fs.readdirSync('./videos').filter(f => f.endsWith('.webm'));
  files.forEach(f => console.log(`  - videos/${f}`));
}

main().catch(console.error);
