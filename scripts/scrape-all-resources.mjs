#!/usr/bin/env node
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, '../docs/moltiverse-kb/resources');
mkdirSync(OUTPUT_DIR, { recursive: true });

const browser = await chromium.launch({ headless: false });
const page = await browser.newPage();

console.log('📄 Loading Resources page...');
await page.goto('https://www.notion.so/2fb6367594f28090adb5dc495e9c0516?pvs=21', {
  waitUntil: 'domcontentloaded',
  timeout: 60000
});
await page.waitForTimeout(10000);

// Scroll to load all
for (let i = 0; i < 10; i++) {
  await page.evaluate(() => window.scrollBy(0, 500));
  await page.waitForTimeout(300);
}

// Extract all links
const links = await page.evaluate(() => {
  const arr = [];
  document.querySelectorAll('a[href]').forEach(a => {
    const href = a.href;
    const text = a.textContent?.trim();
    if (href && text && text.length > 5 && !href.includes('#') && (href.includes('notion.so') || href.includes('http'))) {
      if (!arr.find(x => x.href === href)) {
        arr.push({ text, href });
      }
    }
  });
  return arr;
});

console.log(`Found ${links.length} links. Starting to scrape each one...`);

// Scrape each link
for (let i = 0; i < links.length; i++) {
  const { text, href } = links[i];
  console.log(`[${i+1}/${links.length}] ${text.substring(0, 50)}...`);

  try {
    await page.goto(href, {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
    await page.waitForTimeout(3000);

    // Scroll
    for (let j = 0; j < 5; j++) {
      await page.evaluate(() => window.scrollBy(0, 400));
      await page.waitForTimeout(200);
    }

    const content = await page.evaluate(() => {
      const sel = '.notion-page-content,[contenteditable="true"],article,main,.notion-scroller';
      for (const s of sel.split(',')) {
        const el = document.querySelector(s);
        if (el && el.textContent.length > 100) return el.textContent.trim();
      }
      return document.body.textContent.trim();
    });

    const safeTitle = text.replace(/[^a-zA-Z0-9\s-]/g, '').substring(0, 60);
    writeFileSync(join(OUTPUT_DIR, `${i+1}-${safeTitle}.md`), `# ${text}\n\nSource: ${href}\n\n${content}`);
    console.log('  ✅ Saved');
  } catch (e) {
    console.log('  ❌ Failed:', e.message);
  }
}

await browser.close();
console.log('Done!');
