// MySkills Protocol Demo Recording with Puppeteer
const puppeteer = require('puppeteer');
const { execSync } = require('child_process');

async function main() {
  console.log('🎬 MySkills Protocol - Demo Recording');
  console.log('======================================');
  console.log('');

  // Create videos directory
  execSync('mkdir -p demo/videos', { stdio: 'inherit' });

  console.log('📍 Launching browser...');

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1920, height: 1080 },
    args: ['--start-maximized', '--disable-infobars']
  });

  const page = await browser.newPage();

  // Scene 1: Homepage
  console.log('📍 [0:00] SCENE 1: Opening MySkills website...');
  await page.goto('https://myskills2026.ddttupupo.buzz', { waitUntil: 'networkidle2', timeout: 30000 });
  await sleep(5000, 'showing homepage');

  // Scroll down
  console.log('  📜 Scrolling to show skill cards...');
  await page.evaluate(() => window.scrollBy({ top: 400, behavior: 'smooth' }));
  await sleep(3000, 'showing skill cards');

  await page.evaluate(() => window.scrollBy({ top: 400, behavior: 'smooth' }));
  await sleep(3000, 'showing 98/2 split');

  await page.evaluate(() => window.scrollBy({ top: 400, behavior: 'smooth' }));
  await sleep(3000, 'showing more content');

  // Back to top
  console.log('  ⬆️  Scrolling back to top...');
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  await sleep(2000, 'back at top');

  // Scene 2: Smart Matching
  console.log('📍 [0:20] SCENE 2: Smart Matching Engine...');
  const smartMatchText = await page.$('text=Smart Matching');
  if (smartMatchText) {
    console.log('  🔍 Found Smart Matching section');
    await page.evaluate(() => window.scrollBy({ top: 500, behavior: 'smooth' }));
    await sleep(4000, 'showing Smart Matching');
  } else {
    await page.evaluate(() => window.scrollBy({ top: 600, behavior: 'smooth' }));
    await sleep(4000, 'showing features');
  }

  // Scene 3: Wallet Connection
  console.log('📍 [0:30] SCENE 3: Wallet Connection...');
  const connectButton = await page.$('button:has-text("Connect"), button:has-text("Wallet"), [data-testid="connect-button"]');
  if (connectButton) {
    console.log('  💰 Found Connect Wallet button');
    try {
      await connectButton.click();
      await sleep(3000, 'showing RainbowKit modal');
      await page.keyboard.press('Escape');
      await sleep(1000, 'modal closed');
    } catch (e) {
      console.log('  ⚠️  Could not click wallet button');
    }
  }
  await sleep(2000, 'showing wallet section');

  // Scene 4: Cross-Platform
  console.log('📍 [0:45] SCENE 4: Cross-Platform Value...');
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  await sleep(2000);

  await page.evaluate(() => window.scrollBy({ top: 300, behavior: 'smooth' }));
  await sleep(4000, 'showing platform badges');

  // Scene 5: Final CTA
  console.log('📍 [1:00] SCENE 5: Final CTA...');
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  await sleep(5000, 'showing final CTA');

  // Final pause
  await sleep(5000, 'final shot');

  console.log('');
  console.log('✅ Demo complete!');
  console.log('');
  console.log('📹 Please use screen recording (Cmd+Shift+5) to save the video');
  console.log('   or press Ctrl+C to close browser');
  console.log('');

  // Keep browser open for manual recording
  await new Promise(resolve => {
    process.on('SIGINT', resolve);
    process.on('SIGTERM', resolve);
  });

  await browser.close();
}

function sleep(ms, description = '') {
  return new Promise(resolve => {
    const step = 1000;
    let remaining = ms;
    const interval = setInterval(() => {
      if (remaining <= 0) {
        clearInterval(interval);
        resolve();
      } else {
        const waitSec = Math.ceil(remaining / 1000);
        const desc = description ? ` - ${description}` : '';
        process.stdout.write(`\r  ⏳ ${waitSec}s remaining${desc}   `);
        remaining -= step;
      }
    }, step);
  });
}

main().catch(console.error);
