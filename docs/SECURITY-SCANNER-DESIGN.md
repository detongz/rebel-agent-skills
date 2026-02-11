# Skill Security Scanner Design

**Purpose:** Verify skills submitted by users/AI agents before allowing installation

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Input Layer                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │ skill.md │  │ GitHub   │  │ npm pkg  │  │ OpenClaw │        │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘        │
└───────┼────────────┼────────────┼────────────┼─────────────────┘
        │            │            │            │
        ▼            ▼            ▼            ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Input Parser Module                            │
│  • Markdown parser          • GitHub repo fetcher               │
│  • npm registry fetcher      • OpenClaw plugin fetcher          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Security Scanner Engine                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 1. Basic Code Security                                   │  │
│  │    • Malicious pattern detection (eval, exec, etc.)      │  │
│  │    • Sensitive data leak detection                       │  │
│  │    • Command injection detection                         │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │ 2. Dependency Security                                   │  │
│  │    • npm audit integration                               │  │
│  │    • Known vulnerability checks                          │  │
│  │    • License compatibility                               │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │ 3. MCP-Specific Security                                 │  │
│  │    • Tool definition validation                          │  │
│  │    • Environment variable analysis                       │  │
│  │    • Network call detection                              │  │
│  │    • File system access checks                           │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │ 4. Creator Reputation                                    │  │
│  │    • GitHub account age/verification                     │  │
│  │    • Previous skill history                              │  │
│  │    • Community feedback                                  │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Score Calculator                              │
│  • Weighted scoring across all checks                           │
│  • 0-100 score with confidence level                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Blockchain Storage                            │
│  • SkillScanReport.sol contract                                 │
│  • Store scan hash + score + timestamp on-chain                 │
│  • Full report stored on IPFS                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Output                                        │
│  {                                                              │
│    score: 95,                                                   │
│    status: "safe",                                              │
│    ipfsHash: "Qm...",                                           │
│    txHash: "0x...",                                             │
│    details: {...}                                               │
│  }                                                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## Smart Contract: SkillScanReport.sol

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SkillScanReport {
    struct ScanResult {
        bytes32 skillHash;      // Hash of skill identifier (GitHub URL, npm name, etc.)
        uint256 score;          // 0-100
        uint8 status;           // 0=danger, 1=warning, 2=safe
        bytes32 ipfsHash;       // Full report on IPFS
        uint256 timestamp;      // Scan time
        address scanner;        // Who performed the scan
    }

    mapping(bytes32 => ScanResult) public scans;
    mapping(bytes32 => bool) public skillExists;

    event ScanSubmitted(
        bytes32 indexed skillHash,
        uint256 score,
        uint8 status,
        bytes32 ipfsHash,
        address indexed scanner
    );

    // Only authorized scanners can submit
    mapping(address => bool) public authorizedScanners;

    constructor() {
        authorizedScanners[msg.sender] = true;
    }

    modifier onlyScanner() {
        require(authorizedScanners[msg.sender], "Not authorized");
        _;
    }

    function submitScan(
        bytes32 skillHash,
        uint256 score,
        uint8 status,
        bytes32 ipfsHash
    ) external onlyScanner {
        scans[skillHash] = ScanResult({
            skillHash: skillHash,
            score: score,
            status: status,
            ipfsHash: ipfsHash,
            timestamp: block.timestamp,
            scanner: msg.sender
        });

        skillExists[skillHash] = true;

        emit ScanSubmitted(skillHash, score, status, ipfsHash, msg.sender);
    }

    function getScan(bytes32 skillHash) external view returns (ScanResult memory) {
        require(skillExists[skillHash], "Scan not found");
        return scans[skillHash];
    }

    function isSkillSafe(bytes32 skillHash, uint256 minScore) external view returns (bool) {
        if (!skillExists[skillHash]) return false;
        ScanResult memory scan = scans[skillHash];
        return scan.score >= minScore && scan.status == 2;
    }

    // Admin functions
    function addScanner(address scanner) external {
        authorizedScanners[scanner] = true;
    }

    function removeScanner(address scanner) external {
        authorizedScanners[scanner] = false;
    }
}
```

---

## Scanner Implementation

### Core Scanner Class

```typescript
// packages/security-scanner/src/scanner.ts

import { fetch } from 'undici';
import { createHash } from 'crypto';

export interface ScanInput {
  type: 'markdown' | 'github' | 'npm' | 'openclaw';
  content: string;
}

export interface ScanResult {
  score: number;
  status: 'safe' | 'warning' | 'danger';
  vulnerabilities: number;
  warnings: string[];
  details: {
    codeAnalysis: CodeAnalysisResult;
    dependencyCheck: DependencyResult;
    mcpSecurity: MCPSecurityResult;
    creatorReputation: ReputationResult;
  };
}

