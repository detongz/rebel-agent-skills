#!/usr/bin/env node
import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: false });
const page = await browser.newPage();

console.log('Loading page...');
await page.goto('https://www.notion.so/2fb6367594f28090adb5dc495e9c0516?pvs=21', {
  waitUntil: 'domcontentloaded'
});

console.log('Waiting 10s...');
await page.waitForTimeout(10000);

// Debug: Check what's on the page
const info = await page.evaluate(() => {
  return {
    title: document.title,
    bodyClasses: document.body.className,
    allLinksCount: document.querySelectorAll('a').length,
    notionContentCount: document.querySelectorAll('.notion-page-content').length,
    sampleLinks: Array.from(document.querySelectorAll('a')).slice(0, 10).map(a => ({
      href: a.href,
      text: a.textContent?.substring(0, 50)
    }))
  };
});

console.log('Page Info:', JSON.stringify(info, null, 2));

// Get ALL links regardless of content
const allLinks = await page.evaluate(() => {
  const links = [];
  document.querySelectorAll('a[href]').forEach(a => {
    const href = a.href;
    const text = a.textContent?.trim();
    if (href && !href.startsWith('#')) {
      links.push({ text: text || 'NO_TEXT', href });
    }
  });
  return links;
});

console.log(`Found ${allLinks.length} total links`);
allLinks.slice(0, 20).forEach((l, i) => {
  console.log(`  ${i+1}. ${l.text.substring(0, 40)} -> ${l.href.substring(0, 60)}`);
});

// Save to file
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, '../docs/moltiverse-kb/resources');
mkdirSync(OUTPUT_DIR, { recursive: true });

writeFileSync(join(OUTPUT_DIR, 'debug-links.json'), JSON.stringify(allLinks, null, 2));
console.log(`Saved all ${allLinks.length} links to debug-links.json`);

console.log('Press Ctrl+C to exit...');
await page.waitForTimeout(60000);
await browser.close();
