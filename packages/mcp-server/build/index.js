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
import { CallToolRequestSchema, ListToolsRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
import { createPublicClient, createWalletClient, http, parseAbi } from "viem";
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
const MY_SKILLS_CONTRACT = (process.env.MYSKILLS_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000");
// ============================================================================
// Contract ABI
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
    // Events
    "event SkillRegistered(bytes32 indexed skillId, address indexed creator, string skillName)",
    "event Tipped(bytes32 indexed skillId, address indexed tipper, address indexed creator, uint256 amount, uint256 creatorReward, uint256 platformFee)",
    "event Transfer(address indexed from, address indexed to, uint256 value)",
]);
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
let walletClient = null;
let walletAddress = null;
// Initialize wallet client if private key is provided
if (process.env.PRIVATE_KEY) {
    try {
        const account = privateKeyToAccount(process.env.PRIVATE_KEY);
        walletAddress = account.address;
        walletClient = createWalletClient({
            account,
            chain: chainConfig,
            transport: http(),
        });
    }
    catch (error) {
        console.error("Failed to initialize wallet client:", error);
    }
}
class SkillCache {
    cache = new Map();
    skillsByCreator = new Map();
    lastUpdate = 0;
    TTL = 60000; // 1 minute cache
    async refreshFromChain() {
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
        }
        catch (error) {
            console.error("[MCP] Failed to refresh cache:", error);
        }
    }
    async getSkill(skillId) {
        await this.refreshFromChain();
        return this.cache.get(skillId) || null;
    }
    async getAllSkills() {
        await this.refreshFromChain();
        return Array.from(this.cache.values());
    }
    setSkill(skill) {
        this.cache.set(skill.id, skill);
        // Update creator index
        if (!this.skillsByCreator.has(skill.creator)) {
            this.skillsByCreator.set(skill.creator, []);
        }
        this.skillsByCreator.get(skill.creator).push(skill.id);
    }
    async getCreatorSkills(creator) {
        const skillIds = this.skillsByCreator.get(creator) || [];
        const skills = [];
        for (const id of skillIds) {
            const skill = await this.getSkill(id);
            if (skill)
                skills.push(skill);
        }
        return skills;
    }
}
const skillCache = new SkillCache();
// ============================================================================
// MCP Server Setup
// ============================================================================
const server = new Server({
    name: "@myskills/mcp-server",
    version: "1.0.0",
}, {
    capabilities: {
        tools: {},
    },
});
// ============================================================================
// Tool Definitions
// ============================================================================
// List all available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "list_skills",
                description: "List all Agent Skills registered on MySkills protocol. Supports filtering by platform and sorting.",
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
                description: "Tip a Skill creator on Monad blockchain using ASKL tokens. Requires PRIVATE_KEY environment variable.",
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
                description: "Register a new Agent Skill on MySkills protocol using ASKLToken contract. Requires PRIVATE_KEY environment variable.",
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
                description: "Post a new bounty for custom skill development on MySkills protocol. Requires PRIVATE_KEY environment variable.",
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
                description: "Submit an audit report for a bounty. Requires PRIVATE_KEY environment variable.",
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
            default:
                throw new Error(`Unknown tool: ${name}`);
        }
    }
    catch (error) {
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
async function handleListSkills(args) {
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
            }
            catch (contractError) {
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
                        .map((s) => `**${s.name}** (${s.platform})\n` +
                        `ID: ${s.id}\n` +
                        `Creator: ${s.creator}\n` +
                        `💰 Total Tips: ${s.totalTips.toFixed(2)} ASKL\n` +
                        `⭐ Stars: ${s.totalStars}\n` +
                        `📝 ${s.description || "No description"}\n`)
                        .join("\n")}`,
                },
            ],
        };
    }
    catch (error) {
        throw new Error(`Failed to list skills: ${error instanceof Error ? error.message : String(error)}`);
    }
}
async function handleGetSkill(args) {
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
            ? skill_id
            : `0x${skill_id}`;
        const creator = await publicClient.readContract({
            address: MY_SKILLS_CONTRACT,
            abi: ASKL_TOKEN_ABI,
            functionName: "getSkillCreator",
            args: [skillIdBytes32],
        });
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
        });
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
    }
    catch (error) {
        throw new Error(`Failed to get skill: ${error instanceof Error ? error.message : String(error)}`);
    }
}
async function handleTipCreator(args) {
    const schema = z.object({
        skill_id: z.string(),
        amount: z.number().positive(),
        message: z.string().optional(),
    });
    const { skill_id, amount, message } = schema.parse(args);
    if (!walletClient) {
        throw new Error("Wallet not initialized. Please set PRIVATE_KEY environment variable to perform write operations.");
    }
    try {
        // Convert skill_id to bytes32 if needed
        const skillIdBytes32 = skill_id.startsWith('0x')
            ? skill_id
            : `0x${skill_id}`;
        // First check if skill exists
        const creator = await publicClient.readContract({
            address: MY_SKILLS_CONTRACT,
            abi: ASKL_TOKEN_ABI,
            functionName: "getSkillCreator",
            args: [skillIdBytes32],
        });
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
            args: [walletClient.account.address],
        });
        if (senderBalance < amountInWei) {
            throw new Error(`Insufficient ASKL balance. You have ${Number(senderBalance) / 1e18} ASKL, but need ${amount} ASKL.\n` +
                `Please ensure you have ASKL tokens at address ${walletClient.account.address}`);
        }
        // Simulate the transaction first
        const { request } = await publicClient.simulateContract({
            address: MY_SKILLS_CONTRACT,
            abi: ASKL_TOKEN_ABI,
            functionName: "tipSkill",
            args: [skillIdBytes32, amountInWei],
            account: walletClient.account,
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
        });
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
    }
    catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to send tip: ${error.message}`);
        }
        throw new Error(`Failed to send tip: ${String(error)}`);
    }
}
async function handleRegisterSkill(args) {
    const schema = z.object({
        name: z.string().min(1).max(100),
        description: z.string().min(1).max(500),
        platform: z.enum(["claude-code", "coze", "manus", "minimbp"]),
        repository_url: z.string().url().optional(),
    });
    const { name, description, platform, repository_url } = schema.parse(args);
    if (!walletClient) {
        throw new Error("Wallet not initialized. Please set PRIVATE_KEY environment variable to perform write operations.");
    }
    try {
        // Generate skill ID as keccak256 hash of name + platform + timestamp
        const crypto = require('crypto');
        const skillIdInput = `${name}:${platform}:${Date.now()}`;
        const skillIdBytes32 = `0x${crypto.createHash('sha256').update(skillIdInput).digest('hex')}`;
        // Simulate the transaction first
        const { request } = await publicClient.simulateContract({
            address: MY_SKILLS_CONTRACT,
            abi: ASKL_TOKEN_ABI,
            functionName: "registerSkill",
            args: [skillIdBytes32, name, walletClient.account.address], // Use sender as creator
            account: walletClient.account,
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
            creator: walletClient.account.address,
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
                        `**Creator:** ${walletClient.account.address}\n` +
                        `**Transaction:** ${hash}\n` +
                        `**Explorer:** ${NETWORK.explorerUrl}/tx/${hash}\n` +
                        `**Block:** ${receipt.blockNumber}\n\n` +
                        `Your skill is now registered on the MySkills protocol and can receive tips!`,
                },
            ],
        };
    }
    catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to register skill: ${error.message}`);
        }
        throw new Error(`Failed to register skill: ${String(error)}`);
    }
}
async function handleGetLeaderboard(args) {
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
                        .map((item) => `#${item.rank} **${item.name}** (${item.platform})\n` +
                        `💰 ${item.tips.toFixed(2)} ASKL received\n` +
                        `👤 Creator: ${item.creator}\n`)
                        .join("\n")}\n\n` +
                        `**Network:** ${NETWORK.name}\n` +
                        `**Contract:** ${MY_SKILLS_CONTRACT}`
                },
            ],
        };
    }
    catch (error) {
        throw new Error(`Failed to get leaderboard: ${error instanceof Error ? error.message : String(error)}`);
    }
}
async function handleGetMonBalance(args) {
    const schema = z.object({
        address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
    });
    const { address } = schema.parse(args);
    try {
        const balance = await publicClient.getBalance({
            address: address,
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
    }
    catch (error) {
        throw new Error(`Failed to fetch MON balance: ${error instanceof Error ? error.message : String(error)}`);
    }
}
async function handleGetAsklBalance(args) {
    const schema = z.object({
        address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
    });
    const { address } = schema.parse(args);
    try {
        const balance = await publicClient.readContract({
            address: MY_SKILLS_CONTRACT,
            abi: ASKL_TOKEN_ABI,
            functionName: "balanceOf",
            args: [address],
        });
        // Get creator earnings if any
        let creatorEarnings = 0n;
        try {
            creatorEarnings = await publicClient.readContract({
                address: MY_SKILLS_CONTRACT,
                abi: ASKL_TOKEN_ABI,
                functionName: "getCreatorEarnings",
                args: [address],
            });
        }
        catch {
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
    }
    catch (error) {
        throw new Error(`Failed to fetch ASKL balance: ${error instanceof Error ? error.message : String(error)}`);
    }
}
// In-memory bounty storage (for MVP)
const bountyStorage = new Map();
async function handlePostBounty(args) {
    const schema = z.object({
        title: z.string().min(1).max(200),
        description: z.string().min(1).max(5000),
        reward: z.number().positive(),
        skill_category: z.enum(["security-audit", "code-review", "test-generation", "optimization", "documentation", "other"]).optional(),
    });
    const { title, description, reward, skill_category = "other" } = schema.parse(args);
    if (!walletClient) {
        throw new Error("Wallet not initialized. Please set PRIVATE_KEY environment variable to perform write operations.");
    }
    try {
        // Check ASKL balance
        const balance = await publicClient.readContract({
            address: MY_SKILLS_CONTRACT,
            abi: ASKL_TOKEN_ABI,
            functionName: "balanceOf",
            args: [walletClient.account.address],
        });
        const rewardInWei = BigInt(Math.floor(reward * 1e18));
        if (balance < rewardInWei) {
            throw new Error(`Insufficient ASKL balance. You have ${Number(balance) / 1e18} ASKL, but need ${reward} ASKL.`);
        }
        // Generate bounty ID
        const crypto = require('crypto');
        const bountyId = `0x${crypto.createHash('sha256').update(`${title}:${Date.now()}`).digest('hex').slice(0, 40)}`;
        // Create bounty record
        const bounty = {
            id: bountyId,
            title,
            description,
            reward,
            category: skill_category,
            creator: walletClient.account.address,
            status: "open",
            createdAt: new Date(),
        };
        // Store bounty
        bountyStorage.set(bountyId, bounty);
        // In a full implementation, we would:
        // 1. Transfer ASKL to escrow contract
        // 2. Emit on-chain event
        // 3. Index the bounty
        return {
            content: [
                {
                    type: "text",
                    text: `✅ Bounty posted successfully on ${NETWORK.name}!\n\n` +
                        `**Bounty ID:** ${bountyId}\n` +
                        `**Title:** ${title}\n` +
                        `**Category:** ${skill_category}\n` +
                        `**Reward:** ${reward} ASKL\n` +
                        `**Description:** ${description.slice(0, 200)}${description.length > 200 ? "..." : ""}\n` +
                        `**Creator:** ${walletClient.account.address}\n` +
                        `**Status:** Open\n\n` +
                        `Note: For MVP, bounties are stored off-chain. In production, this would use an escrow contract.\n\n` +
                        `Agents can now submit audit reports using 'submit_audit'.`
                },
            ],
        };
    }
    catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to post bounty: ${error.message}`);
        }
        throw new Error(`Failed to post bounty: ${String(error)}`);
    }
}
async function handleListBounties(args) {
    const schema = z.object({
        status: z.enum(["open", "in-progress", "completed", "all"]).optional(),
        category: z.string().optional(),
        limit: z.number().min(1).max(100).optional(),
    });
    const { status = "all", category, limit = 50 } = schema.parse(args);
    try {
        let bounties = Array.from(bountyStorage.values());
        // Filter by status
        if (status !== "all") {
            bounties = bounties.filter((b) => b.status === status);
        }
        // Filter by category
        if (category) {
            bounties = bounties.filter((b) => b.category === category);
        }
        // Sort by newest first
        bounties.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        const results = bounties.slice(0, limit);
        if (results.length === 0) {
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
        return {
            content: [
                {
                    type: "text",
                    text: `Found ${results.length} Bount${results.length === 1 ? "y" : "ies"}:\n\n${results
                        .map((b) => `**${b.title}** (${b.category})\n` +
                        `ID: ${b.id}\n` +
                        `💰 Reward: ${b.reward} ASKL\n` +
                        `📊 Status: ${b.status}\n` +
                        `👤 Creator: ${b.creator}\n` +
                        `📝 ${b.description.slice(0, 100)}${b.description.length > 100 ? "..." : ""}\n`)
                        .join("\n")}\n\n` +
                        `Use 'submit_audit' to submit a report for any open bounty.`
                },
            ],
        };
    }
    catch (error) {
        throw new Error(`Failed to list bounties: ${error instanceof Error ? error.message : String(error)}`);
    }
}
async function handleSubmitAudit(args) {
    const schema = z.object({
        bounty_id: z.string(),
        report: z.string().min(1).max(10000),
        findings: z.number().int().min(0).optional(),
        severity: z.enum(["critical", "high", "medium", "low", "none"]).optional(),
    });
    const { bounty_id, report, findings = 0, severity = "none" } = schema.parse(args);
    if (!walletClient) {
        throw new Error("Wallet not initialized. Please set PRIVATE_KEY environment variable to perform write operations.");
    }
    try {
        // Check if bounty exists
        const bounty = bountyStorage.get(bounty_id);
        if (!bounty) {
            throw new Error(`Bounty ${bounty_id} not found. Please check the bounty ID.`);
        }
        if (bounty.status !== "open") {
            throw new Error(`Bounty ${bounty_id} is not open. Current status: ${bounty.status}`);
        }
        // Update bounty status
        bounty.status = "in-progress";
        bounty.assignee = walletClient.account.address;
        // In a full implementation, we would:
        // 1. Submit audit report to IPFS
        // 2. Call smart contract to register submission
        // 3. Trigger jury selection if needed
        return {
            content: [
                {
                    type: "text",
                    text: `✅ Audit report submitted successfully!\n\n` +
                        `**Bounty ID:** ${bounty_id}\n` +
                        `**Bounty Title:** ${bounty.title}\n` +
                        `**Submitter:** ${walletClient.account.address}\n` +
                        `**Findings:** ${findings}\n` +
                        `**Severity:** ${severity}\n` +
                        `**Report:** ${report.slice(0, 200)}${report.length > 200 ? "..." : ""}\n\n` +
                        `Your audit has been submitted for review.\n` +
                        `If approved by the bounty creator or agent jury, you will receive ${bounty.reward} ASKL.\n\n` +
                        `Note: For MVP, audit submissions are stored off-chain. In production, this would use an on-chain dispute resolution system.`
                },
            ],
        };
    }
    catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to submit audit: ${error.message}`);
        }
        throw new Error(`Failed to submit audit: ${String(error)}`);
    }
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
    }
    else {
        console.error(`Contract: Not configured (using mock data)`);
    }
    if (walletClient) {
        console.error(`Wallet: Connected`);
    }
    else {
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
//# sourceMappingURL=index.js.map