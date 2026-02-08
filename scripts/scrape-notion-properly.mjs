#!/usr/bin/env node
/**
 * Properly scrape Notion pages using Chromium
 * Uses domcontentloaded instead of networkidle to avoid timeouts
 * Extracts actual content, not just HTML/JS boilerplate
 */

import { chromium } from 'playwright';
import { writeFileSync } from 'fs';
import { join } from 'path';

const OUTPUT_DIR = '/Users/zhangdetong/Documents/workspace/gzh/agent-reward-hub/docs/moltiverse-kb/resources';

// URLs to scrape with proper names
const PAGES = [
  {
    name: 'openclaw-aws-monad',
    url: 'https://monad-foundation.notion.site/How-to-host-OpenClaw-on-AWS-for-free-and-install-Monad-skill-2fb6367594f280388337e63eb562b513',
  },
  {
    name: 'nadfun-openclaw',
    url: 'https://monad-foundation.notion.site/How-to-launch-a-token-on-Nad-fun-using-OpenClaw-2fc6367594f280f6baf5ef26a597e12e',
  },
  {
    name: 'moltbook-terminologies',
    url: 'https://monad-foundation.notion.site/Moltbook-terminologies-2ec1a9e7c2584e1192d41afaec236a79',
  },
  {
    name: 'moltbook-signup',
    url: 'https://monad-foundation.notion.site/How-to-ask-your-OpenClaw-to-sign-up-on-Moltbook-2fb6367594f28069b031bc04e9a0484d25',
  },
  {
    name: 'moltbook-integration',
    url: 'https://monad-foundation.notion.site/How-to-integrate-Sign-in-with-Moltbook-2fb6367594f280a989277f5a4e916e0ea1',
  },
];

/**
 * Scrape a single Notion page for actual content
 */
