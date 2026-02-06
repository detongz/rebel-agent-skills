/**
 * Validation utilities
 */

const PLATFORMS = ['coze', 'claude-code', 'manus', 'minimax'];

/**
 * Validate platform
 */
export function validatePlatform(platform: string): boolean {
  return PLATFORMS.includes(platform.toLowerCase());
}

/**
 * Validate Ethereum address
 */
export function validateAddress(address: string): boolean {
  const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
  return ethAddressRegex.test(address);
}

/**
 * Validate GitHub repository URL
 */
export function validateRepoUrl(url: string): boolean {
  const githubRegex = /^https:\/\/github\.com\/[^\/]+\/[^\/]+\/?$/;
  return githubRegex.test(url);
}

/**
 * Validate npm package name
 */
export function validateNpmPackage(name: string): boolean {
  // Scoped package or regular package
  const npmRegex = /^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/;
  return npmRegex.test(name);
}

/**
 * Validate version string (semver)
 */
export function validateVersion(version: string): boolean {
  const semverRegex = /^\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?(\+[a-zA-Z0-9.-]+)?$/;
  return semverRegex.test(version);
}
