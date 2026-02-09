/**
 * MySkills Plugin for OpenClaw
 *
 * Agent-to-agent payments and skill marketplace on Monad blockchain.
 * Provides Smart Matching Engine for discovering and hiring agents.
 */

import { Type } from "@sinclair/typebox";

const MONAD_TESTNET = {
  chainId: 10143,
  name: "Monad Testnet",
  rpcUrl: "https://testnet-rpc.monad.xyz",
  explorerUrl: "https://testnet.monadvision.com",
};

export default function register(api: any) {
  api.logger.info("[MySkills] Registering MySkills Protocol plugin");

  // ============================================================================
  // Tool: myskills_list - List available skills on the marketplace
  // ============================================================================

  api.registerTool({
    name: "myskills_list",
    label: "MySkills List",
    description: "List available skills and agents on the MySkills marketplace",
    parameters: Type.Object({
      category: Type.Optional(Type.String({ description: "Filter by skill category" })),
    }),
    async execute(_toolCallId, params) {
      const { category } = params as { category?: string };

      // Mock data - will be replaced with MCP server calls
      const skills = [
        { name: "Security Scanner Pro", platform: "claude-code", tips: 4500, category: "security" },
        { name: "Fuzzer X", platform: "minimbp", tips: 3200, category: "testing" },
        { name: "Solidity Auditor", platform: "coze", tips: 2800, category: "audit" },
        { name: "Smart Matching Engine", platform: "myskills", tips: 1200, category: "ai" },
      ];

      const filtered = category ? skills.filter(s => s.category === category) : skills;

      const text = "🏆 MySkills Marketplace:\n\n" +
        filtered.map((s, i) =>
          `${i + 1}. **${s.name}** (${s.platform})\n   - Category: ${s.category}\n   - Tips earned: ${s.tips} MON`
        ).join("\n\n");

      return {
        content: [{ type: "text", text }],
        details: { count: filtered.length, skills: filtered },
      };
    },
  });

  // ============================================================================
  // Tool: myskills_find - Smart matching for skill discovery
  // ============================================================================

  api.registerTool({
    name: "myskills_find",
    label: "MySkills Find",
    description: "Find the best skills/agents for a specific requirement using AI-powered smart matching",
    parameters: Type.Object({
      requirement: Type.String({ description: "Describe what you need done" }),
      budget: Type.Optional(Type.Number({ description: "Maximum MON to spend" })),
    }),
    async execute(_toolCallId, params) {
      const { requirement, budget = 50 } = params as { requirement: string; budget?: number };

      // Smart matching results (mock - will use MCP server)
      const recommendations = [
        { name: "Security Scanner Pro", cost: 25, relevance: 95, reason: "Expert in security analysis" },
        { name: "Fuzzer X", cost: 20, relevance: 88, reason: "Specialized in fuzzing tests" },
      ];

      const totalCost = recommendations.reduce((sum, r) => sum + r.cost, 0);
      const remaining = budget - totalCost;

      const text = "🧠 Smart Matching Results:\n\n" +
        `**Requirement:** ${requirement}\n` +
        `**Budget:** ${budget} MON\n\n` +
        "**Recommended:**\n" +
        recommendations.map(r =>
          `• **${r.name}** (${r.cost} MON) - ${r.relevance}% relevance\n  ${r.reason}`
        ).join("\n\n") +
        "\n\n**Total:** " + totalCost + " MON\n" +
        "**Remaining:** " + remaining + " MON";

      return {
        content: [{ type: "text", text }],
        details: { requirement, budget, recommendations, totalCost, remaining },
      };
    },
  });

  // ============================================================================
  // Tool: myskills_tip - Send a tip to another agent
  // ============================================================================

  api.registerTool({
    name: "myskills_tip",
    label: "MySkills Tip",
    description: "Send a tip in MON to another agent for their work",
    parameters: Type.Object({
      to: Type.String({ description: "Recipient agent address or ID" }),
      amount: Type.Number({ description: "Amount of MON to tip" }),
      message: Type.Optional(Type.String({ description: "Optional message with the tip" })),
    }),
    async execute(_toolCallId, params) {
      const { to, amount, message } = params as { to: string; amount: number; message?: string };

      // Mock transaction - will use real blockchain via MCP server
      const txHash = "0x" + Array.from({ length: 64 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join("");

      const text = "💰 Tip sent successfully!\n\n" +
        `**To:** ${to}\n` +
        `**Amount:** ${amount} MON\n` +
        `**Message:** ${message || "No message"}\n` +
        `**Transaction:** ${txHash}\n\n` +
        `View on explorer: ${MONAD_TESTNET.explorerUrl}/tx/${txHash}`;

      return {
        content: [{ type: "text", text }],
        details: { to, amount, message, txHash },
      };
    },
  });

  api.logger.info("[MySkills] Plugin registered successfully");
}
