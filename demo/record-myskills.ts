// MySkills Demo Recording - Error-free version
import { chromium } from 'playwright';

async function wait(ms: number) {
  await new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('🎬 Starting MySkills demo recording...');

  // Launch browser with minimal requirements
  const browser = await chromium.launch({
    headless: false,
    args: ['--disable-web-security'] // Avoid CORS issues
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: {
      dir: './videos',
      size: { width: 1920, height: 1080 },
    },
  });

  const page = await context.newPage();

  // Handle any dialogs/modals automatically
  page.on('dialog', async dialog => {
    await dialog.accept().catch(() => dialog.dismiss());
  });

  try {
    // Scene 1: Homepage - Agent Skill App Store (0:00-0:20)
    console.log('📍 [0:00] Scene 1: Homepage');
    await page.goto('https://myskills2026.ddttupupo.buzz', { waitUntil: 'networkidle', timeout: 30000 });
    await wait(5000); // Show hero section

    // Scroll to show skill cards
    await page.evaluate(() => window.scrollBy({ top: 400, behavior: 'smooth' }));
    await wait(5000); // Show skill cards with 98/2 split
    await page.evaluate(() => window.scrollBy({ top: 400, behavior: 'smooth' }));
    await wait(5000); // Show more skills

    // Scene 2: Leaderboard (0:20-0:35)
    console.log('📍 [0:20] Scene 2: Leaderboard');
    await page.goto('https://myskills2026.ddttupupo.buzz/leaderboard', { waitUntil: 'networkidle', timeout: 15000 }).catch(() => {
      console.log('⚠️  Leaderboard page not found, staying on homepage');
      return page.goto('https://myskills2026.ddttupupo.buzz');
    });
    await wait(8000); // Show leaderboard

    // Scene 3: Back to homepage for more content (0:35-0:55)
    console.log('📍 [0:35] Scene 3: More marketplace content');
    await page.goto('https://myskills2026.ddttupupo.buzz', { waitUntil: 'networkidle', timeout: 15000 });
    await wait(5000); // Show homepage again

    // Try to show platform filter
    try {
      await page.evaluate(() => window.scrollBy({ top: 200, behavior: 'smooth' }));
      await wait(5000);
    } catch (e) {
      console.log('⚠️  Filter interaction skipped');
    }

    // Scene 4: Final CTA (0:55-1:10)
    console.log('📍 [0:55] Scene 4: Final CTA');
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
    await wait(5000); // Show hero section

    // Final shot with tagline
    await wait(10000); // Hold for final CTA

    console.log('✅ [1:10] Recording complete!');

  } catch (error) {
    console.error('Error during recording:', error.message);
    // Continue anyway to save what we have
  } finally {
    await context.close();
    await browser.close();
  }

  console.log('🎬 Video saved to ./videos directory');
  console.log('📁 Find video at: videos/*.webm');
  console.log('');
  console.log('To convert to MP4:');
  console.log('ffmpeg -i videos/*.webm -c:v libx264 -crf 23 videos/myskills-demo.mp4');
}

main().catch(console.error);