export class SkillScanner {
  private readonly WEIGHTS = {
    codeSecurity: 0.35,
    dependencySecurity: 0.25,
    mcpSecurity: 0.25,
    reputation: 0.15
  };

  async scan(input: ScanInput): Promise<ScanResult> {
    // 1. Fetch skill content
    const skillContent = await this.fetchSkillContent(input);

    // 2. Run parallel security checks
    const [
      codeAnalysis,
      dependencyCheck,
      mcpSecurity,
      creatorReputation
    ] = await Promise.all([
      this.analyzeCodeSecurity(skillContent),
      this.checkDependencies(skillContent),
      this.analyzeMCPSecurity(skillContent),
      this.checkCreatorReputation(input)
    ]);

    // 3. Calculate weighted score
    const score = this.calculateScore({
      codeAnalysis,
      dependencyCheck,
      mcpSecurity,
      creatorReputation
    });

    // 4. Determine status
    const status = this.determineStatus(score, codeAnalysis, dependencyCheck);

    // 5. Store on-chain (IPFS + blockchain)
    const { ipfsHash, txHash } = await this.storeResult({
      input,
      score,
      status,
      details: { codeAnalysis, dependencyCheck, mcpSecurity, creatorReputation }
    });

    return {
      score,
      status,
      vulnerabilities: codeAnalysis.criticalCount + codeAnalysis.highCount,
      warnings: [...codeAnalysis.warnings, ...dependencyCheck.warnings],
      details: { codeAnalysis, dependencyCheck, mcpSecurity, creatorReputation },
      ipfsHash,
      txHash
    };
  }

