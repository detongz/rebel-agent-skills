#!/usr/bin/env node
/**
 * Fix all problematic docs by scraping their actual content with Chromium
 */

import { chromium } from 'playwright';
import { writeFileSync, readFileSync } from 'fs';
import { join } from 'path';

const OUTPUT_DIR = '/Users/zhangdetong/Documents/workspace/gzh/agent-reward-hub/docs/moltiverse-kb/resources';

// All problematic docs with their source URLs
const PROBLEMATIC_DOCS = [
  {
    file: 'doc-1-2fb33a257d9b812d9fe9e804c99d11.md',
    url: 'https://www.notion.so/2fb33a257d9b812d9fe9e804c99d1130?pvs=25',
    name: 'Notion Doc 1',
    type: 'notion'
  },
  {
    file: 'doc-2-How-to-launch-a-token-on-Nad-f.md',
    url: 'https://destiny-alloy-6d2.notion.site/How-to-launch-a-token-on-Nad-fun-using-OpenClaw-2fc33a257d9b81c691affe628cc6ce6f',
    name: 'Nad.fun OpenClaw Guide',
    type: 'notion'
  },
  {
    file: 'doc-4-circle-wallet.md',
    url: 'https://clawhub.ai/eltontay/circle-wallet',
    name: 'Circle Wallet ClawHub Skill',
    type: 'clawhub'
  },
  {
    file: 'doc-10-2017888313735028987?s=20.md',
    url: 'https://x.com/harpaljadeja/status/2017888313735028987?s=20',
    name: 'X Post 1',
    type: 'twitter'
  },
  {
    file: 'doc-12-2017903854873096663?s=20.md',
    url: 'https://x.com/harpaljadeja/status/2017903854873096663?s=20',
    name: 'X Post 2',
    type: 'twitter'
  },
  {
    file: 'doc-13-.md',
    url: 'http://nad.fun/',
    name: 'Nad.fun Homepage',
    type: 'web'
  }
];

async function scrapeWithChromium(url, type, name) {
  console.log(`\n🔍 Scraping: ${name}`);
  console.log(`   URL: ${url}`);
  console.log(`   Type: ${type}`);

  const browser = await chromium.launch({
    headless: false,
    slowMo: 50
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  try {
    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 45000
    });

    console.log('   ⏳ Waiting for content to load...');
    await page.waitForTimeout(5000);

    let content = '';
    let title = name;

    if (type === 'notion') {
      // Wait for Notion content
      await page.waitForSelector('.notion-page-content, [data-block-id], .notion-scroller', {
        timeout: 15000
      }).catch(() => {});

      // Scroll to load lazy content
      for (let i = 0; i < 5; i++) {
        await page.evaluate(() => window.scrollBy(0, 300));
        await page.waitForTimeout(300);
      }

      content = await page.evaluate(() => {
        const selectors = [
          '.notion-page-content',
          '.notion-scroller',
          '[data-block-id]'
        ];

        for (const selector of selectors) {
          const el = document.querySelector(selector);
          if (el && el.innerText.length > 100) {
            return el.innerText.trim();
          }
        }

        return document.body.innerText.trim();
      });

    } else if (type === 'clawhub') {
      // Wait for skill content
      await page.waitForTimeout(8000);

      content = await page.evaluate(() => {
        // Try to find skill content
        const skillSelectors = [
          '[class*="skill"]',
          '[class*="code"]',
          'pre',
          'main',
          'article'
        ];

        for (const selector of skillSelectors) {
          const el = document.querySelector(selector);
          if (el && el.innerText.length > 200) {
            return el.innerText.trim();
          }
        }

        return document.body.innerText.trim();
      });

    } else if (type === 'twitter') {
      // Wait for tweet content
      await page.waitForTimeout(5000);

      content = await page.evaluate(() => {
        // Try to find tweet text
        const tweetSelectors = [
          '[data-testid="tweetText"]',
          '[data-testid="tweet"]',
          'article'
        ];

        const tweets = [];
        for (const selector of tweetSelectors) {
          const elements = document.querySelectorAll(selector);
          for (const el of elements) {
            const text = el.innerText;
            if (text && text.length > 10 && !text.includes('Log in') && !text.includes('Sign up')) {
              tweets.push(text);
            }
          }
        }

        return tweets.length > 0 ? tweets.join('\n\n---\n\n') : document.body.innerText.trim();
      });

    } else {
      // Generic web scraping
      content = await page.evaluate(() => {
        const selectors = ['main', 'article', '[role="main"]', '.content'];
        for (const selector of selectors) {
          const el = document.querySelector(selector);
          if (el && el.innerText.length > 100) {
            return el.innerText.trim();
          }
        }
        return document.body.innerText.trim();
      });
    }

    // Clean up content
    content = content
      .split('\n')
      .filter(line => !line.includes('Skip to main content') &&
                      !line.includes('Sign in') &&
                      !line.includes('Log in') &&
                      line.trim().length > 0)
      .join('\n');

    await browser.close();

    console.log(`   ✅ Scraped ${content.length} characters`);

    return {
      success: true,
      content,
      title
    };

  } catch (error) {
    await browser.close();
    console.log(`   ❌ Failed: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

async function main() {
  console.log('🚀 Fixing problematic docs...\n');

  const results = [];

  for (const doc of PROBLEMATIC_DOCS) {
    const result = await scrapeWithChromium(doc.url, doc.type, doc.name);

    if (result.success) {
      // Read existing file to get source URL
      const existingPath = join(OUTPUT_DIR, doc.file);
      let sourceLine = `Source: ${doc.url}`;

      try {
        const existingContent = readFileSync(existingPath, 'utf8');
        const sourceMatch = existingContent.match(/Source: (.+)/);
        if (sourceMatch) {
          sourceLine = `Source: ${sourceMatch[1]}`;
        }
      } catch (e) {
        // File doesn't exist, use URL from config
      }

      // Write new content
      const newContent = `# ${result.title}\n\n${sourceLine}\n\n${result.content}`;
      writeFileSync(existingPath, newContent, 'utf8');

      results.push({
        file: doc.file,
        success: true,
        chars: result.content.length
      });
    } else {
      results.push({
        file: doc.file,
        success: false,
        error: result.error
      });
    }

    // Brief pause between requests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY');
  console.log('='.repeat(60));

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  console.log(`\n✅ Successfully fixed (${successful.length}):`);
  successful.forEach(r => {
    console.log(`   - ${r.file} (${r.chars} chars)`);
  });

  if (failed.length > 0) {
    console.log(`\n❌ Failed (${failed.length}):`);
    failed.forEach(r => {
      console.log(`   - ${r.file}: ${r.error}`);
    });
  }

  console.log('\n' + '='.repeat(60));
}

main().catch(console.error);
