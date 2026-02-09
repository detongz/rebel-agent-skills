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
//# sourceMappingURL=index.d.ts.map