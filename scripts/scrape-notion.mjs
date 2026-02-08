/**
 * Playwright Script to Scrape Notion Knowledge Base
 * For Moltiverse Hackathon
 * Optimized for Notion's dynamic loading
 */

import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const NOTION_URL = 'https://monad-foundation.notion.site/Moltiverse-resources-2fb6367594f280c3820adf679d9b35ff';
const OUTPUT_DIR = join(process.cwd(), 'docs', 'moltiverse-kb');

// Ensure output directory exists
mkdirSync(OUTPUT_DIR, { recursive: true });

async function scrapeNotionPage() {
  console.log('🚀 Starting Notion scraper (Chromium)...');
  console.log('📍 URL:', NOTION_URL);
  console.log('📁 Output dir:', OUTPUT_DIR);

  const browser = await chromium.launch({
    headless: false, // Show browser for debugging
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
  });

  const page = await context.newPage();

  try {
    console.log('⏳ Loading page...');
    await page.goto(NOTION_URL, { waitUntil: 'commit', timeout: 90000 });

    // Wait extensively for Notion to load all content
    console.log('⏳ Waiting for Notion content to load...');
    await page.waitForTimeout(8000);

    // Wait for Notion-specific elements
    console.log('⏳ Waiting for Notion elements...');
    try {
      // Wait for either notion blocks or collection content
      await page.waitForSelector('div[class*="notion"], div[class*="block"], [class*="collection"], [class*="page-content"]', { timeout: 15000 });
      console.log('✅ Notion content detected');
    } catch (e) {
      console.log('⚠️ No specific Notion selector found, trying alternative...');
    }

    // Additional wait for any lazy-loaded content
    await page.waitForTimeout(3000);

    // Scroll to bottom to trigger lazy loading
    console.log('📜 Scrolling to load all content...');
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await page.waitForTimeout(2000);

    // Scroll back to top
    await page.evaluate(() => {
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(2000);

    // Extract page title
    let title = 'Moltiverse Resources';
    try {
      title = await page.evaluate(() => {
        const titleSelectors = [
          'h1[class*="title"]',
          '[class*="notion-title"]',
          'h1',
          'title'
        ];
        for (const selector of titleSelectors) {
          const el = document.querySelector(selector);
          if (el && el.textContent && el.textContent.trim().length > 0) {
            return el.textContent.trim();
          }
        }
        return 'Moltiverse Resources';
      });
    } catch (e) {
      console.log('⚠️ Could not extract title');
    }
    console.log('📄 Page title:', title);

    // Extract all visible text
    console.log('📖 Extracting all visible content...');
    const visibleText = await page.evaluate(() => {
      // Get all text nodes
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        null
      );

      let text = '';
      let node;
      while (node = walker.nextNode()) {
        const nodeText = node.textContent.trim();
        if (nodeText.length > 0) {
          text += nodeText + '\n';
        }
      }
      return text;
    });

    // Extract all links with better selector
    console.log('🔗 Extracting links...');
    const links = await page.evaluate(() => {
      const linkElements = document.querySelectorAll('a[href]');
      return Array.from(linkElements)
        .map(a => ({
          text: a.textContent.trim(),
          href: a.getAttribute('href')
        }))
        .filter(l => l.text && l.href && !l.href.startsWith('#') && !l.href.includes('void'));
    });

    // Extract all URLs from text content
    console.log('🌐 Extracting URLs...');
    const urls = await page.evaluate(() => {
      const urlPattern = /https?:\/\/[^\s\n\)"']+/gi;
      const bodyText = document.body.innerText;
      const found = bodyText.match(urlPattern) || [];
      return [...new Set(found.map(u => u.replace(/[)"',]/g, '')))];
    });

    // Extract structured data (headers, lists, etc.)
    console.log('📋 Extracting structure...');
    const structure = await page.evaluate(() => {
      const result = [];

      // Headers
      document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((h, i) => {
        result.push({
          type: 'header',
          tag: h.tagName,
          text: h.textContent.trim(),
          index: i
        });
      });

      // List items
      document.querySelectorAll('li').forEach((li, i) => {
        const text = li.textContent.trim();
        if (text.length > 0 && text.length < 500) {
          result.push({
            type: 'list',
            text: text,
            index: i
          });
        }
      });

      // Paragraphs
      document.querySelectorAll('p').forEach((p, i) => {
        const text = p.textContent.trim();
        if (text.length > 10 && text.length < 1000) {
          result.push({
            type: 'paragraph',
            text: text,
            index: i
          });
        }
      });

      return result;
    });

    // Extract code blocks
    console.log('💻 Extracting code blocks...');
    const codeBlocks = await page.evaluate(() => {
      const blocks = [];
      document.querySelectorAll('pre, code, [class*="code"]').forEach((block, i) => {
        const text = block.textContent.trim();
        if (text.length > 10) {
          blocks.push({
            index: i,
            content: text,
            language: block.className || 'unknown'
          });
        }
      });
      return blocks;
    });

    // Extract all blocks (Notion-style)
    console.log('📦 Extracting Notion blocks...');
    const notionBlocks = await page.evaluate(() => {
      const blocks = [];
      // Try various Notion selectors
      const selectors = [
        '[class*="notion-block"]',
        '[class*="notion-text"]',
        '[class*="block-"]',
        'div[role="presentation"]',
        '.notion-page-content',
        '[class*="content"]'
      ];

      for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 5) {
          elements.forEach((el, i) => {
            const text = el.textContent?.trim();
            if (text && text.length > 0 && text.length < 1000) {
              blocks.push({
                selector: selector,
                index: i,
                text: text
              });
            }
          });
          break; // Use the first successful selector
        }
      }
      return blocks;
    });

    // Save comprehensive markdown
    const markdown = `# Moltiverse Resources - Complete Knowledge Base

**Source:** ${NOTION_URL}
**Scraped at:** ${new Date().toISOString()}
**Page Title:** ${title}

---

## 📊 Statistics

- **Visible text length:** ${visibleText.length} characters
- **Links found:** ${links.length}
- **URLs extracted:** ${urls.length}
- **Structured elements:** ${structure.length}
- **Code blocks:** ${codeBlocks.length}
- **Notion blocks:** ${notionBlocks.length}

---

## 🔗 All Links (${links.length} found)

${links.map(l => `### [${l.text}](${l.href})`).join('\n\n')}

---

## 🌐 All URLs (${urls.length} unique)

${urls.map(u => `- ${u}`).join('\n')}

---

## 💻 Code Blocks (${codeBlocks.length} found)

${codeBlocks.map(c => `\`\`\`${c.language}\n${c.content}\n\`\`\``).join('\n\n')}

---

## 📋 Structured Content

### Headers
${structure.filter(s => s.type === 'header').map(s => `${s.tag} ${s.text}`).join('\n')}

### List Items (${structure.filter(s => s.type === 'list').length})
${structure.filter(s => s.type === 'list').map(s => `- ${s.text}`).join('\n')}

### Key Paragraphs
${structure.filter(s => s.type === 'paragraph').slice(0, 20).map(s => s.text).join('\n\n')}

---

## 📦 Notion Blocks (${notionBlocks.length} found)

${notionBlocks.slice(0, 50).map(b => b.text).join('\n\n')}

---

## 📄 Full Visible Content

${visibleText}
`;

    writeFileSync(join(OUTPUT_DIR, 'content.md'), markdown, 'utf-8');
    console.log('✅ Saved content.md');

    // Save JSON
    const jsonData = {
      meta: {
        url: NOTION_URL,
        scrapedAt: new Date().toISOString(),
        title: title
      },
      stats: {
        visibleTextLength: visibleText.length,
        linksCount: links.length,
        urlsCount: urls.length,
        structureCount: structure.length,
        codeBlocksCount: codeBlocks.length,
        notionBlocksCount: notionBlocks.length
      },
      links,
      urls,
      structure,
      codeBlocks,
      notionBlocks: notionBlocks.slice(0, 100) // Limit to first 100
    };

    writeFileSync(join(OUTPUT_DIR, 'data.json'), JSON.stringify(jsonData, null, 2), 'utf-8');
    console.log('✅ Saved data.json');

    // Take screenshots
    console.log('📸 Taking screenshots...');
    await page.screenshot({ path: join(OUTPUT_DIR, 'screenshot-top.png'), fullPage: false });
    console.log('✅ Saved screenshot-top.png');

    // Save URLs separately
    const urlsContent = `# All URLs from Moltiverse Resources

Scraped: ${new Date().toISOString()}

## ${urls.length} URLs

${urls.join('\n')}
`;
    writeFileSync(join(OUTPUT_DIR, 'urls.txt'), urlsContent, 'utf-8');
    console.log('✅ Saved urls.txt');

    console.log('\n📊 Summary:');
    console.log(`   - ${visibleText.length} chars of visible text`);
    console.log(`   - ${links.length} links`);
    console.log(`   - ${urls.length} unique URLs`);
    console.log(`   - ${structure.length} structured elements`);
    console.log(`   - ${codeBlocks.length} code blocks`);
    console.log(`   - ${notionBlocks.length} Notion blocks`);

    console.log('\n✅ Scraping complete!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await browser.close();
  }
}

// Run scraper
scrapeNotionPage().catch(console.error);
