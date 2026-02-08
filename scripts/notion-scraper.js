const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

const NOTION_URL = 'https://www.notion.so/2fb6367594f28090adb5dc495e9c0516?pvs=21';
const OUTPUT_DIR = path.join(__dirname, '../docs/moltiverse-kb/resources');

function sanitizeFilename(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 100);
}

async function extractPageContent(page) {
  const content = await page.evaluate(() => {
    // Try multiple selectors
    const selectors = [
      '.notion-page-content',
      '.notion-text-content',
      '[data-block-id]',
      'main',
      'article',
      'body'
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        const text = element.innerText || element.textContent;
        if (text && text.trim().length > 100) {
          return text.trim();
        }
      }
    }

    // Last resort: Get all text
    return document.body.innerText || document.body.textContent || '';
  });

  return content || '';
}

async function getPageTitle(page) {
  return await page.evaluate(() => {
    const title = document.title || document.querySelector('h1')?.textContent || 'Untitled';
    return title.trim();
  });
}

async function extractAllNotionUrls(page) {
  // Method 1: Look for links in anchor tags
  const anchorLinks = await page.evaluate(() => {
    const links = [];
    document.querySelectorAll('a[href]').forEach(a => {
      const href = a.getAttribute('href');
      if (href && (href.includes('notion.so') || href.startsWith('/'))) {
        // Convert relative URLs to absolute
        let absoluteUrl = href;
        if (href.startsWith('/')) {
          absoluteUrl = 'https://www.notion.so' + href;
        }
        // Remove query params and hash
        absoluteUrl = absoluteUrl.split('?')[0].split('#')[0];
        if (absoluteUrl.length > 30) { // Valid Notion URLs are long
          links.push(absoluteUrl);
        }
      }
    });
    return [...new Set(links)];
  });

  // Method 2: Parse URLs from page text
  const textLinks = await page.evaluate(() => {
    const text = document.body.innerText;
    const urlPattern = /https?:\/\/[^\s\n]+notion\.so\/[a-zA-Z0-9-]+/g;
    const matches = text.match(urlPattern) || [];
    return [...new Set(matches.map(url => url.split('?')[0].split('#')[0]))];
  });

  // Method 3: Look for data-block-id attributes and construct URLs
  const blockUrls = await page.evaluate(() => {
    const blocks = document.querySelectorAll('[data-block-id]');
    const urls = [];
    blocks.forEach(block => {
      const blockId = block.getAttribute('data-block-id');
      if (blockId && blockId.length > 10) {
        urls.push(`https://www.notion.so/${blockId}`);
      }
    });
    return [...new Set(urls)];
  });

  // Combine all methods
  const allUrls = [...new Set([...anchorLinks, ...textLinks, ...blockUrls])];
  console.log(`Found ${anchorLinks.length} anchor links, ${textLinks.length} text links, ${blockUrls.length} block URLs`);
  console.log(`Total unique URLs: ${allUrls.length}`);

  return allUrls;
}

async function scrapePage(url, index) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();

  try {
    console.log(`[${index}] Loading: ${url}`);

    await page.goto(url, {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // Wait for content
    await page.waitForTimeout(3000);

    const title = await getPageTitle(page);
    console.log(`[${index}] Title: ${title}`);

    const content = await extractPageContent(page);

    if (content.length < 100) {
      console.log(`[${index}] Warning: Very short content (${content.length} chars)`);
    }

    const filename = sanitizeFilename(`${index}-${title}`);
    const filepath = path.join(OUTPUT_DIR, `${filename}.md`);

    const markdown = `# ${title}\n\nSource: ${url}\n\n${content}`;
    await fs.writeFile(filepath, markdown, 'utf8');

    console.log(`[${index}] Saved: ${filename}.md (${content.length} chars)`);
    return { title, url, success: true, contentLength: content.length };

  } catch (error) {
    console.error(`[${index}] Error: ${error.message}`);
    return { url, error: error.message, success: false };
  } finally {
    await browser.close();
  }
}

async function main() {
  console.log('🚀 Notion Scraper v2\n');

  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: false }); // Use visible browser for debugging
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  try {
    console.log('📄 Loading Resources page...');
    await page.goto(NOTION_URL, {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    console.log('⏳ Waiting for dynamic content...');
    await page.waitForTimeout(8000);

    // Take screenshot
    await page.screenshot({ path: path.join(OUTPUT_DIR, 'page-screenshot.png'), fullPage: true });

    // Get page text for inspection
    const pageText = await page.evaluate(() => document.body.innerText);
    await fs.writeFile(path.join(OUTPUT_DIR, 'page-content.txt'), pageText, 'utf8');
    console.log('📄 Page content saved to page-content.txt');

    // Extract URLs
    console.log('\n🔗 Extracting Notion URLs...');
    const urls = await extractAllNotionUrls(page);

    // Save URLs
    await fs.writeFile(
      path.join(OUTPUT_DIR, 'extracted-urls.txt'),
      urls.join('\n'),
      'utf8'
    );

    console.log(`\nFound ${urls.length} unique URLs`);

    // Filter out the main page
    const documentUrls = urls.filter(url =>
      !url.includes('2fb6367594f28090adb5dc495e9c0516') && // Not the main page
      url.length > 40 // Valid Notion page URLs
    );

    console.log(`After filtering: ${documentUrls.length} document URLs\n`);

    await browser.close();

    if (documentUrls.length === 0) {
      console.log('❌ No document URLs found. The page might require authentication or has a different structure.');
      console.log('📄 Check page-content.txt for the raw page content.');
      return;
    }

    // Scrape each document
    console.log('📚 Scraping documents...\n');
    const results = [];

    for (let i = 0; i < documentUrls.length; i++) {
      const result = await scrapePage(documentUrls[i], i + 1);
      results.push(result);
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    // Summary
    console.log('\n📊 Summary:');
    console.log('='.repeat(50));
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    console.log(`✅ Success: ${successful.length}`);
    console.log(`❌ Failed: ${failed.length}`);

    successful.forEach(r => {
      console.log(`  - ${r.title} (${r.contentLength} chars)`);
    });

    if (failed.length > 0) {
      console.log('\n❌ Failed:');
      failed.forEach(f => console.log(`  - ${f.url}: ${f.error}`));
    }

  } catch (error) {
    console.error('❌ Fatal error:', error);
  } finally {
    await browser.close();
  }
}

main();
