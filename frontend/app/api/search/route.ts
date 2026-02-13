/**
 * API Route: /api/search
 *
 * GET: Search for agent skills using find-skills intent recognition
 *
 * Flow:
 * 1. Use find-skills logic to understand user intent
 * 2. Rewrite query for better search results
 * 3. Return cached results or search (with caching)
 *
 * With 5-minute caching to avoid slow external API calls
 */

import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory cache
const searchCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

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

// Seed skills for fallback (from skills route)
const SEED_SKILLS = [
  { name: 'React Query', description: 'Powerful data synchronization library', platform: 'claude-code', github_stars: 42000 },
  { name: 'Zod', description: 'TypeScript-first schema validation', platform: 'claude-code', github_stars: 8000 },
  { name: 'Prisma', description: 'Next-generation ORM', platform: 'manus', github_stars: 38000 },
  { name: 'Claude Code Copilot', description: 'AI-powered code assistant', platform: 'claude-code', github_stars: 1585 },
  { name: 'Vercel AI SDK', description: 'AI SDK for multiple providers', platform: 'claude-code', github_stars: 21528 },
  { name: 'Anthropic TypeScript SDK', description: 'Official TypeScript SDK', platform: 'claude-code', github_stars: 1585 },
  { name: 'Coze AI Writer', description: 'Professional AI writing assistant', platform: 'coze', github_stars: 0 },
  { name: 'Solidity Vulnerability Scanner', description: 'AI-powered static analysis', platform: 'claude-code', github_stars: 87 },
  { name: 'DeFi Arbitrage Scanner', description: 'Real-time arbitrage detection', platform: 'claude-code', github_stars: 156 },
];

/**
 * Intent recognition and query rewriting
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
  let rewrittenQuery = query.trim();

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
 * Local search from seed data (FAST)
 */
function localSearch(query: string): SkillResult[] {
  const lowerQuery = query.toLowerCase();
  return SEED_SKILLS
    .filter(skill =>
      skill.name.toLowerCase().includes(lowerQuery) ||
      skill.description.toLowerCase().includes(lowerQuery) ||
      skill.platform.toLowerCase().includes(lowerQuery)
    )
    .map(skill => ({
      name: skill.name,
      description: skill.description,
      platform: skill.platform,
      source: 'local' as const,
      installCommand: `npx skills add ${skill.name}`,
      repository: skill.name.toLowerCase().replace(/\s+/g, '-'),
    }));
}

// GET - Search for skills with caching
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const platform = searchParams.get('platform') || 'all';
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!query) {
      return NextResponse.json(
        { success: false, error: 'Missing query parameter: q' },
        { status: 400 }
      );
    }

    // Check cache
    const cacheKey = `${query}:${platform}:${limit}`;
    const cached = searchCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log('✅ Cache hit for:', query);
      return NextResponse.json(cached.data, {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
        },
      });
    }

    // Step 1: Analyze intent and rewrite query
    const { intent, rewrittenQuery, category } = analyzeIntent(query);

    // Step 2: Use FAST local search only (skip slow external APIs)
    const results = localSearch(rewrittenQuery);

    // Apply platform filter
    let filteredResults = results;
    if (platform !== 'all') {
      filteredResults = results.filter(r => r.platform === platform);
    }

    // Apply limit
    filteredResults = filteredResults.slice(0, limit);

    const responseData: SearchResponse = {
      success: true,
      data: filteredResults,
      count: filteredResults.length,
      query: {
        original: query,
        rewritten: rewrittenQuery,
        intent,
      },
      sources: {
        clawhub: 0,
        vercel: 0,
      },
    };

    // Cache the result
    searchCache.set(cacheKey, {
      data: responseData,
      timestamp: Date.now(),
    });

    return NextResponse.json(responseData, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
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
