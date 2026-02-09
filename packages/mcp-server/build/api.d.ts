/**
 * MySkills MCP Server - HTTP API Export
 *
 * This file exports MCP tool functions for use in Next.js API routes.
 * For the MVP, we use in-memory storage and mock data when contract is not deployed.
 */
export interface MCPToolResponse {
    content: Array<{
        type: string;
        text: string;
    }>;
    isError?: boolean;
}
export declare function parseMCPResponse(result: any): any;
export declare const mockBounties: ({
    id: string;
    title: string;
    description: string;
    reward: number;
    category: string;
    creator: string;
    status: string;
    createdAt: string;
    deadline: string;
    assignee?: undefined;
} | {
    id: string;
    title: string;
    description: string;
    reward: number;
    category: string;
    creator: string;
    status: string;
    createdAt: string;
    deadline: string;
    assignee: string;
})[];
export declare const mockSkills: {
    id: string;
    name: string;
    platform: string;
    description: string;
    totalTips: number;
    totalStars: number;
    creator: string;
    createdAt: string;
}[];
//# sourceMappingURL=api.d.ts.map