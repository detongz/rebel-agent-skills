import { chromium } from 'playwright';
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

// Configuration
const BASE_URL = 'http://localhost:3000';
const VIDEO_DIR = path.join(process.cwd(), 'videos');
const MOLTIVERSE_DEMO = path.join(VIDEO_DIR, 'moltiverse-demo.mp4');
const BLITZ_PRO_DEMO = path.join(VIDEO_DIR, 'blitz-pro-demo.mp4');

// Ensure video directory exists
if (!fs.existsSync(VIDEO_DIR)) {
  fs.mkdirSync(VIDEO_DIR, { recursive: true });
}

// Utility functions
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const smoothScroll = async (page: any, distance: number) => {
  await page.evaluate((dist) => {
    window.scrollBy({ top: dist, behavior: 'smooth' });
  }, distance);
  await wait(800);
};

async function recordMoltiverseDemo() {
  console.log('🎬 Recording Moltiverse Demo...\n');

  const browser = await chromium.launch({
    headless: false,
    args: ['--start-maximized']
  });

  const context = await browser.newContext({
    recordVideoDir: VIDEO_DIR,
    recordVideoSize: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();
  await page.setViewportSize({ width: 1920, height: 1080 });

  try {
    // Scene 1: Hero Section (0:00-0:30)
    console.log('📍 Scene 1: Hero Section');
    await page.goto(`${BASE_URL}/demo-moltiverse`, { waitUntil: 'networkidle' });
    await wait(5000);

    // Scene 2: Scroll to Skills (0:30-0:50)
    console.log('📍 Scene 2: Featured Skills');
    await page.evaluate(() => document.getElementById('skills')?.scrollIntoView({ behavior: 'smooth' }));
    await wait(2000);
    await smoothScroll(page, 200);
    await wait(3000);

    // Scene 3: Select Different Skills (0:50-1:10)
    console.log('📍 Scene 3: Skill Selection');
    await page.click('text=React Component Generator');
    await wait(3000);
    await page.click('text=Data Visualization Agent');
    await wait(3000);
    await page.click('text=Solidity Auditor');
    await wait(3000);

    // Scene 4: Wallet Connection (1:10-1:30)
    console.log('📍 Scene 4: Connect Wallet');
    await smoothScroll(page, 300);
    await wait(1000);

    const connectButton = await page.$('text=Connect Wallet to Tip');
    if (connectButton) {
      await connectButton.click();
      await wait(5000);
    }

    // Scene 5: Tip Selection (1:30-1:50)
    console.log('📍 Scene 5: Select Tip Amount');
    await page.click('text=100');
    await wait(2000);

    // Scene 6: Final Stats & Footer (1:50-2:00)
    console.log('📍 Scene 6: Final View');
    await smoothScroll(page, 500);
    await wait(3000);

    console.log('✅ Moltiverse demo recording complete!\n');

  } catch (error) {
    console.error('❌ Error during recording:', error);
  } finally {
    await context.close();
    await browser.close();
  }
}

async function recordBlitzProDemo() {
  console.log('🎬 Recording Blitz Pro Demo...\n');

  const browser = await chromium.launch({
    headless: false,
    args: ['--start-maximized']
  });

  const context = await browser.newContext({
    recordVideoDir: VIDEO_DIR,
    recordVideoSize: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();
  await page.setViewportSize({ width: 1920, height: 1080 });

  try {
    // Navigate to Blitz Pro demo
    console.log('📍 Scene 1: Blitz Pro Hero');
    await page.goto(`${BASE_URL}/demo-blitz-pro`, { waitUntil: 'networkidle' });
    await wait(5000);

    // Scroll through features
    console.log('📍 Scene 2: x402 Protocol Features');
    await smoothScroll(page, 400);
    await wait(3000);

    console.log('📍 Scene 3: Payment Flow Demo');
    await smoothScroll(page, 400);
    await wait(3000);

    console.log('📍 Scene 4: Agent Integration');
    await smoothScroll(page, 400);
    await wait(3000);

    console.log('✅ Blitz Pro demo recording complete!\n');

  } catch (error) {
    console.error('❌ Error during recording:', error);
  } finally {
    await context.close();
    await browser.close();
  }
}

async function convertToMp4(webmPath: string, mp4Path: string) {
  console.log(`🎬 Converting ${path.basename(webmPath)} to MP4...`);

  try {
    execSync(
      `ffmpeg -i "${webmPath}" -c:v libx264 -crf 23 -preset medium -c:a aac -b:a 128k "${mp4Path}"`,
      { stdio: 'inherit' }
    );
    console.log(`✅ Created ${path.basename(mp4Path)}\n`);

    // Remove original WebM
    fs.unlinkSync(webmPath);
  } catch (error) {
    console.error(`❌ Conversion failed: ${error}\n`);
    console.log('💡 Tip: Install ffmpeg: brew install ffmpeg\n');
  }
}

async function main() {
  console.log('🎬 Hackathon Demo Recording\n');
  console.log('📋 Recording Plan:');
  console.log('   1. Moltiverse Demo (2:00)');
  console.log('   2. Blitz Pro Demo (1:30)\n');

  // Record Moltiverse demo
  await recordMoltiverseDemo();

  // Find and convert Moltiverse video
  const files = fs.readdirSync(VIDEO_DIR).filter(f => f.endsWith('.webm'));
  if (files.length > 0) {
    const webmPath = path.join(VIDEO_DIR, files[files.length - 1]); // Most recent
    await convertToMp4(webmPath, MOLTIVERSE_DEMO);
  }

  // Record Blitz Pro demo
  await recordBlitzProDemo();

  // Find and convert Blitz Pro video
  const blitzFiles = fs.readdirSync(VIDEO_DIR).filter(f => f.endsWith('.webm'));
  if (blitzFiles.length > 0) {
    const webmPath = path.join(VIDEO_DIR, blitzFiles[blitzFiles.length - 1]);
    await convertToMp4(webmPath, BLITZ_PRO_DEMO);
  }

  console.log('🎉 All recordings complete!');
  console.log(`\n📁 Video files:`);
  console.log(`   ${MOLTIVERSE_DEMO}`);
  console.log(`   ${BLITZ_PRO_DEMO}`);
  console.log('\n✅ Ready for hackathon submission!');
}

main().catch(console.error);
