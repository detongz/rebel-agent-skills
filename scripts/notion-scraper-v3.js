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

async function extractNotionData(page) {
  // Try to extract data from Notion's internal state
  const data = await page.evaluate(() => {
    const result = {
      title: '',
      content: '',
      links: [],
      blocks: []
    };

    // Get title
    const titleSelectors = [
      'title',
      'h1',
      '.notion-title',
      '[data-block-id][placeholder="Untitled"]'
    ];

    for (const selector of titleSelectors) {
      const el = document.querySelector(selector);
      if (el && el.textContent) {
        result.title = el.textContent.trim();
        break;
      }
    }

    // Get all text content
    const bodyText = document.body.innerText || document.body.textContent || '';
    result.content = bodyText;

    // Get all links
    document.querySelectorAll('a[href]').forEach(a => {
      const href = a.getAttribute('href');
      if (href) {
        result.links.push(href);
      }
    });

    // Get all block IDs
    document.querySelectorAll('[data-block-id]').forEach(block => {
      const blockId = block.getAttribute('data-block-id');
      const text = block.textContent || block.innerText || '';
      result.blocks.push({ id: blockId, text: text.substring(0, 100) });
    });

    // Try to get Notion's internal data
    const scripts = Array.from(document.querySelectorAll('script'));
    for (const script of scripts) {
      const text = script.textContent;
      if (text && text.includes('notion') && text.length > 1000) {
        // This might contain page data
        try {
          // Try to extract JSON data
          const matches = text.match(/\{[^{}]*"recordMap"[^{}]*\}/);
          if (matches) {
            result.rawData = matches[0].substring(0, 500);
          }
        } catch (e) {
          // Ignore JSON parse errors
        }
      }
    }

    return result;
  });

  return data;
}

async function main() {
  console.log('🚀 Notion Scraper v3 - Advanced Mode\n');

  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  // Try multiple approaches
  const approaches = [
    {
      name: 'Direct Load',
      setup: async (context) => {
        // No special setup
      }
    },
    {
      name: 'With Cookies',
      setup: async (context) => {
        // Add common cookies that might help
        await context.addCookies([
          {
            name: 'notion_browser_id',
            value: 'test-id',
            domain: '.notion.so',
            path: '/'
          }
        ]);
      }
    }
  ];

  for (const approach of approaches) {
    console.log(`\n📝 Trying approach: ${approach.name}`);

    const browser = await chromium.launch({
      headless: false,
      slowMo: 100 // Slow down to see what's happening
    });

    try {
      const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        viewport: { width: 1920, height: 1080 }
      });

      await approach.setup(context);

      const page = await context.newPage();

      // Navigate to the page
      console.log(`📄 Loading: ${NOTION_URL}`);
      await page.goto(NOTION_URL, {
        waitUntil: 'networkidle',
        timeout: 30000
      });

      // Wait for content
      console.log('⏳ Waiting for dynamic content (10s)...');
      await page.waitForTimeout(10000);

      // Take multiple screenshots at different stages
      await page.screenshot({ path: path.join(OUTPUT_DIR, `screenshot-${approach.name.replace(/\s+/g, '-')}-1.png`) });

      // Try scrolling to trigger lazy loading
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
      await page.waitForTimeout(3000);

      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(2000);

      await page.screenshot({ path: path.join(OUTPUT_DIR, `screenshot-${approach.name.replace(/\s+/g, '-')}-2.png`), fullPage: true });

      // Extract data
      console.log('🔍 Extracting page data...');
      const data = await extractNotionData(page);

      console.log(`📊 Results:`);
      console.log(`  - Title: ${data.title || 'Not found'}`);
      console.log(`  - Content length: ${data.content.length} chars`);
      console.log(`  - Links found: ${data.links.length}`);
      console.log(`  - Blocks found: ${data.blocks.length}`);

      // Save raw data
      await fs.writeFile(
        path.join(OUTPUT_DIR, `data-${approach.name.replace(/\s+/g, '-')}.json`),
        JSON.stringify(data, null, 2),
        'utf8'
      );

      await fs.writeFile(
        path.join(OUTPUT_DIR, `content-${approach.name.replace(/\s+/g, '-')}.txt`),
        data.content,
        'utf8'
      );

      // Check if we got meaningful content
      if (data.content.length > 500) {
        console.log(`✅ Success with approach: ${approach.name}`);

        // Extract Notion URLs from content
        const urlPattern = /https?:\/\/[^\s\n]+notion\.so\/[a-zA-Z0-9-]+/g;
        const urls = [...new Set(data.content.match(urlPattern) || [])];

        console.log(`🔗 Found ${urls.length} unique Notion URLs`);
        await fs.writeFile(
          path.join(OUTPUT_DIR, 'urls.txt'),
          urls.join('\n'),
          'utf8'
        );

        // Save main page content
        const mainTitle = data.title || 'Resources';
        const filepath = path.join(OUTPUT_DIR, `${sanitizeFilename(mainTitle)}.md`);
        const markdown = `# ${mainTitle}\n\nSource: ${NOTION_URL}\n\n${data.content}`;
        await fs.writeFile(filepath, markdown, 'utf8');
        console.log(`📁 Saved main page to: ${filepath}`);

        // If we found URLs, scrape them too
        if (urls.length > 0) {
          console.log(`\n📚 Scraping ${urls.length} linked pages...`);
          const results = [];

          for (let i = 0; i < Math.min(urls.length, 20); i++) { // Limit to 20 pages
            const url = urls[i];
            console.log(`[${i + 1}/${urls.length}] Scraping: ${url}`);

            try {
              const newPage = await context.newPage();
              await newPage.goto(url, { waitUntil: 'networkidle', timeout: 20000 });
              await newPage.waitForTimeout(3000);

              const pageData = await extractNotionData(newPage);
              const pageTitle = pageData.title || `Document ${i + 1}`;

              const docFilepath = path.join(OUTPUT_DIR, sanitizeFilename(`${i + 1}-${pageTitle}`));
              const docMarkdown = `# ${pageTitle}\n\nSource: ${url}\n\n${pageData.content}`;
              await fs.writeFile(`${docFilepath}.md`, docMarkdown, 'utf8');

              console.log(`  ✅ Saved: ${pageTitle} (${pageData.content.length} chars)`);
              results.push({ title: pageTitle, url, success: true, contentLength: pageData.content.length });

              await newPage.close();
              await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (error) {
              console.log(`  ❌ Error: ${error.message}`);
              results.push({ url, error: error.message, success: false });
            }
          }

          // Summary
                          console.log('\n📊 Scraping Summary:');
          console.log('='.repeat(50));
                          console.log(`✅ Successfully scraped: ${results.filter(r => r.success).length}`);
          console.log(`❌ Failed: ${results.filter(r => !r.success).length}`);
        }

        break; // Success! Stop trying other approaches
      } else {
        console.log(`⚠️ Approach failed - insufficient content`);
      }

      await browser.close();

    } catch (error) {
      console.error(`❌ Error with approach ${approach.name}:`, error.message);
      await browser.close();
    }
  }

  console.log('\n✨ Done! Check the output directory for results.');
}

main();
