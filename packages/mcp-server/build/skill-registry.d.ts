interface PackageMetadata {
    name: string;
    description: string;
    repository: string;
    author: string;
    monadWalletAddress?: string;
    keywords?: string[];
}
/**
 * Parse package.json to extract MySkills metadata
 */
export declare function parsePackageMetadata(packageJson: any): Promise<PackageMetadata>;
/**
 * Register skill from npm/GitHub metadata (no manual registration)
 */
export declare function registerSkillFromMetadata(metadata: PackageMetadata): Promise<{
    skillId: string;
    registered: boolean;
}>;
/**
 * Track skill usage and auto-allocate rewards
 */
export declare function trackSkillUsage(packageId: string, userId: string): Promise<void>;
/**
 * Calculate and distribute rewards based on usage
 */
export declare function distributeRewards(periodStart: Date, periodEnd: Date): Promise<Map<string, bigint>>;
/**
 * Parse package.json during npm install (hook)
 */
export declare function onPackageInstall(packageName: string): Promise<void>;
export {};
//# sourceMappingURL=skill-registry.d.ts.map