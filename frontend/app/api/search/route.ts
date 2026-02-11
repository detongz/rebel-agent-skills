/**
 * API Route: /api/search
 *
 * GET: Search for agent skills using find-skills intent recognition
 *
 * Flow:
 * 1. Use find-skills logic to understand user intent
 * 2. Rewrite query for better search results
 * 3. Call both npx skills find and npx clawhub search
 * 4. Return aggregated results
 *
 * Based on: https://github.com/vercel-labs/skills/blob/main/skills/find-skills/SKILL.md
 */

import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface SkillResult {
  name: string;
  description: string;
  platform: string;
  source: 'vercel' | 'clawhub' | 'local';
  installCommand: string;
  repository?: string;
  url?: string;
}

interface SearchResponse {
  success: boolean;
  data: SkillResult[];
  count: number;
  query: {
    original: string;
    rewritten: string;
    intent: string;
  };
  sources: {
    clawhub: number;
    vercel: number;
  };
}

/**
 * Intent recognition and query rewriting
 * Based on find-skills skill logic
 */
function analyzeIntent(query: string): { intent: string; rewrittenQuery: string; category?: string } {
  const lowerQuery = query.toLowerCase();

  // Domain detection
  const domains: Record<string, string[]> = {
    'react': ['react', 'next', 'jsx', 'tsx', 'component', 'hook'],
    'testing': ['test', 'spec', 'mock', 'jest', 'vitest', 'cypress', 'playwright'],
    'design': ['design', 'ui', 'ux', 'style', 'css', 'tailwind', 'component'],
    'deployment': ['deploy', 'vercel', 'netlify', 'docker', 'ci/cd', 'build'],
    'security': ['security', 'audit', 'vulnerability', 'safe', 'auth'],
    'database': ['database', 'sql', 'prisma', 'orm', 'query', 'migration'],
    'api': ['api', 'rest', 'graphql', 'fetch', 'endpoint', 'route'],
    'documentation': ['docs', 'readme', 'markdown', 'documentation'],
  };

  // Detect domain
  let detectedDomain: string | undefined;
  for (const [domain, keywords] of Object.entries(domains)) {
    if (keywords.some(kw => lowerQuery.includes(kw))) {
      detectedDomain = domain;
      break;
    }
  }

  // Task type detection
  const taskTypes: Record<string, RegExp[]> = {
    'create': [/create|make|build|generate|new/i],
    'fix': [/fix|debug|solve|error|issue/i],
    'optimize': [/optimize|improve|speed|fast|perform/i],
    'review': [/review|check|audit|analyze/i],
    'deploy': [/deploy|publish|release/i],
    'test': [/test|spec|coverage/i],
  };

  let detectedTask: string | undefined;
  for (const [task, patterns] of Object.entries(taskTypes)) {
    if (patterns.some(p => p.test(query))) {
      detectedTask = task;
      break;
    }
  }

  // Build intent string
  const intentParts = [];
  if (detectedTask) intentParts.push(detectedTask);
  if (detectedDomain) intentParts.push(detectedDomain);
  const intent = intentParts.length > 0 ? intentParts.join(' ') : 'general';

  // Rewrite query for better search results
  let rewrittenQuery = query;

  // Common query transformations
  const transformations: Array<{ pattern: RegExp; replacement: string }> = [
    { pattern: /how do i (make|create|build)/gi, replacement: 'create' },
    { pattern: /how to/gi, replacement: '' },
    { pattern: /can you/gi, replacement: '' },
    { pattern: /i need/gi, replacement: '' },
    { pattern: /help me/gi, replacement: '' },
    { pattern: /want to/gi, replacement: '' },
    { pattern: /\?/g, replacement: '' }, // Remove question marks
  ];

  for (const { pattern, replacement } of transformations) {
    rewrittenQuery = rewrittenQuery.replace(pattern, replacement);
  }

  // Clean up extra spaces
  rewrittenQuery = rewrittenQuery.trim().replace(/\s+/g, ' ');

  // If rewritten query is too short, use original
  if (rewrittenQuery.length < 3) {
    rewrittenQuery = query;
  }

  // Add domain keywords if detected
  if (detectedDomain && !lowerQuery.includes(detectedDomain)) {
    rewrittenQuery = `${detectedDomain} ${rewrittenQuery}`;
  }

  return {
    intent,
    rewrittenQuery,
    category: detectedDomain,
  };
}

