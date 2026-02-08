// Playwright Auto-Demo Recording for Agent Reward Hub
import { chromium, type Page } from 'playwright';

const VIDEO_OUTPUT = 'videos/agent-reward-hub-demo.mp4';
const BASE_URL = 'http://localhost:3001';

// Smooth scroll utility
async function smoothScroll(page: Page, pixels: number) {
  await page.evaluate((p) => {
    window.scrollBy({ top: p, behavior: 'smooth' });
  }, pixels);
}

// Wait utility
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
  console.log('🎬 Starting Agent Reward Hub demo recording...');
  console.log(`📁 Output: ${VIDEO_OUTPUT}`);
  console.log(`🌐 URL: ${BASE_URL}`);

  // Launch browser with video recording
  const browser = await chromium.launch({
    headless: false,
    args: ['--start-maximized']
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: {
      dir: 'videos',
      size: { width: 1920, height: 1080 }
    }
  });

  const page = await context.newPage();

  try {
    // Scene 1: Homepage - Hero Section (停留更久展示动画效果)
    console.log('📍 Scene 1: Homepage Hero...');
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await wait(6000); // 增加到6秒

    // Scene 2: Skills Directory (平滑滚动展示卡片)
    console.log('📍 Scene 2: Skills Directory...');
    await smoothScroll(page, 800);
    await wait(4000);

    // Scene 3: Navigate to Leaderboard
    console.log('📍 Scene 3: Leaderboard...');
    await page.goto(`${BASE_URL}/leaderboard`, { waitUntil: 'networkidle' });
    await wait(4000);

    // Scroll through leaderboard
    await smoothScroll(page, 600);
    await wait(3000);

    // Scene 4: Navigate to Skill Detail (点击第一个 Skill)
    console.log('📍 Scene 4: Skill Detail Page...');
    // 返回首页先
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await wait(2000);
    // 滚动到 Skills 区域
    await smoothScroll(page, 600);
    await wait(2000);

    // 点击第一个 Skill 卡片
    const firstSkillCard = await page.$('.skill-card');
    if (firstSkillCard) {
      await firstSkillCard.click();
      await page.waitForLoadState('networkidle');
      await wait(4000);

      // Scroll through skill details
      await smoothScroll(page, 800);
      await wait(3000);
    }

    // Scene 5: Navigate to Create Page
    console.log('📍 Scene 5: Create Skill Page...');
    await page.goto(`${BASE_URL}/create`, { waitUntil: 'networkidle' });
    await wait(4000);

    // Scroll through form (展示表单字段)
    await smoothScroll(page, 300);
    await wait(2000);
    await smoothScroll(page, 300);
    await wait(2000);
    await smoothScroll(page, 300);
    await wait(2000);

    // Scene 6: Back to Homepage - Final (回到首页，滚动到底部再回到顶部)
    console.log('📍 Scene 6: Homepage Final...');
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await wait(3000);

    // 滚动到底部展示 footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await wait(3000);

    // 平滑滚动回顶部
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
    await wait(3000);

    console.log('✅ Demo recording complete!');

  } catch (error) {
    console.error('❌ Recording error:', error);
  } finally {
    await context.close();
    await browser.close();
  }

  // Convert WebM to MP4 using ffmpeg
  console.log('🎥 Converting to MP4...');
  const { execSync } = require('child_process');
  try {
    const fs = require('fs');
    const files = fs.readdirSync('videos').filter((f: string) => f.endsWith('.webm'));
    if (files.length > 0) {
      const webmFile = `videos/${files[files.length - 1]}`;
      console.log(`📁 Converting ${webmFile}...`);

      execSync(
        `ffmpeg -i "${webmFile}" -c:v libx264 -crf 23 -preset fast -y "${VIDEO_OUTPUT}"`,
        { stdio: 'inherit' }
      );

      // Get file size
      const stats = fs.statSync(VIDEO_OUTPUT);
      const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
      console.log(`✅ Video saved: ${VIDEO_OUTPUT} (${sizeMB} MB)`);
    }
  } catch (e) {
    console.log('⚠️  ffmpeg conversion failed. WebM file saved in videos/');
  }
}

main().catch(console.error);
