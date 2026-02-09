// MySkills Zhang Demo - Record with Playwright
const { chromium } = require('playwright-core');
const { execSync } = require('child_process');
const path = require('path');

async function main() {
  console.log('🎬 Recording MySkills Zhang Teacher Demo...');
  console.log('==========================================');
  console.log('');

  // Create videos directory
  execSync('mkdir -p demo/videos');

  // Path to existing chromium
  const chromiumPath = '/Users/zdt/Library/Caches/ms-playwright/chromium-1091/chrome-mac/Chromium.app/Contents/MacOS/Chromium';

  console.log('📍 Launching browser...');
  const browser = await chromium.launch({
    executablePath: chromiumPath,
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

  // Open the demo HTML
  const demoPath = path.join(__dirname, 'myskills-zhang-demo.html');
  console.log('📍 Opening Zhang demo...');
  await page.goto(`file://${demoPath}`);

  console.log('🎥 Playing demo (90 seconds)...');
  console.log('   Please wait for the demo to complete...');

  // Wait for the full demo to play (90 seconds)
  await new Promise(resolve => setTimeout(resolve, 95000));

  console.log('');
  console.log('✅ Demo complete!');
  console.log('');

  // Close browser to save video
  await context.close();
  await browser.close();

  console.log('📹 Video saved to demo/videos/');
  console.log('');

  // Find and rename the video
  const fs = require('fs');
  const videosDir = path.join(__dirname, 'demo/videos');

  if (fs.existsSync(videosDir)) {
    const files = fs.readdirSync(videosDir).filter(f => f.endsWith('.webm'));
    if (files.length > 0) {
      const videoFile = path.join(videosDir, files[files.length - 1]);
      const outputFile = path.join(videosDir, 'myskills-zhang-demo.webm');

      if (videoFile !== outputFile) {
        fs.renameSync(videoFile, outputFile);
      }

      console.log(`✅ Video saved: ${outputFile}`);
      console.log('');
      console.log('To convert to MP4:');
      console.log(`ffmpeg -i ${outputFile} -c:v libx264 -crf 23 demo/videos/myskills-zhang-demo.mp4`);
    }
  }
}

main().catch(console.error);
