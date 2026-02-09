import { Octokit } from "octokit";
import { publicClient } from "./clients";
/**
 * Parse package.json to extract MySkills metadata
 */
export async function parsePackageMetadata(packageJson) {
    return {
        name: packageJson.name,
        description: packageJson.description,
        repository: packageJson.repository?.url || packageJson.repository,
        author: packageJson.author,
        monadWalletAddress: packageJson?.myskills?.walletAddress,
        keywords: packageJson.keywords,
    };
}
/**
 * Register skill from npm/GitHub metadata (no manual registration)
 */
export async function registerSkillFromMetadata(metadata) {
    try {
        // Extract wallet address from metadata
        const walletAddress = metadata.monadWalletAddress ||
            await extractWalletFromGitHub(metadata.repository);
        if (!walletAddress) {
            throw new Error("No wallet address found in metadata");
        }
        // Generate skill ID from package name
        const skillId = `0x${Buffer.from(metadata.name).toString('hex')}`.padEnd(66, '0').slice(0, 66);
        // Check if already registered
        const existingCreator = await publicClient.readContract({
            address: MY_SKILLS_CONTRACT,
            abi: ASKL_TOKEN_ABI,
            functionName: "skillCreators",
            args: [skillId],
        });
        // If not registered, register automatically
        if (existingCreator === "0x0000000000000000000000000000000000000000") {
            // Would call smart contract here
            // For MVP, store in cache
            skillCache.setSkill({
                id: skillId,
                name: metadata.name,
                description: metadata.description,
                creator: walletAddress,
                platform: "npm",
                repository: metadata.repository,
                totalTips: 0,
                totalStars: 0,
                createdAt: new Date(),
            });
            return { skillId, registered: true };
        }
        return { skillId, registered: false };
    }
    catch (error) {
        throw new Error(`Failed to register from metadata: ${error}`);
    }
}
/**
 * Extract wallet address from GitHub repository
 */
async function extractWalletFromGitHub(repository) {
    try {
        const octokit = new Octokit();
        const [owner, repo] = repository.replace(/https?:\/\/github\.com\//, "").split("/");
        // Fetch README to find wallet address
        const { data: readme } = await octokit.rest.repos.getReadme({
            owner,
            repo,
        });
        // Search for wallet address in README
        const content = atob(readme.content);
        const walletMatch = content.match(/0x[a-fA-F0-9]{40}/);
        if (walletMatch) {
            return walletMatch[0];
        }
        // Check package.json if it exists
        try {
            const { data: packageJson } = await octokit.rest.repos.getContent({
                owner,
                repo,
                path: "package.json",
            });
            const content = atob(packageJson.content);
            const pkg = JSON.parse(content);
            return pkg?.myskills?.walletAddress || null;
        }
        catch {
            return null;
        }
    }
    catch (error) {
        console.error("Failed to extract wallet from GitHub:", error);
        return null;
    }
}
/**
 * Track skill usage and auto-allocate rewards
 */
export async function trackSkillUsage(packageId, userId) {
    // Record usage
    const usage = {
        packageId,
        downloads: 1,
        lastUsed: new Date(),
        userId,
    };
    // Store in usage tracking system
    // In production: Redis, PostgreSQL, or The Graph
}
/**
 * Calculate and distribute rewards based on usage
 */
export async function distributeRewards(periodStart, periodEnd) {
    const rewards = new Map();
    // Get all usage in period
    const usages = await getUsageInPeriod(periodStart, periodEnd);
    // Group by skill/creator
    const skillDownloads = new Map();
    for (const usage of usages) {
        const current = skillDownloads.get(usage.packageId) || 0;
        skillDownloads.set(usage.packageId, current + 1);
    }
    // Calculate rewards (example: 1 ASKL per 100 downloads)
    for (const [skillId, downloads] of skillDownloads.entries()) {
        const reward = BigInt(Math.floor(downloads / 100) * 1e18);
        // Get creator for skill
        const skill = await skillCache.getSkill(skillId);
        if (skill) {
            const current = rewards.get(skill.creator) || 0n;
            rewards.set(skill.creator, current + reward);
        }
    }
    // Distribute rewards via smart contract or x402
    for (const [creator, amount] of rewards.entries()) {
        if (amount > 0n) {
            // In production: call smart contract or use x402
            console.log(`Rewarding ${creator} with ${amount} ASKL`);
        }
    }
    return rewards;
}
/**
 * Get usage data for a period
 */
async function getUsageInPeriod(start, end) {
    // In production: Query from database or The Graph
    return [];
}
/**
 * Parse package.json during npm install (hook)
 */
export async function onPackageInstall(packageName) {
    try {
        // Fetch package metadata from npm registry
        const response = await fetch(`https://registry.npmjs.org/${packageName}`);
        const metadata = await response.json();
        const latestVersion = metadata.versions[metadata["dist-tags"].latest];
        const packageData = await parsePackageMetadata(latestVersion);
        // Auto-register if has MySkills metadata
        if (packageData.monadWalletAddress || packageData.repository) {
            await registerSkillFromMetadata(packageData);
        }
    }
    catch (error) {
        console.error(`Failed to process package ${packageName}:`, error);
    }
}
//# sourceMappingURL=skill-registry.js.map