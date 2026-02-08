#!/usr/bin/env node
/**
 * Scrape all content from the Moltiverse Resources Notion page
 * https://www.notion.so/2fb6367594f28090adb5dc495e9c0516?pvs=21
 */

import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, '../docs/moltiverse-kb/resources');

// Ensure output directory exists
mkdirSync(OUTPUT_DIR, { recursive: true });

async function scrapeResources() {
  console.log('🚀 Starting to scrape Resources page...\n');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
  });
  const page = await context.newPage();

  console.log('📄 Navigating to Resources page...');
  await page.goto('https://www.notion.so/2fb6367594f28090adb5dc495e9c0516?pvs=21', {
    waitUntil: 'domcontentloaded',
    timeout: 60000
  });

  // Wait for content to load
  console.log('⏳ Waiting for content to load...');
  await page.waitForTimeout(8000);

  // Scroll to load all content
  console.log('📜 Scrolling to load all content...');
  for (let i = 0; i < 8; i++) {
    await page.evaluate(() => window.scrollBy(0, 500));
    await page.waitForTimeout(400);
  }

  // Wait a bit more for dynamic content
  await page.waitForTimeout(3000);

  // Extract all content blocks (sections with headings)
  console.log('🔍 Extracting content sections...\n');

  const sections = await page.evaluate(() => {
    const sections = [];

    // Get all headings and their following content
    const headings = document.querySelectorAll('h1, h2, h3, [role="heading"]');

    headings.forEach((heading, index) => {
      const title = heading.textContent?.trim();
      if (!title || title.length < 3) return;

      // Get content after this heading until next heading
      let content = '';
      let currentElement = heading.nextElementSibling;

      while (currentElement) {
        const tagName = currentElement.tagName?.toLowerCase();
        if (tagName === 'h1' || tagName === 'h2' || tagName === 'h3' ||
            currentElement.getAttribute('role') === 'heading') {
          break;
        }
        content += currentElement.textContent?.trim() + '\n\n';
        currentElement = currentElement.nextElementSibling;
      }

      if (content.length > 50) {
        sections.push({
          title: title,
          content: content.trim()
        });
      }
    });

    // Also try to get all list items that might be resource links
    const listItems = document.querySelectorAll('li, .notion-list-item');
    listItems.forEach(item => {
      const text = item.textContent?.trim();
      if (text && text.length > 20 && text.length < 500 && text.includes('http')) {
        // Check if this looks like a resource entry
        if (!sections.find(s => s.title === text.substring(0, 50))) {
          sections.push({
            title: text.substring(0, 50).replace(/\n/g, ' '),
            content: text
          });
        }
      }
    });

    return sections;
  });

  console.log(`📊 Found ${sections.length} content sections`);

  // Also get the entire page content as a fallback
  const fullPageContent = await page.evaluate(() => {
    // Try multiple content selectors
    const selectors = [
      '.notion-page-content',
      '[contenteditable="true"]',
      'article',
      'main',
      '.notion-scroller'
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        return element.textContent.trim();
      }
    }

    return document.body.textContent.trim();
  });

  // Write full page content
  writeFileSync(join(OUTPUT_DIR, 'resources-full.md'), `# Moltiverse Resources - Full Content\n\nSource: https://www.notion.so/2fb6367594f28090adb5dc495e9c0516?pvs=21\n\n${fullPageContent}`);
  console.log(`✅ Saved full page content to: resources-full.md`);

  // Write individual sections
  let savedSections = 0;
  sections.forEach((section, i) => {
    const safeTitle = section.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 80);

    const filename = `resource-${i + 1}-${safeTitle}.md`;
    const filepath = join(OUTPUT_DIR, filename);

    writeFileSync(filepath, `# ${section.title}\n\n${section.content}`);
    savedSections++;
  });

  console.log(`✅ Saved ${savedSections} individual sections`);

  // Also extract any links found
  const links = await page.evaluate(() => {
    const links = [];
    const allLinks = document.querySelectorAll('a[href]');

    allLinks.forEach(link => {
      const href = link.getAttribute('href');
      const text = link.textContent?.trim();

      if (href && text && text.length > 5) {
        if (!links.find(l => l.href === href)) {
          links.push({ text, href });
        }
      }
    });

    return links;
  });

  // Save links list
  const linksContent = links.map(l => `- [${l.text}](${l.href})`).join('\n');
  writeFileSync(join(OUTPUT_DIR, 'all-links.md'), `# All Links Found\n\n${linksContent}`);
  console.log(`✅ Saved ${links.length} links to: all-links.md`);

  await browser.close();

  console.log(`\n✨ Done! Files saved to: ${OUTPUT_DIR}`);
}

scrapeResources().catch(console.error);