/**
 * Search Vercel Skills using npx skills find
 */
async function vercelSearch(query: string): Promise<SkillResult[]> {
  try {
    const { stdout } = await execAsync(
      `npx skills find ${query} 2>/dev/null`,
      { timeout: 30000 }
    );

    const results: SkillResult[] = [];

    // Parse npx skills find output
    const lines = stdout.trim().split('\n');

    for (const line of lines) {
      // Look for package format: owner/repo@skill
      const packageMatch = line.match(/([\w-]+\/[\w-]+)@([\w-]+)/);
      if (packageMatch) {
        const [, repo, skillName] = packageMatch;
        results.push({
          name: skillName,
          description: line.trim(),
          platform: 'claude-code',
          source: 'vercel',
          installCommand: `npx skills add ${repo}@${skillName}`,
          repository: repo,
          url: `https://skills.sh/${repo}/${skillName}`,
        });
      }

      // Look for URL format
      const urlMatch = line.match(/https:\/\/skills\.sh\/([\w/-]+)/);
      if (urlMatch && results.length > 0) {
        results[results.length - 1].url = urlMatch[0];
      }
    }

    return results;
  } catch (error) {
    console.error('Vercel search error:', error);
    return [];
  }
}

/**
 * Search ClawHub using npx clawhub search
 */
async function clawhubSearch(query: string): Promise<SkillResult[]> {
  try {
    const { stdout } = await execAsync(
      `npx clawhub@latest search ${query} 2>/dev/null`,
      { timeout: 30000 }
    );

    const results: SkillResult[] = [];

    // Parse npx clawhub search output
    const lines = stdout.trim().split('\n');

    for (const line of lines) {
      // Look for table format or slug format
      if (line.includes('│')) {
        const parts = line.split('│').map(p => p.trim());
        if (parts.length >= 3 && parts[1] && parts[1] !== 'Slug') {
          results.push({
            name: parts[1],
            description: parts[2] || '',
            platform: 'openclaw',
            source: 'clawhub',
            installCommand: `npx clawhub@latest install ${parts[1]}`,
          });
        }
      } else if (line.match(/^[\w-]+$/) && line.length > 2) {
        // Plain slug
        results.push({
          name: line,
          description: '',
          platform: 'openclaw',
          source: 'clawhub',
          installCommand: `npx clawhub@latest install ${line}`,
        });
      }
    }

    return results;
  } catch (error) {
    console.error('ClawHub search error:', error);
    return [];
  }
}

// GET - Search for skills with intent recognition
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';

    if (!query) {
      return NextResponse.json(
        { success: false, error: 'Missing query parameter: q' },
        { status: 400 }
      );
    }

    // Step 1: Analyze intent and rewrite query
    const { intent, rewrittenQuery, category } = analyzeIntent(query);

    // Step 2: Search both platforms with rewritten query
    const [clawhubResults, vercelResults] = await Promise.all([
      clawhubSearch(rewrittenQuery),
      vercelSearch(rewrittenQuery),
    ]);

    // Step 3: Combine results
    const allResults: SkillResult[] = [
      ...vercelResults,
      ...clawhubResults,
    ];

    return NextResponse.json({
      success: true,
      data: allResults,
      count: allResults.length,
      query: {
        original: query,
        rewritten: rewrittenQuery,
        intent,
        category,
      },
      sources: {
        clawhub: clawhubResults.length,
        vercel: vercelResults.length,
      },
    });

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to search skills',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
