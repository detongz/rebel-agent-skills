/**
 * Scrape OpenClaw documentation using Playwright
 * Downloads all documentation pages from docs.openclaw.ai
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://docs.openclaw.ai';
const OUTPUT_DIR = path.join(__dirname, '../docs/openclawdoc');

// Create output directory
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// URLs to scrape - add all important doc pages
const DOC_PAGES = [
  '/',
  '/introduction',
  '/quickstart',
  '/plugins',
  '/plugins/overview',
  '/plugins/creating-a-plugin',
  '/plugins/plugin-configuration',
  '/plugins/plugin-api',
  '/agents',
  '/agents/overview',
  '/agents/agent-protocol',
  '/agents/agent-capabilities',
  '/integrations',
  '/integrations/overview',
  '/integrations/mcp',
  '/reference',
  '/reference/api',
  '/reference/configuration',
  '/examples',
  '/examples/tutorials',
];

// Set to track visited URLs (avoid duplicates)
const visited = new Set();
const downloaded = [];

/**
 * Convert URL to filename
 */
function urlToFilename(url) {
  // Remove leading slash and replace special chars
  const clean = url.replace(/^\//, '').replace(/\/+/g, '-').replace(/[^a-zA-Z0-9-]/g, '-');
  return clean || 'index';
}

/**
 * Scrape a single page
 */
async function scrapePage(page, url) {
  const fullUrl = `${BASE_URL}${url}`;
  const filename = `${urlToFilename(url)}.html`;
  const filepath = path.join(OUTPUT_DIR, filename);

  if (visited.has(url)) {
    return null;
  }
  visited.add(url);

  try {
    console.log(`📄 Scraping: ${fullUrl}`);

    await page.goto(fullUrl, { waitUntil: 'networkidle', timeout: 30000 });

    // Get the page content
    const content = await page.content();

    // Also extract text content for easier reading
    const textContent = await page.evaluate(() => {
      // Remove script and style elements
      const clone = document.cloneNode(true);
      const scripts = clone.querySelectorAll('script, style, nav, footer');
      scripts.forEach(el => el.remove());

      // Get main content
      const main = clone.querySelector('main, article, .content, .docs-content');
      return main ? main.innerText : clone.body.innerText;
    });

    // Save HTML
    fs.writeFileSync(filepath, content, 'utf8');

    // Save text version
    const textFilepath = path.join(OUTPUT_DIR, `${urlToFilename(url)}.txt`);
    fs.writeFileSync(textFilepath, `URL: ${fullUrl}\n\n${textContent}`, 'utf8');

    downloaded.push({ url, filename, fullUrl });
    console.log(`  ✅ Saved: ${filename}`);

    // Extract links for further crawling
    const links = await page.evaluate(() => {
      const anchors = Array.from(document.querySelectorAll('a[href]'));
      return anchors
        .map(a => a.getAttribute('href'))
        .filter(href => href && href.startsWith('/'))
        .map(href => href.split('#')[0]) // Remove anchors
        .filter(href => href.length > 1 && !href.startsWith('//')); // Filter out invalid
    });

    return links;

  } catch (error) {
    console.error(`  ❌ Error scraping ${fullUrl}:`, error.message);
    return null;
  }
}

/**
 * Main scraping function
 */
async function scrapeDocs() {
  console.log('🚀 Starting OpenClaw documentation scrape...\n');
  console.log(`Output directory: ${OUTPUT_DIR}\n`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
  });
  const page = await context.newPage();

  const queue = [...DOC_PAGES];

  while (queue.length > 0) {
    const url = queue.shift();

    // Skip if already visited
    if (visited.has(url)) continue;

    // Scrape page and get links
    const links = await scrapePage(page, url);

    // Add new links to queue
    if (links && links.length > 0) {
      for (const link of links) {
        if (!visited.has(link) && link.startsWith('/') && !link.includes('.')) {
          queue.push(link);
        }
      }
    }

    // Rate limiting
    await page.waitForTimeout(500);
  }

  await browser.close();

  // Create index
  const indexPath = path.join(OUTPUT_DIR, 'INDEX.md');
  let indexContent = `# OpenClaw Documentation Index\n\n`;
  indexContent += `> Downloaded from ${BASE_URL}\n`;
  indexContent += `> Downloaded at: ${new Date().toISOString()}\n\n`;
  indexContent += `## Downloaded Pages (${downloaded.length})\n\n`;

  for (const item of downloaded) {
    indexContent += `- [${item.url}](${item.filename}) - ${item.fullUrl}\n`;
  }

  fs.writeFileSync(indexPath, indexContent, 'utf8');

  console.log('\n' + '='.repeat(60));
  console.log(`✅ Scraping complete!`);
  console.log(`📊 Total pages downloaded: ${downloaded.length}`);
  console.log(`📁 Output directory: ${OUTPUT_DIR}`);
  console.log(`📋 Index: ${indexPath}`);
  console.log('='.repeat(60) + '\n');

  return downloaded.length;
}

// Run the scraper
scrapeDocs()
  .then(count => {
    console.log(`🎉 Successfully downloaded ${count} pages!`);
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Scraping failed:', error);
    process.exit(1);
  });