  // 1. Basic Code Security
  private async analyzeCodeSecurity(content: string): Promise<CodeAnalysisResult> {
    const patterns = {
      // Dangerous execution
      eval: /eval\s*\(/gi,
      exec: /exec\s*\(/gi,
      spawn: /spawn\s*\(/gi,
      childProcess: /child_process/gi,

      // Dynamic requires
      dynamicRequire: /require\s*\(\s*[^'"]/gi,

      // Command injection
      shellExec: /\.exec\s*\(/gi,

      // Sensitive data
      privateKey: /private[_-]?key/gi,
      apiKey: /api[_-]?key/gi,
      secret: /secret.*=.*['"]/gi,

      // Network calls to non-HTTPS
      httpUrl: /http:\/\/(?!localhost)/gi,

      // File system operations
      writeFile: /writeFile\s*\(/gi,
      unlink: /unlink\s*\(/gi
    };

    const findings: string[] = [];
    const counts: Record<string, number> = {};

    for (const [name, pattern] of Object.entries(patterns)) {
      const matches = content.match(pattern);
      if (matches) {
        counts[name] = matches.length;
        findings.push(`Found ${matches.length} instance(s) of ${name}`);
      }
    }

    // Calculate score
    let score = 100;
    let criticalCount = 0;
    let highCount = 0;

    // Critical issues
    if (counts.eval || counts.exec || counts.spawn) {
      criticalCount += (counts.eval || 0) + (counts.exec || 0) + (counts.spawn || 0);
      score -= 30;
    }

    // High severity
    if (counts.dynamicRequire || counts.shellExec) {
      highCount += (counts.dynamicRequire || 0) + (counts.shellExec || 0);
      score -= 15;
    }

    // Medium severity
    if (counts.privateKey || counts.apiKey || counts.secret) {
      score -= 10;
    }

    return {
      score: Math.max(0, score),
      criticalCount,
      highCount,
      warnings: findings,
      patterns: counts
    };
  }

  // 2. Dependency Security
  private async checkDependencies(content: string): Promise<DependencyResult> {
    // Extract package.json dependencies
    const packageJson = this.extractPackageJson(content);
    if (!packageJson) {
      return { score: 50, warnings: ['No package.json found'] };
    }

    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    const warnings: string[] = [];
    let vulnerabilityCount = 0;

    // Check each dependency
    for (const [name, version] of Object.entries(deps)) {
      // Call npm audit API
      const advisory = await this.checkNpmAdvisory(name, version as string);
      if (advisory) {
        vulnerabilityCount += advisory.vulnerabilities;
        warnings.push(`${name}@${version}: ${advisory.severity} vulnerabilities`);
      }
    }

    const score = Math.max(0, 100 - (vulnerabilityCount * 10));

    return {
      score,
      vulnerabilities: vulnerabilityCount,
      warnings,
      dependenciesChecked: Object.keys(deps).length
    };
  }

  // 3. MCP-Specific Security
  private async analyzeMCPSecurity(content: string): Promise<MCPSecurityResult> {
    const warnings: string[] = [];
    let score = 100;

    // Check for dangerous MCP tools
    const dangerousTools = [
      'executeCommand',
      'writeFile',
      'deleteFile',
      'networkRequest',
      'accessSecret'
    ];

    for (const tool of dangerousTools) {
      if (content.includes(tool)) {
        warnings.push(`Tool "${tool}" may be dangerous`);
        score -= 10;
      }
    }

    // Check environment variable requirements
    const envMatches = content.match(/env\.([A-Z_]+)/gi);
    if (envMatches && envMatches.length > 5) {
      warnings.push('Requires many environment variables');
      score -= 5;
    }

    // Check for network calls
    if (content.includes('fetch(') || content.includes('axios.')) {
      warnings.push('Makes network requests');
      score -= 5;
    }

    return {
      score: Math.max(0, score),
      warnings,
      toolsCount: (content.match(/name\s*:/g) || []).length,
      hasNetworkAccess: content.includes('fetch(') || content.includes('axios.')
    };
  }

  // 4. Creator Reputation
  private async checkCreatorReputation(input: ScanInput): Promise<ReputationResult> {
    if (input.type === 'github') {
      const match = input.content.match(/github\.com\/([^\/]+)/);
      if (match) {
        const username = match[1];
        const response = await fetch(`https://api.github.com/users/${username}`);
        const profile = await response.json() as GitHubProfile;

        let score = 50; // Base score

        // Account age
        const accountAge = Date.now() - new Date(profile.created_at).getTime();
        const years = accountAge / (365 * 24 * 60 * 60 * 1000);
        if (years > 2) score += 20;
        else if (years > 1) score += 10;

        // Followers
        if (profile.followers > 100) score += 15;
        else if (profile.followers > 50) score += 10;
        else if (profile.followers > 10) score += 5;

        // Public repos
        if (profile.public_repos > 50) score += 15;
        else if (profile.public_repos > 20) score += 10;

        return {
          score: Math.min(100, score),
          username,
          followers: profile.followers,
          repos: profile.public_repos,
          accountAgeYears: Math.floor(years)
        };
      }
    }

    return { score: 50, unknown: true };
  }

  private calculateScore(results: any): number {
    return Math.round(
      results.codeAnalysis.score * this.WEIGHTS.codeSecurity +
      results.dependencyCheck.score * this.WEIGHTS.dependencySecurity +
      results.mcpSecurity.score * this.WEIGHTS.mcpSecurity +
      results.creatorReputation.score * this.WEIGHTS.reputation
    );
  }

  private determineStatus(
    score: number,
    code: CodeAnalysisResult,
    deps: DependencyResult
  ): 'safe' | 'warning' | 'danger' {
    if (code.criticalCount > 0 || deps.vulnerabilities > 5) {
      return 'danger';
    }
    if (score < 70 || code.highCount > 0 || deps.vulnerabilities > 0) {
      return 'warning';
    }
    return 'safe';
  }

  private async storeResult(data: any): Promise<{ ipfsHash: string; txHash: string }> {
    // 1. Upload full report to IPFS
    const ipfsHash = await this.uploadToIPFS(data);

    // 2. Store hash + score on-chain
    const skillHash = createHash('sha256')
      .update(JSON.stringify(data.input))
      .digest('hex');

    const txHash = await this.submitToContract(skillHash, data.score, data.status, ipfsHash);

    return { ipfsHash, txHash };
  }

  private async uploadToIPFS(data: any): Promise<string> {
    // TODO: Implement IPFS upload
    return 'QmMockHash';
  }

  private async submitToContract(skillHash: string, score: number, status: string, ipfsHash: string): Promise<string> {
    // TODO: Implement blockchain transaction
    return '0xMockTx';
  }

  private async fetchSkillContent(input: ScanInput): Promise<string> {
    switch (input.type) {
      case 'github':
        // Fetch from GitHub API
        const githubMatch = input.content.match(/github\.com\/([^\/]+\/[^\/]+)/);
        if (githubMatch) {
          const repo = githubMatch[1];
          const response = await fetch(`https://api.github.com/repos/${repo}/contents/`);
          // ... fetch skill.md and package.json
        }
        return input.content;

      case 'npm':
        // Fetch from npm registry
        const npmResponse = await fetch(`https://registry.npmjs.org/${input.content}`);
        return npmResponse.body as any;

      case 'markdown':
      case 'openclaw':
      default:
        return input.content;
    }
  }

  private extractPackageJson(content: string): any {
    const match = content.match(/package\.json.*?({[\s\S]*?})\s*<\/code>/);
    if (match) {
      try {
        return JSON.parse(match[1]);
      } catch {}
    }
    return null;
  }

  private async checkNpmAdvisory(name: string, version: string): Promise<any> {
    try {
      const response = await fetch(`https://registry.npmjs.org/-/npm/v1/security/advisories?package=${name}`);
      const data = await response.json();
      // Filter by version and return vulnerabilities
      return data;
    } catch {
      return null;
    }
  }
}

interface CodeAnalysisResult {
  score: number;
  criticalCount: number;
  highCount: number;
  warnings: string[];
  patterns: Record<string, number>;
}

interface DependencyResult {
  score: number;
  vulnerabilities: number;
  warnings: string[];
  dependenciesChecked: number;
}

interface MCPSecurityResult {
  score: number;
  warnings: string[];
  toolsCount: number;
  hasNetworkAccess: boolean;
}

interface ReputationResult {
  score: number;
  username?: string;
  followers?: number;
  repos?: number;
  accountAgeYears?: number;
  unknown?: boolean;
}

interface GitHubProfile {
  login: string;
  created_at: string;
  followers: number;
  public_repos: number;
}
```

---

## API Endpoint for MCP Server

Add to the MCP server:

```typescript
// packages/mcp-server/src/tools/scanSkill.ts

import { SkillScanner } from '@myskills/security-scanner';

export const scanSkillTool = {
  name: 'scan_skill',
  description: 'Scan a skill for security vulnerabilities before installation',
  inputSchema: {
    type: 'object',
    properties: {
      type: {
        type: 'string',
        enum: ['markdown', 'github', 'npm', 'openclaw'],
        description: 'Type of skill reference'
      },
      content: {
        type: 'string',
        description: 'Skill content (markdown text, GitHub URL, npm package name, or OpenClaw plugin reference)'
      }
    },
    required: ['type', 'content']
  }
};

export async function handleScanSkill(input: any): Promise<string> {
  const scanner = new SkillScanner();
  const result = await scanner.scan(input);

  return `
🔍 Security Scan Results

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Overall Score: ${result.score}/100
📌 Status: ${result.status.toUpperCase()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${result.status === 'safe' ? '✅ SAFE TO INSTALL' : result.status === 'warning' ? '⚠️  PROCEED WITH CAUTION' : '🚨 DANGEROUS - DO NOT INSTALL'}

Vulnerabilities Found: ${result.vulnerabilities}

Code Security: ${result.details.codeAnalysis.score}/100
${result.details.codeAnalysis.warnings.map(w => `  • ${w}`).join('\n')}

Dependencies: ${result.details.dependencyCheck.score}/100
${result.details.dependencyCheck.warnings.map(w => `  • ${w}`).join('\n')}

MCP Security: ${result.details.mcpSecurity.score}/100
${result.details.mcpSecurity.warnings.map(w => `  • ${w}`).join('\n')}

Creator Reputation: ${result.details.creatorReputation.score}/100

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
IPFS Report: ${result.ipfsHash}
On-Chain TX: ${result.txHash}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `.trim();
}
```

---

## Usage Examples

### From Claude Desktop
```
User: "Can you check if this skill is safe to install? https://github.com/username/skill-repo"

Claude: [Calls scan_skill tool]
🔍 Security Scan Results
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Overall Score: 87/100
📌 Status: WARNING
⚠️  PROCEED WITH CAUTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Vulnerabilities Found: 0
Warnings: 2

Code Security: 95/100
  • Tool "networkRequest" may be dangerous

Dependencies: 75/100
  • lodash@4.17.21: moderate vulnerabilities

...
```

### From Web UI
```typescript
// User submits GitHub URL
const result = await fetch('/api/scan', {
  method: 'POST',
  body: JSON.stringify({
    type: 'github',
    content: 'https://github.com/username/skill-repo'
  })
});
```

---

## Implementation Checklist

- [ ] Create `packages/security-scanner/` directory
- [ ] Implement `SkillScanner` class with all 4 security checks
- [ ] Deploy `SkillScanReport.sol` contract to Monad testnet
- [ ] Add `scan_skill` tool to MCP server
- [ ] Create IPFS upload integration (Pinata/Web3.Storage)
- [ ] Add web API endpoint for scanning
- [ ] Update demo page to show real scan results
- [ ] Add scan result display to skill detail page
- [ ] Create "Verified Safe" badge for scanned skills

---

## References

- **ClawHub Security Standards**: Post-ClawHavoc improvements
- **OWASP Top 10 for LLM Apps**: LLM security best practices
- **MCP Security Guidelines**: Model Context Protocol security
- **npm Audit**: Known vulnerability database
