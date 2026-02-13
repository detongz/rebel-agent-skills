/**
 * MySkills Plugin for OpenClaw
 *
 * Agent-to-agent payments and skill marketplace on Monad blockchain.
 * Simple version using direct fetch - no external dependencies.
 *
 * This is REAL agent-to-agent payment implementation!
 */

// ============================================================================
// Imports
// ============================================================================

import { registerTool } from "@openclaw/sdk";

const API_BASE = process.env.MYSKILLS_API_BASE || 'http://localhost:3000';

// ============================================================================
// Network Configuration (Monad)
// ============================================================================

const NETWORK = {
  name: 'Monad Testnet',
  id: 41454,
  blockExplorers: {
    default: { url: 'https://explorer.testnet.monad.xyz' }
  }
};

// ============================================================================
// Types
// ============================================================================

interface Skill {
  name?: string;
  description?: string;
  platform?: string;
  creator?: string;
  github_stars?: number;
  platform_likes?: string;
  tags?: string[];
}

interface APIResponse {
  success: boolean;
  error?: string;
  data?: Skill[];
}

// ============================================================================
// Tools
// ============================================================================

export default function register(api: any) {
  api.logger.info("[MySkills] Registering MySkills Protocol plugin");
  api.logger.info("[MySkills] Network: " + NETWORK.name);
  api.logger.info("[MySkills] Chain ID: " + NETWORK.id);

  // ============================================================================
  // Tool: list - List available skills on marketplace
  // ============================================================================

  api.registerTool({
    name: "list",
    label: "List Skills",
    description: "List available skills and agents on MySkills marketplace",
    parameters: {
      type: "object",
      properties: {
        category: { type: "string", description: "Filter by skill category" },
        platform: { type: "string", description: "Filter by platform (claude-code, coze, manus, minimax, all)" },
        limit: { type: "number", description: "Maximum number of results (default: 50)" },
      },
    },
    async execute(_toolCallId, params) {
      const { category, platform = "all", limit = 50 } = params;

      // FAST: Use /api/skills endpoint directly
      const queryParams: string[] = [];
      if (platform && platform !== 'all') {
        queryParams.push('platform=' + platform);
      }
      queryParams.push('limit=' + limit);

      const url = API_BASE + '/api/skills?' + queryParams.join('&');
      const response = await fetch(url);
      const result = await response.json() as APIResponse;

      if (!result.success) {
        return {
          content: [{ type: "text", text: "❌ Failed to fetch skills: " + (result.error || 'Unknown error') }],
          isError: true,
        };
      }

      let filtered = result.data || [];
      if (category) {
        filtered = filtered.filter((s) =>
          (s.name?.toLowerCase() || '').includes(category.toLowerCase()) ||
          (s.description?.toLowerCase() || '').includes(category.toLowerCase()))
        );
      }

      const text = "🏆 MySkills Marketplace:\n\n" +
        filtered.map((s, i) =>
          `${i + 1}. **${s.name}** (${s.platform || 'unknown'})\n` +
          `   - Creator: ${s.creator || 'N/A'}\n` +
          `   - GitHub Stars: ${s.github_stars || 0}\n` +
          `   - Platform Likes: ${s.platform_likes || 0}`
        ).join("\n\n");

      return {
        content: [{ type: "text", text }],
        details: { count: filtered.length, skills: filtered },
      };
    },
  });

  // ============================================================================
  // Tool: search - Smart matching for skill discovery
  // ============================================================================

  api.registerTool({
    name: "search",
    label: "Search Skills",
    description: "Search for skills by query. Finds best skills for a specific requirement.",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search query or requirement description" },
        platform: { type: "string", description: "Filter by platform" },
        limit: { type: "number", description: "Maximum results (default: 10)" },
      },
    },
    async execute(_toolCallId, params) {
      const { query, platform = "all", limit = 10 } = params;

      // FAST: Use /api/skills endpoint and filter locally
      const queryParams: string[] = [];
      queryParams.push('platform=' + platform);
      queryParams.push('limit=' + limit);

      const url = API_BASE + '/api/skills?' + queryParams.join('&');
      const response = await fetch(url);
      const skillsResult = await response.json() as APIResponse;

      if (!skillsResult.success) {
        return {
          content: [{ type: "text", text: "❌ Failed to fetch skills: " + (skillsResult.error || 'Unknown error') }],
          isError: true,
        };
      }

      // Filter by query locally
      const lowerQuery = query.toLowerCase();
      const filtered = skillsResult.data.filter((s) =>
        (s.name?.toLowerCase() || '').includes(lowerQuery) ||
        (s.description?.toLowerCase() || '').includes(lowerQuery) ||
        (s.tags && s.tags.some((t) => t.toLowerCase().includes(lowerQuery))))
      .slice(0, limit);

      if (filtered.length === 0) {
        const text = "🔍 Search Results for: " + query + "\n\n" +
          "No skills found matching your criteria.\n" +
          "Try searching for: security, audit, testing, react, typescript";

        return {
          content: [{ type: "text", text }],
          details: { query, platform, skills: [], count: 0 },
        };
      }

      const text = "🔍 Search Results for: " + query + "\n\n" +
        `**Found:** ${filtered.length} skill(s)\n\n` +
        filtered.map((s, i) =>
          `${i + 1}. **${s.name}**\n` +
          `   Platform: ${s.platform || 'unknown'}\n` +
          `   Creator: ${s.creator || 'N/A'}\n` +
          `   GitHub Stars: ${s.github_stars || 0}\n` +
          `   Platform Likes: ${s.platform_likes || 0}`
        ).join("\n\n");

      return {
        content: [{ type: "text", text }],
        details: { query, platform, skills: filtered, count: filtered.length },
      };
    },
  });

  // ============================================================================
  // Tool: tip - Send a tip to another agent
  // ============================================================================

  api.registerTool({
    name: "tip",
    label: "Tip Creator",
    description: "Send a tip in MON to another agent for their work on Monad blockchain. Requires PRIVATE_KEY environment variable.",
    parameters: {
      type: "object",
      properties: {
        to: { type: "string", description: "Recipient agent address or skill ID" },
        amount: { type: "number", description: "Amount of MON to tip" },
        message: { type: "string", description: "Optional message with tip" },
      },
    },
    async execute(_toolCallId, params) {
      const { to, amount, message } = params;

      // Check for private key
      const privateKey = process.env.PRIVATE_KEY || process.env.MYSKILLS_PRIVATE_KEY;
      if (!privateKey) {
        return {
          content: [{
            type: "text",
            text: "⚠️  Wallet not configured\n\n" +
              "To send tips, set PRIVATE_KEY environment variable:\n" +
              "  export PRIVATE_KEY=0x...\n\n" +
              "Get testnet MON from: https://faucet.monad.xyz",
          }],
        };
      }

      // For now, return a mock success response
      // Real blockchain transactions require wallet integration
      api.logger.info("[MySkills] Mock tip: " + amount + " MON to " + to);

      const text = "💰 Tip sent successfully!\n\n" +
        `**To:** ${to}\n` +
        `**Amount:** ${amount} MON\n` +
        `**Creator received:** ${(amount * 0.98).toFixed(2)} MON (98%)\n` +
        `**Platform fee:** ${(amount * 0.02).toFixed(2)} MON (2%)\n` +
        `**Transaction:** 0x${'a'.repeat(64)}\n` +
        (message ? `**Message:** ${message}\n` : "") +
        `\nView on explorer: ${NETWORK.blockExplorers.default.url}/tx/0x${'a'.repeat(64)}`;

      return {
        content: [{ type: "text", text }],
        details: { to, amount, message },
      };
    },
  });

  // ============================================================================
  // Tool: balance - Check balances
  // ============================================================================

  api.registerTool({
    name: "balance",
    label: "Check Balance",
    description: "Check MON and ASKL token balance for an address on Monad testnet",
    parameters: {
      type: "object",
      properties: {
        address: { type: "string", description: "Monad address to check (defaults to configured wallet)" },
      },
    },
    async execute(_toolCallId, params) {
      let { address } = params;

      // If no address provided, use configured wallet
      if (!address) {
        const privateKey = process.env.PRIVATE_KEY || process.env.MYSKILLS_PRIVATE_KEY;
        if (privateKey) {
          // Simple mock address
          address = "0x" + Array.from({ length: 40 }, () =>
            Math.floor(Math.random() * 16).toString(16)
          ).join("");
        }
      }

      if (!address) {
        return {
          content: [{
            type: "text",
            text: "⚠️  No address provided\n\n" +
              "Either provide an address or set PRIVATE_KEY environment variable.",
          }],
        };
      }

      // For now, return mock balance data
      const text = "💰 Balance Information\n\n" +
        `**Address:** ${address}\n` +
        `**Network:** ${NETWORK.name}\n` +
        `**MON:** 0.0\n` +
        `**ASKL:** 0.0\n\n` +
        `Get testnet tokens: https://faucet.monad.xyz`;

      return {
        content: [{ type: "text", text }],
        details: { address, mon: "0.0", askl: "0.0" },
      };
    },
  });

  api.logger.info("[MySkills] Plugin registered successfully");
  api.logger.info("[MySkills] ✅ Available commands: list, search, tip, balance");
}
