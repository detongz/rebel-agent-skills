#!/usr/bin/env node
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, '../docs/moltiverse-kb/resources');
mkdirSync(OUTPUT_DIR, { recursive: true });

console.log('Starting browser...');
const browser = await chromium.launch({ headless: false });
const page = await browser.newPage();

console.log('Navigating to Resources page...');
try {
  await page.goto('https://www.notion.so/2fb6367594f28090adb5dc495e9c0516?pvs=21', {
    timeout: 60000
  });
} catch (e) {
  console.log('Navigate error (expected):', e.message);
}

console.log('Waiting 15s for content to load...');
await page.waitForTimeout(15000);

console.log('Scrolling...');
for (let i = 0; i < 15; i++) {
  try {
    await page.evaluate(() => window.scrollBy(0, 300));
  } catch (e) {}
  await page.waitForTimeout(400);
}

console.log('Waiting 5s more...');
await page.waitForTimeout(5000);

// Get page content directly
console.log('Extracting content...');
const pageContent = await page.evaluate(() => {
  return {
    html: document.documentElement.innerHTML,
    text: document.body.innerText
  };
});

// Save full page HTML for inspection
writeFileSync(join(OUTPUT_DIR, 'page-content.html'), pageContent.html);
console.log('Saved HTML to page-content.html');

// Extract links from HTML using regex (more reliable)
const linkRegex = /href=["']([^"']+)["']/g;
const links = [];
let match;
while ((match = linkRegex.exec(pageContent.html)) !== null) {
  const href = match[1];
  if (!href.startsWith('#') && (href.includes('notion.so') || href.includes('http'))) {
    if (!links.find(l => l === href)) {
      links.push(href);
    }
  }
}

console.log(`Found ${links.length} unique links`);
writeFileSync(join(OUTPUT_DIR, 'extracted-links.txt'), links.join('\n'));
console.log('Saved links to extracted-links.txt');

// Now scrape each link
console.log('\nScraping each link...');
for (let i = 0; i < Math.min(links.length, 30); i++) {
  const link = links[i];
  console.log(`[${i+1}/${Math.min(links.length, 30)}] ${link.substring(0, 50)}...`);

  try {
    const newPage = await browser.newPage();
    await newPage.goto(link, { timeout: 20000, waitUntil: 'domcontentloaded' });
    await newPage.waitForTimeout(2000);

    const content = await newPage.evaluate(() => document.body.innerText);

    const filename = `doc-${i+1}-${link.split('/').pop().substring(0, 30)}.md`;
    writeFileSync(join(OUTPUT_DIR, filename), `# Document ${i+1}\n\nSource: ${link}\n\n${content}`);
    console.log('  ✅ Saved');

    await newPage.close();
  } catch (e) {
    console.log('  ❌ Failed:', e.message);
  }
}

await browser.close();
console.log('\nDone!');
