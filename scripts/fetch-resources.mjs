/**
 * Fetch all Moltiverse key resources
 */

import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const OUTPUT_DIR = join(process.cwd(), 'docs', 'moltiverse-kb', 'resources');
mkdirSync(OUTPUT_DIR, { recursive: true });

const RESOURCES = [
  {
    name: 'openclaw-monad-skill.md',
    url: 'https://raw.githubusercontent.com/portdeveloper/skills/refs/heads/master/skills/monad-development/SKILL.md',
    description: 'OpenClaw Monad Development Skill'
  },
  {
    name: 'monad-agents.md',
    url: 'https://gist.githubusercontent.com/portdeveloper/c899ea34ccfd00e6375ab3edea259ecd/raw/576390e96cf43e8faf8ba1dc54149244f32f4539/AGENTS.md',
    description: 'Monad AGENTS.md'
  },
  {
    name: 'moltbook-skill.md',
    url: 'https://www.moltbook.com/skill.md',
    description: 'Moltbook Skill'
  },
  {
    name: 'nad-fun-llms.txt',
    url: 'https://nad.fun/llms.txt',
    description: 'Nad.fun LLM file'
  }
];

async function fetchResource(page, resource) {
  console.log(`\n📥 Fetching: ${resource.name}`);
  console.log(`   URL: ${resource.url}`);

  try {
    const response = await page.goto(resource.url, { waitUntil: 'domcontentloaded', timeout: 30000 });

    if (!response.ok()) {
      throw new Error(`HTTP ${response.status()}`);
    }

    const content = await response.text();
    const filePath = join(OUTPUT_DIR, resource.name);
    writeFileSync(filePath, content, 'utf-8');

    console.log(`   ✅ Saved ${content.length} bytes`);
    return { name: resource.name, content, success: true };
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    return { name: resource.name, error: error.message, success: false };
  }
}

async function fetchAllResources() {
  console.log('🚀 Fetching Moltiverse Key Resources...\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const results = [];

  for (const resource of RESOURCES) {
    const result = await fetchResource(page, resource);
    results.push(result);
  }

  await browser.close();

  // Generate summary
  const summary = `# Moltiverse Key Resources - Summary

Fetched at: ${new Date().toISOString()}

## Results

${results.map(r => r.success
  ? `✅ **${r.name}**: ${r.content.length} bytes`
  : `❌ **${r.name}**: ${r.error}`
).join('\n')}

## Resources

${RESOURCES.map(r => `
### ${r.name}
- **URL**: ${r.url}
- **Description**: ${r.description}
`).join('\n')}
`;

  writeFileSync(join(OUTPUT_DIR, 'README.md'), summary, 'utf-8');

  console.log('\n\n📊 Summary:');
  console.log(`   ✅ Success: ${results.filter(r => r.success).length}`);
  console.log(`   ❌ Failed: ${results.filter(r => !r.success).length}`);
  console.log(`   📁 Output: ${OUTPUT_DIR}`);
}

fetchAllResources().catch(console.error);
