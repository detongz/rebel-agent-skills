// Record OpenClaw Demo with Playwright
const { chromium } = require('playwright-core');
const path = require('path');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('🎬 Recording OpenClaw Demo...');
  console.log('===============================');
  console.log('');

  const videosDir = path.join(__dirname, 'demo', 'videos');
  const chromiumPath = '/Users/zdt/Library/Caches/ms-playwright/chromium-1091/chrome-mac/Chromium.app/Contents/MacOS/Chromium';

  console.log('📍 Launching browser...');

  const browser = await chromium.launch({
    executablePath: chromiumPath,
    headless: false,
    args: [
      '--start-maximized',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process'
    ]
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: {
      dir: videosDir,
      size: { width: 1920, height: 1080 }
    },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
  });

  const page = await context.newPage();

  console.log('📍 Scene 1: Opening OpenClaw Gateway...');
  await page.goto('http://127.0.0.1:18789/#token=511ce9ce2abf5ec3faacc1b5d2c58a7f29bf6d26efcc2ab98f5f8d9da32723c2', {
    waitUntil: 'networkidle',
    timeout: 15000
  });
  await sleep(5000, 'Show OpenClaw Gateway');
  console.log('  ✓ OpenClaw Gateway loaded');

  console.log('');
  console.log('📍 Scene 2: Typing 张老师 request...');

  // Wait for input field
  await page.waitForSelector('textarea, input[type="text"], [contenteditable="true"], .chat-input, #message-input', { timeout: 10000 });
  await sleep(2000);

  // Find and click input field
  const inputField = await page.$('textarea, input[type="text"], [contenteditable="true"]');
  if (inputField) {
    await inputField.click();
    await sleep(500);

    const zhangRequest = '我有一堆小学奥数题的PDF文件，需要自动识别题目、解析公式、整理到我的题库里。谁能帮我？预算5 MON';

    // Type the request character by character for realistic effect
    for (const char of zhangRequest) {
      await inputField.type(char);
      await sleep(50);
    }
    console.log('  ✓ Request typed');

    await sleep(2000);
  }

  console.log('');
  console.log('📍 Scene 3: Looking for submit button...');

  // Try to find and click submit button
  const submitButton = await page.$('button[type="submit"], button:has-text("Send"), button:has-text("发送"), .send-button, [aria-label*="send"], [aria-label*="发送"]');
  if (submitButton) {
    await submitButton.click();
    console.log('  ✓ Submit button clicked');
  } else {
    console.log('  ⚠ Submit button not found, trying Enter key...');
    await page.keyboard.press('Enter');
  }

  await sleep(3000);

  console.log('');
  console.log('📍 Scene 4: Waiting for Smart Matching response...');
  await sleep(10000, 'Wait for response');
  console.log('  ✓ Response displayed');

  console.log('');
  console.log('📍 Scene 5: Opening MySkills website...');
  const newPage = await context.newPage();
  await newPage.goto('https://myskills2026.ddttupupo.buzz', {
    waitUntil: 'networkidle',
    timeout: 30000
  });
  await sleep(5000, 'Show homepage');

  console.log('  📜 Scrolling to show skill cards...');
  await newPage.evaluate(() => window.scrollBy({ top: 400, behavior: 'smooth' }));
  await sleep(3000);

  await newPage.evaluate(() => window.scrollBy({ top: 400, behavior: 'smooth' }));
  await sleep(3000);

  await newPage.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  await sleep(3000);

  console.log('  ✓ MySkills website shown');

  console.log('');
  console.log('📍 Scene 6: Final CTA...');
  await sleep(5000, 'Final CTA');

  console.log('');
  console.log('✅ Demo complete!');
  console.log('');

  await context.close();
  await browser.close();

  console.log('📹 Video saved to demo/videos/');
  console.log('');

  // Find the video file
  const fs = require('fs');
  if (fs.existsSync(videosDir)) {
    const files = fs.readdirSync(videosDir).filter(f => f.endsWith('.webm'));
    if (files.length > 0) {
      const videoFile = path.join(videosDir, files[files.length - 1]);
      const outputFile = path.join(videosDir, 'myskills-openclaw-demo.webm');

      if (videoFile !== outputFile) {
        fs.renameSync(videoFile, outputFile);
      }

      console.log(`✅ Video: ${outputFile}`);
      console.log('');
      console.log('To convert to MP4:');
      console.log(`ffmpeg -i ${outputFile} -c:v libx264 -crf 23 demo/videos/myskills-openclaw-demo.mp4`);
    }
  }
}

main().catch(console.error);
