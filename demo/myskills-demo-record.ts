// myskills-demo-record.ts - Playwright 自动演示 + 录屏 for MySkills Protocol
import { chromium } from 'playwright';

async function wait(ms: number) {
  await new Promise(resolve => setTimeout(resolve, ms));
}

async function smoothScroll(page: any, pixels: number) {
  await page.evaluate((p) => {
    window.scrollBy({
      top: p,
      behavior: 'smooth'
    });
  }, pixels);
}

async function main() {
  console.log('🎬 MySkills Protocol Demo Recording...');

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

  // ========== Scene 1: Hook - Agent App Store Concept ==========
  console.log('📍 [0:00-0:15] Scene 1: Homepage - "App Store for AI Agents"');
  await page.goto('https://myskills2026.ddttupupo.buzz');
  await wait(5000); // Show hero section

  await smoothScroll(page, 400); // Scroll to skill cards
  await wait(5000); // Show skill cards with 98/2 split

  await smoothScroll(page, 400); // More skills
  await wait(5000); // Show more cards

  // ========== Scene 2: Smart Matching Engine ==========
  console.log('📍 [0:15-0:45] Scene 2: Smart Matching Engine');
  await page.goto('https://myskills2026.ddttupupo.buzz/demo/agent-workflow');
  await wait(5000); // Show intro

  // Click through workflow demo - Step 1: Request
  try {
    const startButton = await page.$('text=Start Demo');
    if (startButton) {
      await startButton.click();
      await wait(3000);
    }
  } catch (e) {
    console.log('⚠️  Auto-advance may be active');
  }

  await wait(8000); // Show Request step

  // Wait for Smart Matching step
  await wait(5000); // Transition to Smart Matching
  await wait(10000); // Show Smart Matching analysis with formulas

  // ========== Scene 3: Agent-to-Agent Payment Flow ==========
  console.log('📍 [0:45-1:10] Scene 3: Payment Flow');

  // Selection step
  await wait(5000);
  await wait(8000); // Show selection

  // Work step
  await wait(5000);
  await wait(8000); // Show parallel work

  // Payment step
  await wait(5000);
  await wait(8000); // Show payment on Monad

  // Complete step
  await wait(5000);
  await wait(5000);

  // ========== Scene 4: Cross-Platform Value + Close ==========
  console.log('📍 [1:10-1:30] Scene 4: Close - "Build once, earn everywhere"');

  await page.goto('https://myskills2026.ddttupupo.buzz');
  await wait(5000); // Back to homepage

  // Show platform filter
  try {
    const platformFilter = await page.$('select'); // Find platform dropdown
    if (platformFilter) {
      await smoothScroll(page, 200);
      await wait(3000);
    }
  } catch (e) {
    console.log('⚠️  Platform filter not found');
  }

  // Final hero shot
  await page.evaluate(() => window.scrollTo(0, 0));
  await wait(8000); // Final frame with tagline

  console.log('✅ [1:30] Demo complete!');

  await context.close();
  await browser.close();

  console.log('🎬 Video saved to ./videos directory');
  console.log('📁 Find the video at: videos/*.webm');
}

main().catch(console.error);
