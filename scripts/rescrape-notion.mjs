#!/usr/bin/env node
/**
 * Re-scrape Notion pages that failed before
 * Focus on getting actual content, not just HTML/JS
 */

import { chromium } from 'playwright';
import { writeFileSync } from 'fs';
import { join } from 'path';

const OUTPUT_DIR = '/Users/zhangdetong/Documents/workspace/gzh/agent-reward-hub/docs/moltiverse-kb/resources';

// URLs to re-scrape (from archive/invalid-notion-scrapes/)
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

async function scrapePage(browser, page, urlInfo) {
  console.log(`\n📄 Scraping: ${urlInfo.name}`);
  console.log(`   URL: ${urlInfo.url.substring(0, 80)}...`);

  try {
    await page.goto(urlInfo.url, {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // Wait for content to load
    await page.waitForTimeout(5000);

    // Scroll multiple times to trigger lazy loading
    for (let i = 0; i < 8; i++) {
      await page.evaluate(() => window.scrollBy(0, 400));
      await page.waitForTimeout(300);
    }

    // Try multiple extraction strategies
    const content = await page.evaluate(() => {
      // Strategy 1: Try to find main content area
      const selectors = [
        '.notion-page-content',
        '[contenteditable="true"]',
        'article',
        'main',
        '.notion-scroller',
        '.notion-text'
      ];

      for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element && element.innerText.length > 500) {
          return {
            method: selector,
            content: element.innerText.trim()
          };
        }
      }

      // Strategy 2: Get all text from body
      return {
        method: 'body',
        content: document.body.innerText.trim()
      };
    });

    const filename = `${urlInfo.name}.md`;
    const filepath = join(OUTPUT_DIR, filename);

    writeFileSync(filepath, `# ${urlInfo.name}\n\nSource: ${urlInfo.url}\n\nExtraction method: ${content.method}\n\n${content.content}`);

    console.log(`   ✅ Saved to: ${filename}`);
    console.log(`   📊 Content length: ${content.content.length} chars`);

    return { success: true, name: urlInfo.name, length: content.content.length };

  } catch (error) {
    console.log(`   ❌ Failed: ${error.message}`);
    return { success: false, name: urlInfo.name, error: error.message };
  }
}

async function main() {
  console.log('🚀 Re-scraping Notion pages...\n');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  const results = [];

  for (const pageInfo of PAGES) {
    const result = await scrapePage(browser, page, pageInfo);
    results.push(result);
    await page.waitForTimeout(2000); // Brief pause between requests
  }

  await browser.close();

  console.log('\n📊 Summary:');
  console.log(`Total: ${PAGES.length}`);
  console.log(`Success: ${results.filter(r => r.success).length}`);
  console.log(`Failed: ${results.filter(r => !r.success).length}`);

  const successful = results.filter(r => r.success);
  const totalChars = successful.reduce((sum, r) => sum + r.length, 0);
  console.log(`Total content: ${totalChars} chars`);
}

main().catch(console.error);
