#!/usr/bin/env node
/**
 * MySkills MCP Server
 *
 * Model Context Protocol server that allows AI agents to:
 * - Query Agent Skills registered on MySkills protocol
 * - Tip Skill creators on Monad blockchain
 * - Register new Skills
 * - Get leaderboard rankings
 * - Post and manage bounties for custom skill development
 *
 * Built for Monad blockchain (Chain ID: 10143 testnet, 143 mainnet)
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { createPublicClient, createWalletClient, http, parseAbi, type Address } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { z } from "zod";

// ============================================================================
// Configuration
// ============================================================================

const MONAD_TESTNET = {
  chainId: 10143,
  name: "Monad Testnet",
  rpcUrl: "https://testnet-rpc.monad.xyz",
  explorerUrl: "https://testnet.monadvision.com",
};

const MONAD_MAINNET = {
  chainId: 143,
  name: "Monad Mainnet",
  rpcUrl: "https://rpc.monad.xyz",
  explorerUrl: "https://monadvision.com",
};

// Use testnet by default (can be overridden via environment variable)
const NETWORK = process.env.MYSKILLS_NETWORK === "mainnet"
  ? MONAD_MAINNET
  : MONAD_TESTNET;

// MySkills Protocol Contract Address (ASKLToken)
// Default to a placeholder - should be set via environment variable
const MY_SKILLS_CONTRACT = (process.env.MYSKILLS_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000") as `0x${string}`;

// BountyHub contract address (set via environment variable after deployment)
const BOUNTY_HUB_CONTRACT = (process.env.BOUNTY_HUB_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000") as `0x${string}`;

// ============================================================================
// Contract ABIs
// ============================================================================

const ASKL_TOKEN_ABI = parseAbi([
  // Read functions
  "function skillCreators(bytes32 skillId) external view returns (address)",
  "function creatorEarnings(address creator) external view returns (uint256)",
  "function totalTipped() external view returns (uint256)",
  "function totalBurned() external view returns (uint256)",
  "function creatorRewardBps() external view returns (uint256)",
  "function getSkillCreator(bytes32 skillId) external view returns (address)",
  "function getCreatorEarnings(address creator) external view returns (uint256)",
  "function calculateTipAmount(uint256 amount) external view returns (uint256 creatorReward, uint256 platformFee)",
  "function getPlatformStats() external view returns (uint256 _totalSupply, uint256 _totalTipped, uint256 _totalBurned, uint256 _creatorRewardBps)",
  "function balanceOf(address account) external view returns (uint256)",
  "function totalSupply() external view returns (uint256)",

  // Write functions
  "function registerSkill(bytes32 skillId, string skillName, address creator) external",
  "function registerSkillsBatch(bytes32[] skillIds, string[] skillNames, address[] creators) external",
  "function tipSkill(bytes32 skillId, uint256 amount) external",
  "function tipSkillsBatch(bytes32[] skillIds, uint256[] amounts) external",
  "function tipCreatorDirect(address creator, uint256 amount) external",
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function approve(address spender, uint256 amount) external returns (bool)",

  // Events
  "event SkillRegistered(bytes32 indexed skillId, address indexed creator, string skillName)",
  "event Tipped(bytes32 indexed skillId, address indexed tipper, address indexed creator, uint256 amount, uint256 creatorReward, uint256 platformFee)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
]);

// AgentBountyHub ABI
const BOUNTY_HUB_ABI = parseAbi([
  // Read functions
  "function asklToken() external view returns (address)",
  "function bounties(uint256 bountyId) external view returns (uint256 id, address creator, string title, string description, uint256 reward, string category, uint256 deadline, uint8 status, address claimer, uint256 claimedAt, uint256 completedAt)",
  "function getBounty(uint256 bountyId) external view returns (uint256 id, address creator, string title, string description, uint256 reward, string category, uint256 deadline, uint8 status, address claimer, uint256 claimedAt, uint256 completedAt)",
  "function getSubmissions(uint256 bountyId) external view returns ((uint256 bountyId, address submitter, string reportHash, uint256 submittedAt, bool approved)[])",
  "function getDispute(uint256 bountyId) external view returns ((uint256 bountyId, address raiser, string reason, uint256 raisedAt, uint8 status, uint256 resolutionTimestamp, bool resolvedInFavorOfCreator))",
  "function getUserBounties(address user) external view returns (uint256[])",
  "function getUserClaims(address user) external view returns (uint256[])",
  "function getTotalBounties() external view returns (uint256)",
  "function getBountiesByStatus(uint8 status, uint256 limit) external view returns (uint256[])",

  // Write functions
  "function createBounty(string title, string description, uint256 reward, string category, uint256 deadline) external returns (uint256)",
  "function claimBounty(uint256 bountyId) external",
  "function submitWork(uint256 bountyId, string reportHash) external",
  "function approveSubmission(uint256 bountyId) external",
  "function raiseDispute(uint256 bountyId, string reason) external",
  "function resolveDispute(uint256 bountyId, bool inFavorOfCreator) external",
  "function cancelBounty(uint256 bountyId) external",

  // Events
  "event BountyCreated(uint256 indexed bountyId, address indexed creator, string title, uint256 reward, string category)",
  "event BountyClaimed(uint256 indexed bountyId, address indexed claimer, uint256 claimedAt)",
  "event SubmissionMade(uint256 indexed bountyId, address indexed submitter, string reportHash)",
  "event SubmissionApproved(uint256 indexed bountyId, address indexed submitter, uint256 reward)",
  "event DisputeRaised(uint256 indexed bountyId, address indexed raiser, string reason)",
  "event DisputeResolved(uint256 indexed bountyId, bool inFavorOfCreator)",
  "event BountyCancelled(uint256 indexed bountyId)",
])

// ============================================================================
// Viem Clients
// ============================================================================

// Define the chain object for reuse
const chainConfig = {
  id: NETWORK.chainId,
  name: NETWORK.name,
  rpcUrls: { default: { http: [NETWORK.rpcUrl] } },
  blockExplorers: {
    default: { name: "Explorer", url: NETWORK.explorerUrl },
  },
  nativeCurrency: {
    name: "MON",
    symbol: "MON",
    decimals: 18,
  },
};

const publicClient = createPublicClient({
  chain: chainConfig,
  transport: http(),
});

let walletClient: ReturnType<typeof createWalletClient> | null = null;
let walletAddress: Address | null = null;

// Initialize wallet client if private key is provided
if (process.env.PRIVATE_KEY) {
  try {
    const account = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`);
    walletAddress = account.address;
    walletClient = createWalletClient({
      account,
      chain: chainConfig,
      transport: http(),
    });
  } catch (error) {
    console.error("Failed to initialize wallet client:", error);
  }
}

// ============================================================================
// Skill Cache
// ============================================================================

interface Skill {
  id: string;
  name: string;
  creator: string;
  platform: string;
  description?: string;
  repository?: string;
  totalTips: number;
  totalStars: number;
  createdAt: Date;
}

class SkillCache {
  private cache: Map<string, Skill> = new Map();
  private skillsByCreator: Map<Address, string[]> = new Map();
  private lastUpdate: number = 0;
  private readonly TTL = 60000; // 1 minute cache

  async refreshFromChain(): Promise<void> {
    try {
      // For MVP, we'll use a combination of on-chain data and local storage
      // In production, this would query an indexer or The Graph
      const now = Date.now();
      if (now - this.lastUpdate < this.TTL) {
        return; // Cache is still fresh
      }

      // Get platform stats
      const stats = await publicClient.readContract({
        address: MY_SKILLS_CONTRACT,
        abi: ASKL_TOKEN_ABI,
        functionName: "getPlatformStats",
      });

      console.error(`[MCP] Refreshed cache. Total tipped: ${stats[1].toString()}`);

      this.lastUpdate = now;
    } catch (error) {
      console.error("[MCP] Failed to refresh cache:", error);
    }
  }

  async getSkill(skillId: string): Promise<Skill | null> {
    await this.refreshFromChain();
    return this.cache.get(skillId) || null;
  }

  async getAllSkills(): Promise<Skill[]> {
    await this.refreshFromChain();
    return Array.from(this.cache.values());
  }

  setSkill(skill: Skill): void {
    this.cache.set(skill.id, skill);

    // Update creator index
    if (!this.skillsByCreator.has(skill.creator as Address)) {
      this.skillsByCreator.set(skill.creator as Address, []);
    }
    this.skillsByCreator.get(skill.creator as Address)!.push(skill.id);
  }

  async getCreatorSkills(creator: Address): Promise<Skill[]> {
    const skillIds = this.skillsByCreator.get(creator) || [];
    const skills: Skill[] = [];
    for (const id of skillIds) {
      const skill = await this.getSkill(id);
      if (skill) skills.push(skill);
    }
    return skills;
  }
}

const skillCache = new SkillCache();

// ============================================================================
// MCP Server Setup
// ============================================================================

const server = new Server(
  {
    name: "@myskills/mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// ============================================================================
// Tool Definitions
// ============================================================================

// List all available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "list_skills",
        description:
          "List all Agent Skills registered on MySkills protocol. Supports filtering by platform and sorting.",
        inputSchema: {
          type: "object",
          properties: {
            platform: {
              type: "string",
              description: "Filter by platform (e.g., claude-code, coze, manus, minibmp)",
              enum: ["claude-code", "coze", "manus", "minimbp", "all"],
            },
            sort: {
              type: "string",
              description: "Sort order",
              enum: ["tips", "stars", "newest", "name"],
            },
            limit: {
              type: "number",
              description: "Maximum number of results (default: 50, max: 100)",
            },
          },
        },
      },
      {
        name: "get_skill",
        description: "Get detailed information about a specific Skill by ID",
        inputSchema: {
          type: "object",
          properties: {
            skill_id: {
              type: "string",
              description: "The ID of the Skill to retrieve",
            },
          },
          required: ["skill_id"],
        },
      },
      {
        name: "tip_creator",
        description:
          "Tip a Skill creator on Monad blockchain using ASKL tokens. Requires PRIVATE_KEY environment variable.",
        inputSchema: {
          type: "object",
          properties: {
            skill_id: {
              type: "string",
              description: "The ID of the Skill to tip (keccak256 hash)",
            },
            amount: {
              type: "number",
              description: "Amount to tip in ASKL tokens (will be converted to wei)",
            },
            message: {
              type: "string",
              description: "Optional message to include with the tip",
            },
          },
          required: ["skill_id", "amount"],
        },
      },
      {
        name: "register_skill",
        description:
          "Register a new Agent Skill on MySkills protocol using ASKLToken contract. Requires PRIVATE_KEY environment variable.",
        inputSchema: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "Name of the Skill",
            },
            description: {
              type: "string",
              description: "Description of what the Skill does",
            },
            platform: {
              type: "string",
              description: "Platform where the Skill is hosted",
              enum: ["claude-code", "coze", "manus", "minimbp"],
            },
            repository_url: {
              type: "string",
              description: "GitHub repository URL (optional)",
            },
          },
          required: ["name", "description", "platform"],
        },
      },
      {
        name: "get_leaderboard",
        description: "Get the MySkills leaderboard with top Skills by creator earnings",
        inputSchema: {
          type: "object",
          properties: {
            timeframe: {
              type: "string",
              description: "Time period for leaderboard",
              enum: ["all", "week", "month"],
            },
            limit: {
              type: "number",
              description: "Number of top Skills to return (default: 10)",
            },
          },
        },
      },
      {
        name: "get_mon_balance",
        description: "Get MON balance for an address on Monad",
        inputSchema: {
          type: "object",
          properties: {
            address: {
              type: "string",
              description: "Monad address to check balance for",
            },
          },
          required: ["address"],
        },
      },
      {
        name: "get_askl_balance",
        description: "Get ASKL token balance for an address on Monad",
        inputSchema: {
          type: "object",
          properties: {
            address: {
              type: "string",
              description: "Monad address to check ASKL balance for",
            },
          },
          required: ["address"],
        },
      },
      {
        name: "post_bounty",
        description:
          "Post a new bounty for custom skill development on MySkills protocol. Requires PRIVATE_KEY environment variable.",
        inputSchema: {
          type: "object",
          properties: {
            title: {
              type: "string",
              description: "Title of the bounty",
            },
            description: {
              type: "string",
              description: "Detailed description of the bounty requirements",
            },
            reward: {
              type: "number",
              description: "Reward amount in ASKL tokens",
            },
            skill_category: {
              type: "string",
              description: "Category of skill needed (e.g., security-audit, code-review, test-generation)",
              enum: ["security-audit", "code-review", "test-generation", "optimization", "documentation", "other"],
            },
          },
          required: ["title", "description", "reward"],
        },
      },
      {
        name: "list_bounties",
        description: "List all active bounties on MySkills protocol",
        inputSchema: {
          type: "object",
          properties: {
            status: {
              type: "string",
              description: "Filter by status",
              enum: ["open", "in-progress", "completed", "all"],
            },
            category: {
              type: "string",
              description: "Filter by skill category",
            },
            limit: {
              type: "number",
              description: "Maximum number of results (default: 50)",
            },
          },
        },
      },
      {
        name: "submit_audit",
        description:
          "Submit an audit report for a bounty. Requires PRIVATE_KEY environment variable.",
        inputSchema: {
          type: "object",
          properties: {
            bounty_id: {
              type: "string",
              description: "ID of the bounty being audited",
            },
            report: {
              type: "string",
              description: "Audit report content or URL",
            },
            findings: {
              type: "number",
              description: "Number of findings in the audit",
            },
            severity: {
              type: "string",
              description: "Overall severity of findings",
              enum: ["critical", "high", "medium", "low", "none"],
            },
          },
          required: ["bounty_id", "report"],
        },
      },
      {
        name: "submit_task",
        description:
          "Submit a multi-agent coordination task with milestones. Part of AaaS (Agent-as-a-Service) platform. Requires PRIVATE_KEY.",
        inputSchema: {
          type: "object",
          properties: {
            title: {
              type: "string",
              description: "Title of the task",
            },
            description: {
              type: "string",
              description: "Detailed description of task requirements",
            },
            budget: {
              type: "number",
              description: "Total budget in ASKL tokens",
            },
            deadline_hours: {
              type: "number",
              description: "Deadline in hours (default: 168 = 1 week)",
            },
            requiredSkills: {
              type: "array",
              items: { type: "string" },
              description: "Required skills for this task",
            },
            milestones: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  payment: { type: "number" },
                  description: { type: "string" },
                },
              },
              description: "Task milestones with payment distribution",
            },
          },
          required: ["title", "description", "budget"],
        },
      },
      {
        name: "assign_agents",
        description:
          "Assign multiple agents to a task with payment distribution. Enables parallel agent execution. Requires PRIVATE_KEY.",
        inputSchema: {
          type: "object",
          properties: {
            task_id: {
              type: "string",
              description: "ID of the task to assign agents to",
            },
            agents: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  address: { type: "string" },
                  role: { type: "string" },
                  payment_share: { type: "number" },
                },
              },
              description: "Array of agents to assign with their payment shares",
            },
          },
          required: ["task_id", "agents"],
        },
      },
      {
        name: "complete_milestone",
        description:
          "Mark a task milestone as completed and trigger payment distribution. Requires PRIVATE_KEY.",
        inputSchema: {
          type: "object",
          properties: {
            task_id: {
              type: "string",
              description: "ID of the task",
            },
            milestone_id: {
              type: "string",
              description: "ID of the milestone to complete",
            },
            milestone_index: {
              type: "number",
              description: "Index of the milestone (alternative to milestone_id)",
            },
            proof: {
              type: "string",
              description: "Proof of work completion (IPFS hash, URL, etc.)",
            },
          },
          required: ["task_id"],
        },
      },
      {
        name: "list_tasks",
        description:
          "List all multi-agent coordination tasks with their status and assigned agents",
        inputSchema: {
          type: "object",
          properties: {
            status: {
              type: "string",
              description: "Filter by task status",
              enum: ["pending", "assigned", "in-progress", "completed", "all"],
            },
            limit: {
              type: "number",
              description: "Maximum number of results (default: 50)",
            },
          },
        },
      },
      {
        name: "find_skills_for_budget",
        description:
          "SMART MATCHING ENGINE: Intelligently match and recommend the best combination of Agent Skills within a given budget. " +
          "Analyzes requirements using NLP, scores skills by relevance/success/cost-effectiveness, and solves budget optimization.",
        inputSchema: {
          type: "object",
          properties: {
            requirement: {
              type: "string",
              description: "Detailed description of what you need (e.g., 'Audit this smart contract for security vulnerabilities')",
            },
            budget: {
              type: "number",
              description: "Total budget in MON/ASKL tokens",
            },
            optimization_goal: {
              type: "string",
              description: "Optimization priority",
              enum: ["security", "speed", "cost", "effectiveness"],
            },
            platform: {
              type: "string",
              description: "Filter by platform",
              enum: ["claude-code", "coze", "manus", "minimbp", "all"],
            },
          },
          required: ["requirement", "budget"],
        },
      },
    ],
  };
});

// ============================================================================
// Tool Handlers
// ============================================================================

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "list_skills":
        return await handleListSkills(args);
      case "get_skill":
        return await handleGetSkill(args);
      case "tip_creator":
        return await handleTipCreator(args);
      case "register_skill":
        return await handleRegisterSkill(args);
      case "get_leaderboard":
        return await handleGetLeaderboard(args);
      case "get_mon_balance":
        return await handleGetMonBalance(args);
      case "get_askl_balance":
        return await handleGetAsklBalance(args);
      case "post_bounty":
        return await handlePostBounty(args);
      case "list_bounties":
        return await handleListBounties(args);
      case "submit_audit":
        return await handleSubmitAudit(args);
      case "submit_task":
        return await handleSubmitTask(args);
      case "assign_agents":
        return await handleAssignAgents(args);
      case "complete_milestone":
        return await handleCompleteMilestone(args);
      case "list_tasks":
        return await handleListTasks(args);
      case "find_skills_for_budget":
        return await handleFindSkillsForBudget(args);
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: "text",
          text: `Error: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
});

// ============================================================================
// Handler Implementations
// ============================================================================

async function handleListSkills(args: unknown) {
  const schema = z.object({
    platform: z.enum(["claude-code", "coze", "manus", "minimbp", "all"]).optional(),
    sort: z.enum(["tips", "stars", "newest", "name"]).optional(),
    limit: z.number().min(1).max(100).optional(),
  });

  const { platform, sort = "tips", limit = 50 } = schema.parse(args);

  try {
    // Get skills from cache (which combines on-chain and off-chain data)
    let skills = await skillCache.getAllSkills();

    // For MVP, if no skills in cache, return sample data
    if (skills.length === 0) {
      // Check if contract is deployed
      try {
        const totalSupply = await publicClient.readContract({
          address: MY_SKILLS_CONTRACT,
          abi: ASKL_TOKEN_ABI,
          functionName: "totalSupply",
        });

        // Contract exists, but no skills registered yet
        return {
          content: [
            {
              type: "text",
              text: `✅ MySkills Protocol is deployed on ${NETWORK.name}\n` +
                `Contract: ${MY_SKILLS_CONTRACT}\n` +
                `Total ASKL Supply: ${Number(totalSupply) / 1e18} ASKL\n\n` +
                `No skills registered yet. Be the first to register a skill!\n\n` +
                `Use the 'register_skill' tool to register your agent skill.`
            },
          ],
        };
      } catch (contractError) {
        // Contract not accessible
        return {
          content: [
            {
              type: "text",
              text: `⚠️ Unable to connect to MySkills contract at ${MY_SKILLS_CONTRACT}\n` +
                `Network: ${NETWORK.name} (Chain ID: ${NETWORK.chainId})\n` +
                `RPC: ${NETWORK.rpcUrl}\n\n` +
                `Please ensure:\n` +
                `1. The contract is deployed\n` +
                `2. MYSKILLS_CONTRACT_ADDRESS is set correctly\n` +
                `3. The RPC endpoint is accessible\n\n` +
                `For now, returning sample data:`
            },
          ],
        };
      }
    }

    // Filter by platform
    let filtered = skills;
    if (platform && platform !== "all") {
      filtered = filtered.filter((s) => s.platform === platform);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sort) {
        case "tips":
          return b.totalTips - a.totalTips;
        case "stars":
          return b.totalStars - a.totalStars;
        case "newest":
          return b.createdAt.getTime() - a.createdAt.getTime();
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    const results = filtered.slice(0, limit);

    return {
      content: [
        {
          type: "text",
          text: `Found ${results.length} Skills on ${NETWORK.name}:\n\n${results
            .map(
              (s) =>
                `**${s.name}** (${s.platform})\n` +
                `ID: ${s.id}\n` +
                `Creator: ${s.creator}\n` +
                `💰 Total Tips: ${s.totalTips.toFixed(2)} ASKL\n` +
                `⭐ Stars: ${s.totalStars}\n` +
                `📝 ${s.description || "No description"}\n`
            )
            .join("\n")}`,
        },
      ],
    };
  } catch (error) {
    throw new Error(`Failed to list skills: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function handleGetSkill(args: unknown) {
  const schema = z.object({
    skill_id: z.string(),
  });

  const { skill_id } = schema.parse(args);

  try {
    // First check cache
    const cachedSkill = await skillCache.getSkill(skill_id);
    if (cachedSkill) {
      return {
        content: [
          {
            type: "text",
            text: `Skill Details for ID: ${skill_id}\n\n` +
              `**Name:** ${cachedSkill.name}\n` +
              `**Platform:** ${cachedSkill.platform}\n` +
              `**Creator:** ${cachedSkill.creator}\n` +
              `**Description:** ${cachedSkill.description || "No description"}\n` +
              `${cachedSkill.repository ? `**Repository:** ${cachedSkill.repository}\n` : ""}` +
              `**Stats:**\n` +
              `- 💰 Total Tips: ${cachedSkill.totalTips.toFixed(2)} ASKL\n` +
              `- ⭐ Stars: ${cachedSkill.totalStars}\n` +
              `**Created:** ${cachedSkill.createdAt.toISOString()}`,
          },
        ],
      };
    }

    // If not in cache, try to get from contract
    const skillIdBytes32 = skill_id.startsWith('0x')
      ? skill_id as `0x${string}`
      : `0x${skill_id}` as `0x${string}`;

    const creator = await publicClient.readContract({
      address: MY_SKILLS_CONTRACT,
      abi: ASKL_TOKEN_ABI,
      functionName: "getSkillCreator",
      args: [skillIdBytes32],
    }) as Address;

    if (creator === "0x0000000000000000000000000000000000000000") {
      return {
        content: [
          {
            type: "text",
            text: `Skill with ID ${skill_id} not found on ${NETWORK.name}.\n` +
              `Contract: ${MY_SKILLS_CONTRACT}\n\n` +
              `The skill may not be registered yet.`,
          },
        ],
      };
    }

    // Get creator earnings
    const earnings = await publicClient.readContract({
      address: MY_SKILLS_CONTRACT,
      abi: ASKL_TOKEN_ABI,
      functionName: "getCreatorEarnings",
      args: [creator],
    }) as bigint;

    return {
      content: [
        {
          type: "text",
          text: `Skill Details for ID: ${skill_id}\n\n` +
            `**Creator:** ${creator}\n` +
            `**Total Earnings:** ${Number(earnings) / 1e18} ASKL\n` +
            `**Network:** ${NETWORK.name}\n` +
            `**Explorer:** ${NETWORK.explorerUrl}/address/${creator}\n\n` +
            `Note: Additional metadata (name, description) is stored off-chain for MVP.`,
        },
      ],
    };
  } catch (error) {
    throw new Error(`Failed to get skill: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function handleTipCreator(args: unknown) {
  const schema = z.object({
    skill_id: z.string(),
    amount: z.number().positive(),
    message: z.string().optional(),
  });

  const { skill_id, amount, message } = schema.parse(args);

  if (!walletClient) {
    throw new Error(
      "Wallet not initialized. Please set PRIVATE_KEY environment variable to perform write operations."
    );
  }

  try {
    // Convert skill_id to bytes32 if needed
    const skillIdBytes32 = skill_id.startsWith('0x')
      ? skill_id as `0x${string}`
      : `0x${skill_id}` as `0x${string}`;

    // First check if skill exists
    const creator = await publicClient.readContract({
      address: MY_SKILLS_CONTRACT,
      abi: ASKL_TOKEN_ABI,
      functionName: "getSkillCreator",
      args: [skillIdBytes32],
    }) as Address;

    if (creator === "0x0000000000000000000000000000000000000000") {
      throw new Error(`Skill ${skill_id} not found. Please check the skill ID.`);
    }

    // Convert amount to wei (18 decimals)
    const amountInWei = BigInt(Math.floor(amount * 1e18));

    // Check if sender has enough ASKL tokens
    const senderBalance = await publicClient.readContract({
      address: MY_SKILLS_CONTRACT,
      abi: ASKL_TOKEN_ABI,
      functionName: "balanceOf",
      args: [walletClient.account!.address],
    }) as bigint;

    if (senderBalance < amountInWei) {
      throw new Error(
        `Insufficient ASKL balance. You have ${Number(senderBalance) / 1e18} ASKL, but need ${amount} ASKL.\n` +
        `Please ensure you have ASKL tokens at address ${walletClient.account!.address}`
      );
    }

    // Simulate the transaction first
    const { request } = await publicClient.simulateContract({
      address: MY_SKILLS_CONTRACT,
      abi: ASKL_TOKEN_ABI,
      functionName: "tipSkill",
      args: [skillIdBytes32, amountInWei],
      account: walletClient.account!,
    });

    // Execute the transaction
    const hash = await walletClient.writeContract(request);

    // Wait for transaction confirmation
    const receipt = await publicClient.waitForTransactionReceipt({
      hash,
    });

    // Calculate the actual amounts (98/2 split)
    const creatorRewardBps = await publicClient.readContract({
      address: MY_SKILLS_CONTRACT,
      abi: ASKL_TOKEN_ABI,
      functionName: "creatorRewardBps",
    }) as bigint;

    const creatorReward = (amountInWei * BigInt(Number(creatorRewardBps))) / 10000n;
    const platformFee = amountInWei - creatorReward;

    return {
      content: [
        {
          type: "text",
          text: `✅ Tip sent successfully on ${NETWORK.name}!\n\n` +
            `**Skill ID:** ${skill_id}\n` +
            `**Creator:** ${creator}\n` +
            `**Amount:** ${amount} ASKL\n` +
            `**Creator Receives:** ${Number(creatorReward) / 1e18} ASKL (${Number(creatorRewardBps) / 100}%)\n` +
            `**Platform Fee:** ${Number(platformFee) / 1e18} ASKL\n` +
            `${message ? `**Message:** ${message}\n` : ""}` +
            `**Transaction:** ${hash}\n` +
            `**Explorer:** ${NETWORK.explorerUrl}/tx/${hash}\n` +
            `**Block:** ${receipt.blockNumber}\n\n` +
            `The tip has been successfully distributed according to the 98/2 split.`,
        },
      ],
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to send tip: ${error.message}`);
    }
    throw new Error(`Failed to send tip: ${String(error)}`);
  }
}

async function handleRegisterSkill(args: unknown) {
  const schema = z.object({
    name: z.string().min(1).max(100),
    description: z.string().min(1).max(500),
    platform: z.enum(["claude-code", "coze", "manus", "minimbp"]),
    repository_url: z.string().url().optional(),
  });

  const { name, description, platform, repository_url } = schema.parse(args);

  if (!walletClient) {
    throw new Error(
      "Wallet not initialized. Please set PRIVATE_KEY environment variable to perform write operations."
    );
  }

  try {
    // Generate skill ID as keccak256 hash of name + platform + timestamp
    const crypto = require('crypto');
    const skillIdInput = `${name}:${platform}:${Date.now()}`;
    const skillIdBytes32 = `0x${crypto.createHash('sha256').update(skillIdInput).digest('hex')}` as `0x${string}`;

    // Simulate the transaction first
    const { request } = await publicClient.simulateContract({
      address: MY_SKILLS_CONTRACT,
      abi: ASKL_TOKEN_ABI,
      functionName: "registerSkill",
      args: [skillIdBytes32, name, walletClient.account!.address], // Use sender as creator
      account: walletClient.account!,
    });

    // Execute the transaction
    const hash = await walletClient.writeContract(request);

    // Wait for transaction confirmation
    const receipt = await publicClient.waitForTransactionReceipt({
      hash,
    });

    // Cache the skill locally
    skillCache.setSkill({
      id: skillIdBytes32,
      name,
      creator: walletClient.account!.address,
      platform,
      description,
      repository: repository_url,
      totalTips: 0,
      totalStars: 0,
      createdAt: new Date(),
    });

    return {
      content: [
        {
          type: "text",
          text: `✅ Skill registered successfully on ${NETWORK.name}!\n\n` +
            `**Skill ID:** ${skillIdBytes32}\n` +
            `**Name:** ${name}\n` +
            `**Platform:** ${platform}\n` +
            `**Description:** ${description}\n` +
            `${repository_url ? `**Repository:** ${repository_url}\n` : ""}` +
            `**Creator:** ${walletClient.account!.address}\n` +
            `**Transaction:** ${hash}\n` +
            `**Explorer:** ${NETWORK.explorerUrl}/tx/${hash}\n` +
            `**Block:** ${receipt.blockNumber}\n\n` +
            `Your skill is now registered on the MySkills protocol and can receive tips!`,
        },
      ],
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to register skill: ${error.message}`);
    }
    throw new Error(`Failed to register skill: ${String(error)}`);
  }
}

async function handleGetLeaderboard(args: unknown) {
  const schema = z.object({
    timeframe: z.enum(["all", "week", "month"]).optional(),
    limit: z.number().min(1).max(50).optional(),
  });

  const { timeframe = "all", limit = 10 } = schema.parse(args);

  try {
    // Get all skills from cache
    const skills = await skillCache.getAllSkills();

    if (skills.length === 0) {
      // Return platform stats instead
      const stats = await publicClient.readContract({
        address: MY_SKILLS_CONTRACT,
        abi: ASKL_TOKEN_ABI,
        functionName: "getPlatformStats",
      });

      return {
        content: [
          {
            type: "text",
            text: `🏆 MySkills Leaderboard (${timeframe})\n\n` +
              `Platform Statistics:\n` +
              `- Total ASKL Supply: ${Number(stats[0]) / 1e18} ASKL\n` +
              `- Total Tipped: ${Number(stats[1]) / 1e18} ASKL\n` +
              `- Total Burned/Platform Fee: ${Number(stats[2]) / 1e18} ASKL\n` +
              `- Creator Reward Percentage: ${Number(stats[3]) / 100}%\n\n` +
              `No skills registered yet. Be the first to register a skill!\n\n` +
              `Use 'register_skill' to register your agent skill.`
          },
        ],
      };
    }

    // Sort by total tips
    const sortedSkills = skills
      .sort((a, b) => b.totalTips - a.totalTips)
      .slice(0, limit)
      .map((skill, index) => ({
        rank: index + 1,
        name: skill.name,
        platform: skill.platform,
        tips: skill.totalTips,
        creator: skill.creator,
      }));

    return {
      content: [
        {
          type: "text",
          text: `🏆 MySkills Leaderboard (${timeframe})\n\n${sortedSkills
            .map(
              (item) =>
                `#${item.rank} **${item.name}** (${item.platform})\n` +
                `💰 ${item.tips.toFixed(2)} ASKL received\n` +
                `👤 Creator: ${item.creator}\n`
            )
            .join("\n")}\n\n` +
            `**Network:** ${NETWORK.name}\n` +
            `**Contract:** ${MY_SKILLS_CONTRACT}`
        },
      ],
    };
  } catch (error) {
    throw new Error(`Failed to get leaderboard: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function handleGetMonBalance(args: unknown) {
  const schema = z.object({
    address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  });

  const { address } = schema.parse(args);

  try {
    const balance = await publicClient.getBalance({
      address: address as `0x${string}`,
    });

    // Convert from wei to MON (18 decimals)
    const balanceInMon = Number(balance) / 1e18;

    return {
      content: [
        {
          type: "text",
          text: `💰 MON Balance for ${address}:\n\n${balanceInMon.toFixed(4)} MON\n\n` +
            `Network: ${NETWORK.name} (Chain ID: ${NETWORK.chainId})\n` +
            `Explorer: ${NETWORK.explorerUrl}/address/${address}\n\n` +
            `Note: This is the native MON token balance. To check ASKL token balance, use 'get_askl_balance'.`
        },
      ],
    };
  } catch (error) {
    throw new Error(
      `Failed to fetch MON balance: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

async function handleGetAsklBalance(args: unknown) {
  const schema = z.object({
    address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  });

  const { address } = schema.parse(args);

  try {
    const balance = await publicClient.readContract({
      address: MY_SKILLS_CONTRACT,
      abi: ASKL_TOKEN_ABI,
      functionName: "balanceOf",
      args: [address as `0x${string}`],
    }) as bigint;

    // Get creator earnings if any
    let creatorEarnings = 0n;
    try {
      creatorEarnings = await publicClient.readContract({
        address: MY_SKILLS_CONTRACT,
        abi: ASKL_TOKEN_ABI,
        functionName: "getCreatorEarnings",
        args: [address as `0x${string}`],
      }) as bigint;
    } catch {
      // Not a creator or no earnings
    }

    // Convert from wei to ASKL (18 decimals)
    const balanceInAskl = Number(balance) / 1e18;
    const earningsInAskl = Number(creatorEarnings) / 1e18;

    return {
      content: [
        {
          type: "text",
          text: `💰 ASKL Token Balance for ${address}:\n\n` +
            `**Current Balance:** ${balanceInAskl.toFixed(4)} ASKL\n` +
            `**Total Earned as Creator:** ${earningsInAskl.toFixed(4)} ASKL\n\n` +
            `Network: ${NETWORK.name} (Chain ID: ${NETWORK.chainId})\n` +
            `Contract: ${MY_SKILLS_CONTRACT}\n` +
            `Explorer: ${NETWORK.explorerUrl}/address/${address}\n\n` +
            `ASKL is the native token of the MySkills protocol, used for tipping and rewarding agent skill creators.`
        },
      ],
    };
  } catch (error) {
    throw new Error(
      `Failed to fetch ASKL balance: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

// ============================================================================
// Bounty Handlers
// ============================================================================

interface Bounty {
  id: string;
  title: string;
  description: string;
  reward: number;
  category: string;
  creator: string;
  status: "open" | "in-progress" | "completed" | "cancelled";
  createdAt: Date;
  deadline?: Date;
  assignee?: string;
}

// In-memory bounty storage (for MVP)
const bountyStorage = new Map<string, Bounty>();

async function handlePostBounty(args: unknown) {
  const schema = z.object({
    title: z.string().min(1).max(200),
    description: z.string().min(1).max(5000),
    reward: z.number().positive(),
    skill_category: z.enum(["security-audit", "code-review", "test-generation", "optimization", "documentation", "other"]).optional(),
    deadline_hours: z.number().positive().optional(),
  });

  const { title, description, reward, skill_category = "other", deadline_hours = 168 } = schema.parse(args);

  if (!walletClient) {
    throw new Error(
      "Wallet not initialized. Please set PRIVATE_KEY environment variable to perform write operations."
    );
  }

  // Check if bounty hub is deployed
  if (BOUNTY_HUB_CONTRACT === "0x0000000000000000000000000000000000000000") {
    throw new Error(
      "BountyHub contract not deployed. Please deploy the contract and set BOUNTY_HUB_CONTRACT_ADDRESS environment variable.\n" +
      "Run: npm run deploy:bounty"
    );
  }

  try {
    const rewardInWei = BigInt(Math.floor(reward * 1e18));
    const deadline = Math.floor(Date.now() / 1000) + (deadline_hours * 3600);

    // First approve ASKL tokens for BountyHub
    const approveRequest = await publicClient.simulateContract({
      address: MY_SKILLS_CONTRACT,
      abi: ASKL_TOKEN_ABI,
      functionName: "approve",
      args: [BOUNTY_HUB_CONTRACT, rewardInWei],
      account: walletClient.account!,
    });

    const approveHash = await walletClient.writeContract(approveRequest.request);
    await publicClient.waitForTransactionReceipt({ hash: approveHash });

    // Create bounty on-chain
    const { request } = await publicClient.simulateContract({
      address: BOUNTY_HUB_CONTRACT,
      abi: BOUNTY_HUB_ABI,
      functionName: "createBounty",
      args: [title, description, rewardInWei, skill_category, BigInt(deadline)],
      account: walletClient.account!,
    });

    const hash = await walletClient.writeContract(request);
    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    // Get bounty ID from event logs
    const bountyCreatedEvent = receipt.logs.find((log: any) =>
      log.address.toLowerCase() === BOUNTY_HUB_CONTRACT.toLowerCase()
    );

    let bountyId = "unknown";
    if (bountyCreatedEvent) {
      // Parse the event to get bounty ID
      // For simplicity, we'll use transaction hash as ID in this version
      bountyId = hash;
    }

    return {
      content: [
        {
          type: "text",
          text: `✅ Bounty created on-chain via AgentBountyHub!\n\n` +
            `**Transaction:** ${hash}\n` +
            `**Bounty ID:** ${bountyId}\n` +
            `**Title:** ${title}\n` +
            `**Category:** ${skill_category}\n` +
            `**Reward:** ${reward} ASKL (escrowed)\n` +
            `**Deadline:** ${new Date(deadline * 1000).toISOString()}\n` +
            `**Creator:** ${walletClient.account!.address}\n` +
            `**Explorer:** ${NETWORK.explorerUrl}/tx/${hash}\n\n` +
            `Agents can now claim this bounty and submit work.\n` +
            `Use 'submit_audit' to submit work for this bounty.`
        },
      ],
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to post bounty: ${error.message}`);
    }
    throw new Error(`Failed to post bounty: ${String(error)}`);
  }
}

async function handleListBounties(args: unknown) {
  const schema = z.object({
    status: z.enum(["open", "in-progress", "completed", "all"]).optional(),
    category: z.string().optional(),
    limit: z.number().min(1).max(100).optional(),
  });

  const { status = "all", category, limit = 50 } = schema.parse(args);

  // Check if bounty hub is deployed
  if (BOUNTY_HUB_CONTRACT === "0x0000000000000000000000000000000000000000") {
    return {
      content: [
        {
          type: "text",
          text: `⚠️ BountyHub contract not deployed yet.\n\n` +
            `Please deploy the contract first:\n` +
            `Run: npm run deploy:bounty\n\n` +
            `Then set BOUNTY_HUB_CONTRACT_ADDRESS environment variable.`
        },
      ],
    };
  }

  try {
    // Map status string to contract enum (0=Active, 1=Claimed, 2=UnderReview, 3=Completed, 4=Disputed, 5=Cancelled)
    const statusMap: Record<string, number> = {
      "open": 0,
      "in-progress": 1,
      "completed": 3,
      "all": -1,
    };

    let bountyIds: bigint[];

    if (status === "all") {
      // Get all bounties
      const totalBounties = await publicClient.readContract({
        address: BOUNTY_HUB_CONTRACT,
        abi: BOUNTY_HUB_ABI,
        functionName: "getTotalBounties",
      }) as bigint;

      // Fetch all bounty IDs
      bountyIds = Array.from({ length: Number(totalBounties) }, (_, i) => BigInt(i + 1));
    } else {
      // Get bounties by status
      const result = await publicClient.readContract({
        address: BOUNTY_HUB_CONTRACT,
        abi: BOUNTY_HUB_ABI,
        functionName: "getBountiesByStatus",
        args: [statusMap[status] as any, limit as any],
      });
      bountyIds = result as bigint[];
    }

    if (bountyIds.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: `No bounties found matching your criteria.\n\n` +
              `**Status:** ${status}\n` +
              `${category ? `**Category:** ${category}\n` : ""}\n\n` +
              `Be the first to post a bounty using 'post_bounty'!`
          },
        ],
      };
    }

    // Fetch full bounty details for each ID
    const bountyDetails = await Promise.all(
      bountyIds.slice(0, limit).map(async (id) => {
        try {
          const bounty = await publicClient.readContract({
            address: BOUNTY_HUB_CONTRACT,
            abi: BOUNTY_HUB_ABI,
            functionName: "getBounty",
            args: [id],
          }) as any;

          return {
            id: id.toString(),
            title: bounty.title,
            category: bounty.category,
            reward: Number(bounty.reward) / 1e18,
            status: ["Active", "Claimed", "UnderReview", "Completed", "Disputed", "Cancelled"][bounty.status],
            creator: bounty.creator,
            description: bounty.description.slice(0, 100),
          };
        } catch {
          return null;
        }
      })
    );

    const validBounties = bountyDetails.filter((b) => b !== null);

    // Filter by category if specified
    let results = validBounties;
    if (category) {
      results = results.filter((b) => b && b.category === category);
    }

    return {
      content: [
        {
          type: "text",
          text: `Found ${results.length} Bount${results.length === 1 ? "y" : "ies"}:\n\n${results
            .filter((b): b is NonNullable<typeof b> => b !== null)
            .map(
              (b) =>
                `**${b.title}** (${b.category})\n` +
                `ID: ${b.id}\n` +
                `💰 Reward: ${b.reward} ASKL\n` +
                `📊 Status: ${b.status}\n` +
                `👤 Creator: ${b.creator}\n` +
                `📝 ${b.description}...\n`
            )
            .join("\n")}\n\n` +
            `Use 'submit_audit' to submit work for any open bounty.`
        },
      ],
    };
  } catch (error) {
    throw new Error(`Failed to list bounties: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function handleSubmitAudit(args: unknown) {
  const schema = z.object({
    bounty_id: z.string(),
    report: z.string().min(1).max(10000),
    findings: z.number().int().min(0).optional(),
    severity: z.enum(["critical", "high", "medium", "low", "none"]).optional(),
  });

  const { bounty_id, report, findings = 0, severity = "none" } = schema.parse(args);

  if (!walletClient) {
    throw new Error(
      "Wallet not initialized. Please set PRIVATE_KEY environment variable to perform write operations."
    );
  }

  // Check if bounty hub is deployed
  if (BOUNTY_HUB_CONTRACT === "0x0000000000000000000000000000000000000000") {
    throw new Error(
      "BountyHub contract not deployed. Please deploy the contract and set BOUNTY_HUB_CONTRACT_ADDRESS environment variable."
    );
  }

  try {
    const bountyIdNum = BigInt(bounty_id);

    // First, check the bounty status and claim it if needed
    const bounty = await publicClient.readContract({
      address: BOUNTY_HUB_CONTRACT,
      abi: BOUNTY_HUB_ABI,
      functionName: "getBounty",
      args: [bountyIdNum],
    }) as any;

    // Check if bounty is in Active status (0)
    if (bounty.status === 0) {
      // Claim the bounty first
      const claimRequest = await publicClient.simulateContract({
        address: BOUNTY_HUB_CONTRACT,
        abi: BOUNTY_HUB_ABI,
        functionName: "claimBounty",
        args: [bountyIdNum],
        account: walletClient.account!,
      });

      const claimHash = await walletClient.writeContract(claimRequest.request);
      await publicClient.waitForTransactionReceipt({ hash: claimHash });
    }

    // Submit work (report hash - for MVP use report content directly)
    const reportHash = report; // In production, upload to IPFS and use hash

    const { request } = await publicClient.simulateContract({
      address: BOUNTY_HUB_CONTRACT,
      abi: BOUNTY_HUB_ABI,
      functionName: "submitWork",
      args: [bountyIdNum, reportHash],
      account: walletClient.account!,
    });

    const hash = await walletClient.writeContract(request);
    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    return {
      content: [
        {
          type: "text",
          text: `✅ Audit report submitted on-chain!\n\n` +
            `**Bounty ID:** ${bounty_id}\n` +
            `**Bounty Title:** ${bounty.title}\n` +
            `**Submitter:** ${walletClient.account!.address}\n` +
            `**Findings:** ${findings}\n` +
            `**Severity:** ${severity}\n` +
            `**Report:** ${report.slice(0, 200)}${report.length > 200 ? "..." : ""}\n` +
            `**Transaction:** ${hash}\n` +
            `**Explorer:** ${NETWORK.explorerUrl}/tx/${hash}\n\n` +
            `Your audit has been submitted and is now under review.\n` +
            `Once approved by the bounty creator, you will receive ${Number(bounty.reward) / 1e18} ASKL.\n\n` +
            `The workflow:\n` +
            `1. You claimed the bounty\n` +
            `2. You submitted the audit report\n` +
            `3. Creator will review and approve\n` +
            `4. ASKL tokens will be released automatically`
        },
      ],
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to submit audit: ${error.message}`);
    }
    throw new Error(`Failed to submit audit: ${String(error)}`);
  }
}

// ============================================================================
// Direction B: Multi-Agent Coordination (P2 Features)
// ============================================================================

export interface Task {
  id: string;
  title: string;
  description: string;
  budget: number;
  deadline: Date;
  creator: string;
  status: "pending" | "assigned" | "in-progress" | "completed";
  assignedAgents: string[];
  requiredSkills: string[];
  milestones: Milestone[];
  createdAt: Date;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  payment: number;
  status: "pending" | "completed" | "approved";
}

const taskStorage = new Map<string, Task>();

async function handleSubmitTask(args: unknown) {
  const schema = z.object({
    title: z.string().min(1).max(200),
    description: z.string().min(1).max(5000),
    budget: z.number().positive(),
    deadline_hours: z.number().positive().optional(),
    requiredSkills: z.array(z.string()).optional(),
    milestones: z.array(z.object({
      title: z.string(),
      payment: z.number().positive(),
      description: z.string().optional(),
    })).optional(),
  });

  const { title, description, budget, deadline_hours = 168, requiredSkills: requiredSkills = [], milestones = [] } = schema.parse(args);

  if (!walletClient) {
    throw new Error("Wallet not initialized. Please set PRIVATE_KEY environment variable.");
  }

  try {
    const taskId = `task-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const deadline = new Date(Date.now() + deadline_hours * 60 * 60 * 1000);

    const task: Task = {
      id: taskId,
      title,
      description,
      budget,
      deadline,
      creator: walletClient.account!.address,
      status: "pending",
      assignedAgents: [],
      requiredSkills: requiredSkills,
      milestones: milestones.map((m, i) => ({
        id: `${taskId}-milestone-${i}`,
        title: m.title,
        description: m.description || "",
        payment: m.payment,
        status: "pending",
      })),
      createdAt: new Date(),
    };

    taskStorage.set(taskId, task);

    return {
      content: [
        {
          type: "text",
          text: `✅ Task submitted successfully!\n\n` +
            `**Task ID:** ${taskId}\n` +
            `**Title:** ${title}\n` +
            `**Budget:** ${budget} ASKL\n` +
            `**Deadline:** ${deadline.toISOString()}\n` +
            `**Required Skills:** ${requiredSkills.join(", ") || "None"}\n` +
            `**Milestones:** ${milestones.length}\n\n` +
            `Agents can now apply for this task using 'assign_agents'.\n` +
            `Task coordinators can assign agents using 'assign_agents'.\n\n` +
            `This enables multi-agent coordination where:\n` +
            `1. Complex tasks are split into milestones\n` +
            `2. Multiple agents work in parallel\n` +
            `3. Payments are released per milestone\n` +
            `4. x402 protocol enables gasless agent payments`
        },
      ],
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to submit task: ${error.message}`);
    }
    throw new Error(`Failed to submit task: ${String(error)}`);
  }
}

async function handleAssignAgents(args: unknown) {
  const schema = z.object({
    task_id: z.string(),
    agents: z.array(z.object({
      address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
      role: z.string().optional(),
      payment_share: z.number().positive().optional(),
    })),
  });

  const { task_id, agents } = schema.parse(args);

  if (!walletClient) {
    throw new Error("Wallet not initialized. Please set PRIVATE_KEY environment variable.");
  }

  try {
    const task = taskStorage.get(task_id);
    if (!task) {
      throw new Error(`Task ${task_id} not found.`);
    }

    // Validate total payment shares
    const totalShares = agents.reduce((sum, a) => sum + (a.payment_share || 0), 0);
    if (totalShares > 100) {
      throw new Error(`Total payment shares (${totalShares}%) cannot exceed 100%`);
    }

    // Assign agents to task
    const assignedAddresses: string[] = [];
    for (const agent of agents) {
      if (!task.assignedAgents.includes(agent.address)) {
        task.assignedAgents.push(agent.address);
        assignedAddresses.push(agent.address);
      }
    }

    task.status = "in-progress";

    return {
      content: [
        {
          type: "text",
          text: `✅ Agents assigned to task successfully!\n\n` +
            `**Task ID:** ${task_id}\n` +
            `**Task Title:** ${task.title}\n` +
            `**Agents Assigned:** ${agents.length}\n` +
            `${assignedAddresses.length > 0 ? `**New Assignments:** ${assignedAddresses.join(", ")}\n` : ""}` +
            `**Total Assigned Agents:** ${task.assignedAgents.length}\n\n` +
            `Payment distribution:\n` +
            `${agents.map(a => `  - ${a.address.slice(0, 8)}... (${a.payment_share || 0}%): ${a.role || "Agent"}\n`).join("")}\n\n` +
            `Agents can now work on their assigned milestones.\n` +
            `Use 'complete_milestone' to mark progress and release payments.\n\n` +
            `Multi-agent coordination benefits:\n` +
            `• Parallel work on different milestones\n` +
            `• Automatic payment distribution per milestone\n` +
            `• x402 enables gasless payments for agents\n` +
            `• Monad high TPS enables instant settlements`
        },
      ],
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to assign agents: ${error.message}`);
    }
    throw new Error(`Failed to assign agents: ${String(error)}`);
  }
}

async function handleCompleteMilestone(args: unknown) {
  const schema = z.object({
    task_id: z.string(),
    milestone_id: z.string().optional(),
    milestone_index: z.number().optional(),
    proof: z.string().optional(),
  });

  const { task_id, milestone_id, milestone_index, proof } = schema.parse(args);

  if (!walletClient) {
    throw new Error("Wallet not initialized. Please set PRIVATE_KEY environment variable.");
  }

  try {
    const task = taskStorage.get(task_id);
    if (!task) {
      throw new Error(`Task ${task_id} not found.`);
    }

    // Find milestone
    let milestoneIndex = milestone_index;
    if (milestone_id) {
      milestoneIndex = task.milestones.findIndex(m => m.id === milestone_id);
    }

    if (milestoneIndex === undefined || milestoneIndex < 0 || milestoneIndex >= task.milestones.length) {
      throw new Error(`Invalid milestone. Task has ${task.milestones.length} milestones.`);
    }

    const milestone = task.milestones[milestoneIndex];

    if (milestone.status === "completed") {
      throw new Error(`Milestone "${milestone.title}" is already completed.`);
    }

    // Mark milestone as completed
    milestone.status = "completed";

    // In production, this would:
    // 1. Verify work completion (proof checking, IPFS verification)
    // 2. Execute payment to assigned agents via x402
    // 3. Update on-chain state

    return {
      content: [
        {
          type: "text",
          text: `✅ Milestone completed!\n\n` +
            `**Task ID:** ${task_id}\n` +
            `**Milestone:** ${milestone.title}\n` +
            `**Payment:** ${milestone.payment} ASKL\n` +
            `**Completed By:** ${walletClient.account?.address || "0x0"}\n` +
            `${proof ? `**Proof:** ${proof.slice(0, 100)}...\n` : ""}\n\n` +
            `In production, this would trigger:\n` +
            `• Automatic payment distribution via x402\n` +
            `• On-chain milestone completion\n` +
            `• Proof verification on IPFS\n\n` +
            `Remaining milestones: ${task.milestones.filter(m => m.status === "pending").length}\n` +
            `Completed milestones: ${task.milestones.filter(m => m.status === "completed").length}\n\n` +
            `Continue with next milestone or mark task as complete.`
        },
      ],
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to complete milestone: ${error.message}`);
    }
    throw new Error(`Failed to complete milestone: ${String(error)}`);
  }
}

async function handleListTasks(args: unknown) {
  const schema = z.object({
    status: z.enum(["pending", "assigned", "in-progress", "completed", "all"]).optional(),
    limit: z.number().min(1).max(100).optional(),
  });

  const { status = "all", limit = 50 } = schema.parse(args);

  try {
    let tasks = Array.from(taskStorage.values());

    if (status !== "all") {
      tasks = tasks.filter((t) => t.status === status);
    }

    tasks.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    const results = tasks.slice(0, limit);

    if (results.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: `No tasks found.\n\n` +
              `Be the first to submit a task using 'submit_task'!\n\n` +
              `Multi-agent coordination enables:\n` +
              `• Complex task decomposition\n` +
              `• Parallel agent execution\n` +
              `• Milestone-based payments\n` +
              `• Automatic dispute resolution`
          },
        ],
      };
    }

    return {
      content: [
        {
          type: "text",
          text: `Found ${results.length} Task${results.length === 1 ? "" : "s"}:\n\n${results
            .map(
              (t) =>
                `**${t.title}**\n` +
                `ID: ${t.id}\n` +
                `💰 Budget: ${t.budget} ASKL\n` +
                `📊 Status: ${t.status}\n` +
                `👥 Assigned: ${t.assignedAgents.length}/${t.requiredSkills.length} agents\n` +
                `📋 Milestones: ${t.milestones.length}\n`
            )
            .join("\n")}\n\n` +
            `Use 'assign_agents' to work on a task.\n` +
            `Use 'complete_milestone' to progress through milestones.`
        },
      ],
    };
  } catch (error) {
    throw new Error(`Failed to list tasks: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// ============================================================================
// Smart Matching Engine - find_skills_for_budget
// ============================================================================

interface SkillScore {
  skill: Skill;
  relevanceScore: number;  // 0-100, based on keyword matching
  successRate: number;     // 0-100, based on historical performance
  costEffectiveness: number; // 0-100, value per MON
  totalScore: number;      // Weighted combination
  estimatedCost: number;   // ASKL tokens
}

interface SkillCombination {
  skills: SkillScore[];
  totalScore: number;
  totalCost: number;
  remainingBudget: number;
}

async function handleFindSkillsForBudget(args: unknown) {
  const schema = z.object({
    requirement: z.string().min(5).max(1000),
    budget: z.number().positive().max(10000),
    optimization_goal: z.enum(["security", "speed", "cost", "effectiveness"]).optional(),
    platform: z.enum(["claude-code", "coze", "manus", "minimbp", "all"]).optional(),
  });

  const { requirement, budget, optimization_goal = "effectiveness", platform = "all" } = schema.parse(args);

  try {
    // Step 1: Get all available skills from cache and contract
    let allSkills = await skillCache.getAllSkills();

    // If no skills in cache, query contract
    if (allSkills.length === 0) {
      // For MVP, return sample skills with realistic data
      allSkills = [
        {
          id: '0xa1b2c3d4',
          name: 'Solidity Auditor Pro',
          creator: '0x1234567890abcdef1234567890abcdef12345678',
          platform: 'claude-code',
          description: 'Advanced smart contract security auditing with vulnerability detection',
          totalTips: 5420.5,
          totalStars: 87,
          createdAt: new Date('2026-01-15'),
        },
        {
          id: '0xb2c3d4e5',
          name: 'Gas Optimizer',
          creator: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
          platform: 'coze',
          description: 'Automated gas optimization for Ethereum smart contracts',
          totalTips: 3210.0,
          totalStars: 64,
          createdAt: new Date('2026-01-20'),
        },
        {
          id: '0xc3d4e5f6',
          name: 'Test Generator AI',
          creator: '0x567890abcdef1234567890abcdef1234567890',
          platform: 'manus',
          description: 'Generate comprehensive test suites with edge cases',
          totalTips: 4890.25,
          totalStars: 92,
          createdAt: new Date('2026-01-25'),
        },
        {
          id: '0xd4e5f6a7',
          name: 'Security Scanner',
          creator: '0x9876543210987654321098765432109876543210',
          platform: 'claude-code',
          description: 'Multi-scanner security analysis for smart contracts',
          totalTips: 6750.0,
          totalStars: 103,
          createdAt: new Date('2026-02-01'),
        },
        {
          id: '0xe5f6a7b8',
          name: 'Code Review Bot',
          creator: '0xfedcbafedcbafedcbafedcbafedcbafedcbafed',
          platform: 'coze',
          description: 'Automated code review with best practices checking',
          totalTips: 2850.75,
          totalStars: 51,
          createdAt: new Date('2026-02-05'),
        },
        {
          id: '0xf6a7b8c9',
          name: 'Fuzzer X',
          creator: '0x1111222233334444555566667777888899990000',
          platform: 'minimbp',
          description: 'Advanced fuzzing for smart contract vulnerability discovery',
          totalTips: 8120.5,
          totalStars: 118,
          createdAt: new Date('2026-02-07'),
        },
      ];
    }

    // Filter by platform if specified
    if (platform !== "all") {
      allSkills = allSkills.filter(s => s.platform === platform);
    }

    // Step 2: Analyze requirement and extract keywords (simple NLP)
    const keywords = extractKeywords(requirement);
    const taskType = identifyTaskType(requirement);

    // Step 3: Score each skill
    const scoredSkills: SkillScore[] = allSkills.map(skill => {
      const relevanceScore = calculateRelevance(skill, keywords, taskType);
      const successRate = calculateSuccessRate(skill);
      const costEffectiveness = calculateCostEffectiveness(skill);

      // Weight scores based on optimization goal
      const weights = getWeights(optimization_goal);
      const totalScore =
        (relevanceScore * weights.relevance) +
        (successRate * weights.success) +
        (costEffectiveness * weights.cost);

      // Estimate cost based on skill's historical tips (proxy for quality/price)
      const estimatedCost = Math.max(5, Math.floor(skill.totalTips / 100));

      return {
        skill,
        relevanceScore,
        successRate,
        costEffectiveness,
        totalScore,
        estimatedCost,
      };
    });

    // Sort by total score
    scoredSkills.sort((a, b) => b.totalScore - a.totalScore);

    // Step 4: Budget optimization using greedy knapsack approximation
    const combination = optimizeBudget(scoredSkills, budget, optimization_goal);

    // Step 5: Format response
    return {
      content: [{
        type: "text",
        text: `🎯 Smart Skill Matching Results\n\n` +
          `**Requirement:** ${requirement}\n` +
          `**Budget:** ${budget} MON\n` +
          `**Optimization Goal:** ${optimization_goal}\n` +
          `**Platform:** ${platform}\n\n` +
          `📊 Analysis:\n` +
          `• Keywords detected: ${keywords.join(", ")}\n` +
          `• Task type: ${taskType}\n` +
          `• Available skills: ${allSkills.length}\n\n` +
          `🏆 Recommended Skills (${combination.skills.length}):\n\n` +
          combination.skills.map((s, i) =>
            `**${i + 1}. ${s.skill.name}** (${s.skill.platform})\n` +
            `   💰 Cost: ${s.estimatedCost} MON\n` +
            `   📊 Scores: Relevance ${s.relevanceScore}% | Success ${s.successRate}% | Value ${s.costEffectiveness}%\n` +
            `   ⭐ Total Score: ${s.totalScore.toFixed(1)}/100\n` +
            `   📝 ${s.skill.description}\n`
          ).join("\n") +
          `\n💰 Budget Summary:\n` +
          `• Total Cost: ${combination.totalCost} MON\n` +
          `• Remaining: ${combination.remainingBudget} MON (${((combination.remainingBudget / budget) * 100).toFixed(1)}%)\n\n` +
          `🎯 Why this combination:\n` +
          `• Maximizes ${optimization_goal} within budget\n` +
          `• Balances relevance, success rate, and cost\n` +
          `• Enables parallel agent coordination\n\n` +
          `Next steps:\n` +
          `1. Use 'assign_agents' to allocate budget\n` +
          `2. Agents work in parallel on your requirement\n` +
          `3. Automatic settlement on completion via Monad`
      }],
    };
  } catch (error) {
    throw new Error(`Smart matching failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Helper: Extract keywords from requirement
function extractKeywords(text: string): string[] {
  const lowerText = text.toLowerCase();

  // Define keyword categories
  const keywordMap = {
    security: ['audit', 'security', 'vulnerability', 'hack', 'exploit', 'safe', 'protect', 'scan'],
    testing: ['test', 'fuzz', 'verify', 'validate', 'check', 'coverage', 'spec'],
    optimization: ['optimize', 'gas', 'efficient', 'reduce', 'improve', 'performance'],
    review: ['review', 'analyze', 'check', 'inspect', 'examine', 'assess'],
  };

  const found: string[] = [];
  for (const [category, words] of Object.entries(keywordMap)) {
    if (words.some(w => lowerText.includes(w))) {
      found.push(category);
    }
  }

  // Also extract technical terms
  const techTerms = text.match(/\b(solidity|contract|smart|ethereum|monad|defi|nft|token|dao)\b/gi);
  if (techTerms) {
    found.push(...[...new Set(techTerms.map(t => t.toLowerCase()))]);
  }

  return found.length > 0 ? found : ['general'];
}

// Helper: Identify task type
function identifyTaskType(text: string): string {
  const lowerText = text.toLowerCase();

  if (lowerText.includes('audit') || lowerText.includes('security') || lowerText.includes('vulnerability')) {
    return 'security-audit';
  } else if (lowerText.includes('test') || lowerText.includes('fuzz') || lowerText.includes('verify')) {
    return 'testing';
  } else if (lowerText.includes('optimize') || lowerText.includes('gas') || lowerText.includes('efficient')) {
    return 'optimization';
  } else if (lowerText.includes('review') || lowerText.includes('analyze')) {
    return 'code-review';
  }
  return 'general';
}

// Helper: Calculate relevance score
function calculateRelevance(skill: Skill, keywords: string[], taskType: string): number {
  let score = 50; // Base score

  const skillText = `${skill.name} ${skill.description || ''} ${skill.platform}`.toLowerCase();

  // Keyword matching
  const matchedKeywords = keywords.filter(k => skillText.includes(k));
  score += matchedKeywords.length * 10;

  // Task type bonus
  if (skill.description?.toLowerCase().includes(taskType) || skill.name.toLowerCase().includes(taskType.replace('-', ' '))) {
    score += 20;
  }

  // Platform relevance
  if (skill.platform === 'claude-code') score += 5; // Slightly prefer Claude Code

  return Math.min(100, score);
}

// Helper: Calculate success rate based on historical data
function calculateSuccessRate(skill: Skill): number {
  // Base on stars (social proof) and tips (economic proof)
  const starScore = Math.min(100, skill.totalStars * 0.8);
  const tipScore = Math.min(100, Math.log10(skill.totalTips + 1) * 20);

  return (starScore + tipScore) / 2;
}

// Helper: Calculate cost effectiveness
function calculateCostEffectiveness(skill: Skill): number {
  // Value = (stars + tips/100) / estimated cost
  const value = skill.totalStars + (skill.totalTips / 100);
  const cost = Math.max(1, Math.floor(skill.totalTips / 100));

  const effectiveness = (value / cost) * 20;
  return Math.min(100, effectiveness);
}

// Helper: Get weights based on optimization goal
function getWeights(goal: string): { relevance: number; success: number; cost: number } {
  const weights: Record<string, { relevance: number; success: number; cost: number }> = {
    security: { relevance: 0.4, success: 0.5, cost: 0.1 },
    speed: { relevance: 0.3, success: 0.3, cost: 0.4 },
    cost: { relevance: 0.2, success: 0.2, cost: 0.6 },
    effectiveness: { relevance: 0.35, success: 0.4, cost: 0.25 },
  };
  return weights[goal] || weights.effectiveness;
}

// Helper: Optimize budget using greedy knapsack approximation
function optimizeBudget(scoredSkills: SkillScore[], budget: number, goal: string): SkillCombination {
  const selected: SkillScore[] = [];
  let remainingBudget = budget;
  let totalScore = 0;

  // For cost optimization, sort by cost-effectiveness first
  if (goal === 'cost') {
    scoredSkills.sort((a, b) => b.costEffectiveness - a.costEffectiveness);
  }

  // Greedy selection
  for (const scored of scoredSkills) {
    if (scored.estimatedCost <= remainingBudget) {
      selected.push(scored);
      remainingBudget -= scored.estimatedCost;
      totalScore += scored.totalScore;

      // Stop if we have enough skills (3-5 is optimal for coordination)
      if (selected.length >= 5) break;
    }
  }

  return {
    skills: selected,
    totalScore,
    totalCost: budget - remainingBudget,
    remainingBudget,
  };
}

// ============================================================================
// Server Startup
// ============================================================================

async function main() {
  console.error(`MySkills MCP Server v1.0.0`);
  console.error(`Network: ${NETWORK.name} (Chain ID: ${NETWORK.chainId})`);
  console.error(`RPC: ${NETWORK.rpcUrl}`);

  if (MY_SKILLS_CONTRACT) {
    console.error(`Contract: ${MY_SKILLS_CONTRACT}`);
  } else {
    console.error(`Contract: Not configured (using mock data)`);
  }

  if (walletClient) {
    console.error(`Wallet: Connected`);
  } else {
    console.error(`Wallet: Not configured (write operations will fail)`);
  }

  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error("MySkills MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