async function scrapePage(browser, page, urlInfo) {
  console.log(`\n📄 Scraping: ${urlInfo.name}`);
  console.log(`   URL: ${urlInfo.url}`);

  try {
    // Use domcontentloaded instead of networkidle to avoid timeout
    await page.goto(urlInfo.url, {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    console.log('   ⏳ Waiting for content to render...');

    // Wait for Notion content to load - look for specific Notion elements
    await page.waitForSelector('.notion-page-content, [data-block-id], .notion-scroller', {
      timeout: 30000
    }).catch(() => {
      console.log('   ⚠️  Standard Notion selectors not found, trying anyway...');
    });

    // Additional wait for dynamic content
    await page.waitForTimeout(8000);

    // Scroll through the page to trigger lazy loading
    console.log('   📜 Scrolling through page...');
    const scrollHeight = await page.evaluate(() => document.body.scrollHeight);
    const scrollSteps = 10;
    const scrollStep = Math.ceil(scrollHeight / scrollSteps);

    for (let i = 0; i < scrollSteps; i++) {
      await page.evaluate((step) => window.scrollTo(0, step), scrollStep * (i + 1));
      await page.waitForTimeout(500);
    }

    // Scroll back to top
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(2000);

    console.log('   🔍 Extracting content...');

    // Extract content using multiple strategies
    const extracted = await page.evaluate(() => {
      const result = {
        method: null,
        title: '',
        content: ''
      };

      // Strategy 1: Notion page content (most reliable for newer Notion)
      const notionContent = document.querySelector('.notion-page-content');
      if (notionContent && notionContent.innerText.length > 200) {
        result.method = 'notion-page-content';
        result.content = notionContent.innerText.trim();
        return result;
      }

      // Strategy 2: Notion scroller (full page content)
      const scroller = document.querySelector('.notion-scroller');
      if (scroller && scroller.innerText.length > 200) {
        result.method = 'notion-scroller';
        result.content = scroller.innerText.trim();
        return result;
      }

      // Strategy 3: All blocks with data-block-id
      const blocks = document.querySelectorAll('[data-block-id]');
      if (blocks.length > 0) {
        const blockTexts = Array.from(blocks).map(b => b.innerText).filter(t => t.trim().length > 0);
        const combined = blockTexts.join('\n\n');
        if (combined.length > 200) {
          result.method = 'data-block-id';
          result.content = combined;
          return result;
        }
      }

      // Strategy 4: Notion text blocks
      const textBlocks = document.querySelectorAll('.notion-text-content');
      if (textBlocks.length > 0) {
        const texts = Array.from(textBlocks).map(b => b.innerText).filter(t => t.trim().length > 0);
        const combined = texts.join('\n\n');
        if (combined.length > 200) {
          result.method = 'notion-text-content';
          result.content = combined;
          return result;
        }
      }

      // Strategy 5: Main or article tags
      for (const selector of ['main', 'article', '[role="main"]']) {
        const element = document.querySelector(selector);
        if (element && element.innerText.length > 200) {
          result.method = selector;
          result.content = element.innerText.trim();
          return result;
        }
      }

      // Strategy 6: Body content as last resort
      result.method = 'body';
      result.content = document.body.innerText.trim();
      return result;
    });

    // Try to get title
    const title = await page.evaluate(() => {
      const titleSelectors = [
        '.notion-title',
        'h1',
        '[data-block-id="first-title"]',
        'title'
      ];

      for (const selector of titleSelectors) {
        const el = document.querySelector(selector);
        if (el && el.innerText && el.innerText.length > 0 && el.innerText.length < 200) {
          return el.innerText.trim();
        }
      }
      return '';
    });

    const filename = `${urlInfo.name}.md`;
    const filepath = join(OUTPUT_DIR, filename);

    // Format as markdown
    let markdown = `# ${title || urlInfo.name}\n\n`;
    markdown += `**Source:** ${urlInfo.url}\n\n`;
    markdown += `**Extraction Method:** ${extracted.method}\n\n`;
    markdown += `---\n\n`;
    markdown += extracted.content;

    writeFileSync(filepath, markdown, 'utf8');

    console.log(`   ✅ Saved to: ${filename}`);
    console.log(`   📊 Content length: ${extracted.content.length} chars`);
    console.log(`   🔧 Method used: ${extracted.method}`);

    return { success: true, name: urlInfo.name, length: extracted.content.length, method: extracted.method };

  } catch (error) {
    console.log(`   ❌ Failed: ${error.message}`);
    return { success: false, name: urlInfo.name, error: error.message };
  }
}

/**
 * Main function to scrape all pages
 */
async function main() {
  console.log('🚀 Starting Notion scraping with Chromium...\n');
  console.log(`Output directory: ${OUTPUT_DIR}\n`);

  const browser = await chromium.launch({
    headless: false,  // Set to false to see what's happening
    slowMo: 100  // Slow down operations for stability
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  const results = [];

  for (const pageInfo of PAGES) {
    const result = await scrapePage(browser, page, pageInfo);
    results.push(result);

    // Brief pause between requests
    await page.waitForTimeout(3000);
  }

  await browser.close();

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 SCRAPING SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total pages: ${PAGES.length}`);
  console.log(`Successful: ${results.filter(r => r.success).length}`);
  console.log(`Failed: ${results.filter(r => !r.success).length}`);

  const successful = results.filter(r => r.success);
  if (successful.length > 0) {
    const totalChars = successful.reduce((sum, r) => sum + r.length, 0);
    console.log(`Total content extracted: ${totalChars.toLocaleString()} chars`);
    console.log(`Average per page: ${Math.round(totalChars / successful.length)} chars`);

    console.log('\n✅ Successfully scraped:');
    successful.forEach(r => {
      console.log(`   - ${r.name} (${r.length.toLocaleString()} chars, method: ${r.method})`);
    });
  }

  const failed = results.filter(r => !r.success);
  if (failed.length > 0) {
    console.log('\n❌ Failed to scrape:');
    failed.forEach(r => {
      console.log(`   - ${r.name}: ${r.error}`);
    });
  }

  console.log('\n' + '='.repeat(60));
}

main().catch(console.error);
