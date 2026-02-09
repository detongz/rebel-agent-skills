// MySkills Protocol - Auto Demo Recording with Playwright
import { chromium, Page } from 'playwright';

const DEMO_OUTPUT = 'demo/videos/myskills-demo.mp4';
const WEBSITE_URL = 'https://myskills2026.ddttupupo.buzz';
const OPENCLAW_URL = 'http://127.0.0.1:18789/chat';

// Helper: Smooth scroll animation
async function smoothScroll(page: Page, targetY: number): Promise<void> {
  await page.evaluate((y) => {
    window.scrollTo({ top: y, behavior: 'smooth' });
  }, targetY);
}

// Helper: Wait with progress
async function wait(ms: number, description: string = ''): Promise<void> {
  console.log(`  ⏳ Waiting ${ms}ms${description ? ` - ${description}` : ''}...`);
  await new Promise(resolve => setTimeout(resolve, ms));
}

// Helper: Type text with animation
async function typeText(page: Page, selector: string, text: string): Promise<void> {
  const input = await page.$(selector);
  if (input) {
    await input.click();
    await page.evaluate((el) => {
      const inputEl = el as HTMLInputElement;
      inputEl.value = '';
    }, input);
    for (const char of text) {
      await input.type(char);
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  } else {
    console.log(`  ⚠️  Input ${selector} not found, skipping`);
  }
}

async function main() {
  console.log('🎬 MySkills Protocol - Auto Demo Recording');
  console.log('==========================================');
  console.log('');

  // Create videos directory
  const { execSync } = require('child_process');
  try {
    execSync('mkdir -p demo/videos');
  } catch (e) {
    // Directory might already exist
  }

  // Launch browser with video recording
  const browser = await chromium.launch({
    headless: false,
    args: ['--start-maximized']
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: {
      dir: 'demo/videos',
      size: { width: 1920, height: 1080 }
    }
  });

  const page = await context.newPage();

  console.log('📍 [0:00] SCENE 1: Website Homepage');
  console.log('  Opening', WEBSITE_URL);
  await page.goto(WEBSITE_URL, { waitUntil: 'networkidle', timeout: 30000 });
  await wait(5000, 'showing homepage');

  // Scroll to show skill cards
  console.log('  📜 Scrolling to show skill cards...');
  await smoothScroll(page, 400);
  await wait(3000, 'showing skill cards');

  await smoothScroll(page, 800);
  await wait(3000, 'showing more skills');

  await smoothScroll(page, 1200);
  await wait(3000, 'showing 98/2 split tags');

  // Scroll back to top
  console.log('  ⬆️  Scrolling back to top...');
  await smoothScroll(page, 0);
  await wait(2000, 'back at top');

  console.log('📍 [0:20] SCENE 2: Smart Matching Engine');
  // Look for Smart Matching section
  const smartMatchButton = await page.$('text=Smart Matching');
  if (smartMatchButton) {
    console.log('  🔍 Found Smart Matching section');
    await smoothScroll(page, 500);
    await wait(4000, 'showing Smart Matching Engine');
  } else {
    console.log('  ⚠️  Smart Matching button not found, showing features...');
    await smoothScroll(page, 600);
    await wait(4000, 'showing features');
  }

  console.log('📍 [0:30] SCENE 3: Wallet Connection');
  // Look for Connect Wallet button
  const connectButton = await page.$('[data-testid="connect-button"], button:has-text("Connect"), button:has-text("Wallet")');
  if (connectButton) {
    console.log('  💰 Found Connect Wallet button');
    try {
      await connectButton.click();
      await wait(3000, 'showing RainbowKit modal');
      // Close modal by clicking outside or pressing Escape
      await page.keyboard.press('Escape');
      await wait(1000, 'closed modal');
    } catch (e) {
      console.log('  ⚠️  Could not click wallet button:', (e as Error).message);
    }
  } else {
    console.log('  ⚠️  Connect Wallet button not found');
  }

  await wait(2000, 'showing wallet section');

  console.log('📍 [0:45] SCENE 4: Cross-Platform Value');
  await smoothScroll(page, 0);
  await wait(2000, 'at top');

  // Look for platform badges or cross-platform section
  const platformsSection = await page.$('text=Claude Code, text=Coze, text=Manus, text=MiniMax');
  if (platformsSection) {
    console.log('  🌐 Found platform badges');
    await smoothScroll(page, 300);
    await wait(4000, 'showing platform support');
  }

  await smoothScroll(page, 0);
  await wait(2000, 'back at top');

  console.log('📍 [1:00] SCENE 5: OpenClaw Gateway Demo');
  console.log('  🔗 Opening OpenClaw Gateway...');

  // Open new page for OpenClaw Gateway
  const openClawPage = await context.newPage();
  await openClawPage.goto(OPENCLAW_URL, { waitUntil: 'networkidle', timeout: 15000 })
    .catch(() => {
      console.log('  ⚠️  OpenClaw Gateway not accessible, skipping');
      return null;
    });

  if (openClawPage) {
    await wait(3000, 'showing OpenClaw Gateway');

    // Look for input field
    const inputField = await openClawPage.$('input[type="text"], textarea, [contenteditable="true"]');
    if (inputField) {
      console.log('  ✍️  Typing user request...');
      const userRequest = '我有一堆小学奥数题的PDF文件，需要自动识别题目、解析公式、整理到我的题库里。谁能帮我？预算5 MON';

      await inputField.click();
      await wait(500);

      for (const char of userRequest) {
        await inputField.type(char);
        await new Promise(resolve => setTimeout(resolve, 80));
      }

      await wait(2000, 'text entered');

      // Look for submit button
      const submitButton = await openClawPage.$('button[type="submit"], button:has-text("Send"), button:has-text("Submit"), button[aria-label*="send"]');
      if (submitButton) {
        console.log('  📤 Clicking submit button...');
        await submitButton.click();
        await wait(5000, 'showing Smart Matching results');
      } else {
        console.log('  ⚠️  Submit button not found');
        await wait(3000, 'showing input');
      }
    } else {
      console.log('  ⚠️  Input field not found in OpenClaw Gateway');
      await wait(3000, 'showing page');
    }

    await openClawPage.close();
  }

  // Go back to main page for final CTA
  console.log('📍 [1:15] SCENE 6: Final CTA');
  await page.bringToFront();
  await smoothScroll(page, 0);
  await wait(5000, 'showing final CTA');

  // Final pause
  await wait(5000, 'final shot');

  console.log('');
  console.log('✅ Recording complete!');
  console.log('');

  // Close browser to save video
  await context.close();
  await browser.close();

  // Find the video file
  const fs = require('fs');
  const path = require('path');
  const videosDir = path.join(process.cwd(), 'demo/videos');

  if (fs.existsSync(videosDir)) {
    const files = fs.readdirSync(videosDir).filter(f => f.endsWith('.webm'));
    if (files.length > 0) {
      const videoFile = path.join(videosDir, files[files.length - 1]);
      console.log(`📹 Video saved to: ${videoFile}`);
      console.log('');
      console.log('To convert to MP4:');
      console.log(`ffmpeg -i ${videoFile} -c:v libx264 -crf 23 ${DEMO_OUTPUT}`);
    }
  }
}

main().catch(console.error);
