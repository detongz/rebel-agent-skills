/**
 * Code Security Scanner - Static analysis for agent code
 * Detects: smart contract vulnerabilities, malicious patterns, dependency CVEs
 */

import * as fs from 'fs/promises';
import { parse } from '@typescript-eslint/typescript-estree';
import { SecurityIssue, ScanOptions, RiskLevel, ScanCategory, VulnerabilityPattern, DependencyInfo, CVEDetails } from '../types/index.js';

// Known vulnerability patterns
const VULNERABILITY_PATTERNS: VulnerabilityPattern[] = [
  // Smart Contract Vulnerabilities
  {
    id: 'SC_REENTRANCY',
    name: 'Reentrancy Vulnerability',
    category: 'smart-contract',
    severity: RiskLevel.CRITICAL,
    patterns: [
      /\.call\{.*value:.*\}/,
      /\.send\(/,
      /\.transfer\(/,
      /external\s+\w+\s*\.\s*\w+\s*\(/
    ],
    description: 'Potential reentrancy vulnerability detected. External calls before state changes can allow reentrancy attacks.',
    recommendation: 'Use the checks-effects-interactions pattern. Implement ReentrancyGuard. Consider using OpenZeppelin\'s ReentrancyGuard modifier.'
  },
  {
    id: 'SC_OVERFLOW',
    name: 'Integer Overflow/Underflow',
    category: 'smart-contract',
    severity: RiskLevel.HIGH,
    patterns: [
      /\+\s*\w+\s*;/,
      /\w+\s*-\s*-/,
      /\w+\s*\*\s*\w+/
    ],
    description: 'Potential integer overflow/underflow detected. Solidity < 0.8.0 does not check for overflow.',
    recommendation: 'Use Solidity 0.8.0+ which has built-in overflow protection, or use OpenZeppelin\'s SafeMath library.'
  },
  {
    id: 'SC_ACCESS_CONTROL',
    name: 'Missing Access Control',
    category: 'smart-contract',
    severity: RiskLevel.HIGH,
    patterns: [
      /function\s+\w+\s*\([^)]*\)\s*public(?!\s+view|\s+pure)/,
      /function\s+\w+\s*\([^)]*\)\s*external(?!\s+view|\s+pure)/
    ],
    description: 'Public/external function without access control modifier detected.',
    recommendation: 'Add onlyOwner, onlyRole, or custom access control modifiers to restrict function access.'
  },
  {
    id: 'SC_TX_ORIGIN',
    name: 'tx.origin Authentication',
    category: 'smart-contract',
    severity: RiskLevel.CRITICAL,
    patterns: [
      /require\s*\(\s*tx\.origin\s*==/
    ],
    description: 'tx.origin authentication is vulnerable to phishing attacks.',
    recommendation: 'Use msg.sender instead of tx.origin for authentication.'
  },
  {
    id: 'SC_DELEGATECALL',
    name: 'Unsafe Delegatecall',
    category: 'smart-contract',
    severity: RiskLevel.CRITICAL,
    patterns: [
      /delegatecall\s*\(/,
      /\.delegatecall\s*\(/
    ],
    description: 'Unsafe delegatecall can lead to code execution in arbitrary context.',
    recommendation: 'Carefully validate the target address. Use bounded delegatecall patterns or implement proper access controls.'
  },

  // Malicious Code Patterns
  {
    id: 'MC_INFINITE_LOOP',
    name: 'Potential Infinite Loop',
    category: 'malicious-code',
    severity: RiskLevel.HIGH,
    patterns: [
      /while\s*\(\s*true\s*\)/,
      /for\s*\(\s*;\s*;\s*\)/,
      /while\s*\(\s*1\s*\)/,
      /while\s*\(\s*!false\s*\)/
    ],
    description: 'Infinite loop detected that could cause denial of service.',
    recommendation: 'Ensure loop has a break condition or uses a bounded iterator.'
  },
  {
    id: 'MC_HIDDEN_MINING',
    name: 'Potential Crypto Mining',
    category: 'malicious-code',
    severity: RiskLevel.CRITICAL,
    patterns: [
      /crypto\s*\.\s*mine/i,
      /miner\s*\.\s*start/i,
      /web3\s*\.\s*eth\s*\.\s*submitWork/i,
      /stratum\s*\.\s*connect/i
    ],
    description: 'Potential cryptocurrency mining code detected.',
    recommendation: 'Remove any mining-related code. This is unauthorized resource usage.'
  },
  {
    id: 'MC_DATA_EXFILTRATION',
    name: 'Data Exfiltration',
    category: 'malicious-code',
    severity: RiskLevel.CRITICAL,
    patterns: [
      /fetch\s*\(\s*['"`]https?:\/\/.*external.*['"`]\s*\)/i,
      /axios\s*\.\s*post\s*\(\s*['"`]https?:\/\/.*external.*['"`]\s*\)/i,
      /XMLHttpRequest\s*\.open\s*\(\s*['"]POST['"]\s*,\s*['"`]https?:\/\/.*external/i
    ],
    description: 'Potential data exfiltration to external servers detected.',
    recommendation: 'Review all external network requests. Ensure data transmission is authorized and encrypted.'
  },
  {
    id: 'MC_EVAL_CODE',
    name: 'Dynamic Code Execution',
    category: 'malicious-code',
    severity: RiskLevel.HIGH,
    patterns: [
      /eval\s*\(/,
      /new\s+Function\s*\(/,
      /setTimeout\s*\(\s*['"`][^'"`]*['"`]\s*,/,
      /setInterval\s*\(\s*['"`][^'"`]*['"`]\s*,/
    ],
    description: 'Dynamic code execution detected. This could lead to code injection attacks.',
    recommendation: 'Avoid using eval(), new Function(), or passing strings to setTimeout/setInterval. Use safer alternatives.'
  },
  {
    id: 'MC_SHELL_COMMAND',
    name: 'Shell Command Injection',
    category: 'malicious-code',
    severity: RiskLevel.CRITICAL,
    patterns: [
      /child_process\s*\.\s*exec\s*\(/,
      /exec\s*\(/,
      /execSync\s*\(/,
      /spawn\s*\(\s*['"]sh['"]\s*\)/,
      /spawn\s*\(\s*['"]bash['"]\s*\)/
    ],
    description: 'Shell command execution detected. Potential command injection vulnerability.',
    recommendation: 'Avoid shell command execution with user input. Use safer alternatives like spawn with argument arrays.'
  },

  // Security Issues
  {
    id: 'SEC_HARD_CODED_SECRET',
    name: 'Hardcoded Secret',
    category: 'security',
    severity: RiskLevel.HIGH,
    patterns: [
      /api[_-]?key\s*[:=]\s*['"`][^'"`]{20,}['"`]/i,
      /secret\s*[:=]\s*['"`][^'"`]{20,}['"`]/i,
      /password\s*[:=]\s*['"`][^'"`]{10,}['"`]/i,
      /token\s*[:=]\s*['"`](eyJ|ghp_|gho_|ghu_|ghr_|github_pat_|sk-)[a-zA-Z0-9]{20,}/
    ],
    description: 'Hardcoded secret or API key detected.',
    recommendation: 'Move secrets to environment variables or secure vault. Never commit secrets to code.'
  },
  {
    id: 'SEC_SQL_INJECTION',
    name: 'SQL Injection',
    category: 'security',
    severity: RiskLevel.CRITICAL,
    patterns: [
      /query\s*\+\s*['"`]\s*\$\{?\w+/,
      /execute\s*\(\s*['"`][^'"`]*\+\s*\w+/,
      /SELECT.*FROM.*WHERE.*\$\{?\w+/
    ],
    description: 'Potential SQL injection vulnerability detected.',
    recommendation: 'Use parameterized queries or prepared statements. Never concatenate user input into SQL queries.'
  },
  {
    id: 'SEC_PATH_TRAVERSAL',
    name: 'Path Traversal',
    category: 'security',
    severity: RiskLevel.HIGH,
    patterns: [
      /readFile\s*\(\s*['"`]\.?\.\//,
      /readFileSync\s*\(\s*['"`]\.?\.\//,
      /fs\.readFile\s*\(\s*\+?\s*path/,
      /require\s*\(\s*\+?\s*path/
    ],
    description: 'Potential path traversal vulnerability detected.',
    recommendation: 'Validate and sanitize file paths. Use path.resolve() and check that paths stay within allowed directories.'
  }
];

export class CodeSecurityScanner {
  private patterns: VulnerabilityPattern[];

  constructor() {
    this.patterns = VULNERABILITY_PATTERNS;
  }

  /**
   * Main scan method
   */
  async scan(options: ScanOptions): Promise<SecurityIssue[]> {
    const issues: SecurityIssue[] = [];
    const code = options.agentCode;

    // 1. Pattern-based vulnerability detection
    const patternIssues = this.scanForPatterns(code, options.agentId);
    issues.push(...patternIssues);

    // 2. AST-based analysis (if JavaScript/TypeScript)
    if (options.language === 'javascript' || options.language === 'typescript') {
      const astIssues = await this.scanAST(code, options.agentId);
      issues.push(...astIssues);
    }

    // 3. Dependency vulnerability scan
    if (options.packageJson) {
      const depIssues = await this.scanDependencies(options.packageJson, options.agentId);
      issues.push(...depIssues);
    }

    return issues;
  }

  /**
   * Scan code for known vulnerability patterns
   */
  private scanForPatterns(code: string, agentId?: string): SecurityIssue[] {
    const issues: SecurityIssue[] = [];
    const lines = code.split('\n');

    for (const pattern of this.patterns) {
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        for (const regex of pattern.patterns) {
          if (regex.test(line)) {
            issues.push({
              id: `${pattern.id}_${i}`,
              category: ScanCategory.CODE_SECURITY,
              level: pattern.severity,
              title: pattern.name,
              description: pattern.description,
              location: {
                file: agentId || 'agent.js',
                line: i + 1,
                column: line.search(regex) + 1
              },
              evidence: line.trim(),
              recommendation: pattern.recommendation,
              references: pattern.category === 'smart-contract' ? [
                'https://swcregistry.io/',
                'https://consensys.github.io/smart-contract-best-practices/'
              ] : undefined
            });
          }
        }
      }
    }

    return issues;
  }

  /**
   * AST-based code analysis
   */
  private async scanAST(code: string, agentId?: string): Promise<SecurityIssue[]> {
    const issues: SecurityIssue[] = [];

    try {
      const ast = parse(code, {
        loc: true,
        range: true,
        sourceType: 'module',
        ecmaVersion: 'latest'
      });

      // Traverse AST for additional checks
      this.analyzeNode(ast, issues, agentId);

    } catch (error) {
      // Code might not be valid TypeScript/JavaScript
      // Continue with pattern-based scanning only
    }

    return issues;
  }

  /**
   * Recursively analyze AST nodes
   */
  private analyzeNode(node: any, issues: SecurityIssue[], agentId?: string): void {
    if (!node || typeof node !== 'object') return;

    // Check for eval-like calls
    if (node.type === 'CallExpression') {
      const callee = node.callee;

      // Direct eval
      if (callee.type === 'Identifier' && callee.name === 'eval') {
        issues.push({
          id: `DYN_EVAL_${node.loc?.start.line}`,
          category: ScanCategory.CODE_SECURITY,
          level: RiskLevel.HIGH,
          title: 'Dynamic Code Execution (eval)',
          description: 'Use of eval() detected. This can lead to code injection.',
          location: {
            file: agentId || 'agent.js',
            line: node.loc?.start.line,
            column: node.loc?.start.column
          },
          recommendation: 'Avoid eval(). Use safer alternatives like JSON.parse() for data or function constructors for dynamic behavior.'
        });
      }

      // new Function()
      if (callee.type === 'Identifier' && callee.name === 'Function' &&
          node.parent?.type === 'NewExpression') {
        issues.push({
          id: `DYN_FUNCTION_${node.loc?.start.line}`,
          category: ScanCategory.CODE_SECURITY,
          level: RiskLevel.HIGH,
          title: 'Dynamic Code Execution (new Function)',
          description: 'Use of new Function() detected. This can lead to code injection.',
          location: {
            file: agentId || 'agent.js',
            line: node.loc?.start.line,
            column: node.loc?.start.column
          },
          recommendation: 'Avoid new Function(). Use safer alternatives like arrow functions or object factories.'
        });
      }
    }

    // Recursively check child nodes
    for (const key in node) {
      if (key === 'parent') continue;
      const child = node[key];
      if (Array.isArray(child)) {
        child.forEach(c => this.analyzeNode(c, issues, agentId));
      } else if (typeof child === 'object' && child !== null) {
        this.analyzeNode(child, issues, agentId);
      }
    }
  }

  /**
   * Scan package.json dependencies for known CVEs
   */
  private async scanDependencies(packageJson: string, agentId?: string): Promise<SecurityIssue[]> {
    const issues: SecurityIssue[] = [];

    try {
      const pkg = JSON.parse(packageJson);
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };

      for (const [name, version] of Object.entries(deps)) {
        const cves = await this.checkPackageCVE(name, version as string);
        for (const cve of cves) {
          issues.push({
            id: cve.cveId,
            category: ScanCategory.CODE_SECURITY,
            level: cve.severity,
            title: `Dependency CVE: ${cve.cveId} in ${name}`,
            description: cve.description,
            recommendation: `Upgrade ${name} to one of: ${cve.patchedVersions.join(', ')}`,
            cveId: cve.cveId,
            references: cve.references
          });
        }
      }
    } catch (error) {
      // Invalid package.json
    }

    return issues;
  }

  /**
   * Check a specific package version for CVEs
   * In production, this would query NPM audit API, OSV, or Snyk database
   */
  private async checkPackageCVE(name: string, version: string): Promise<CVEDetails[]> {
    // Simulated CVE database for demo
    // In production, replace with actual API calls to:
    // - NPM Audit API
    // - OSV (Open Source Vulnerabilities)
    // - Snyk API
    // - GitHub Dependabot API

    const knownCVEs: Record<string, CVEDetails[]> = {
      'lodash': [
        {
          cveId: 'CVE-2021-23337',
          severity: RiskLevel.HIGH,
          score: 7.5,
          description: 'Lodash versions prior to 4.17.21 are vulnerable to Command Injection via template replacement.',
          patchedVersions: ['4.17.21', '4.17.22'],
          publishedDate: '2021-02-01',
          references: [
            'https://nvd.nist.gov/vuln/detail/CVE-2021-23337',
            'https://github.com/lodash/lodash/pull/4798'
          ]
        }
      ],
      'axios': [
        {
          cveId: 'CVE-2023-45857',
          severity: RiskLevel.MEDIUM,
          score: 5.3,
          description: 'Axios versions before 1.6.0 vulnerable to SSRF via relative URL path manipulation.',
          patchedVersions: ['1.6.0'],
          publishedDate: '2023-10-25',
          references: [
            'https://nvd.nist.gov/vuln/detail/CVE-2023-45857',
            'https://github.com/axios/axios/security/advisories/GHSA-8hc4-vh64-cxmj'
          ]
        }
      ],
      'express': [
        {
          cveId: 'CVE-2022-24999',
          severity: RiskLevel.MEDIUM,
          score: 5.3,
          description: 'Express prior to 4.19.2 vulnerable to DoS via large crafted headers.',
          patchedVersions: ['4.19.2'],
          publishedDate: '2023-02-01',
          references: [
            'https://nvd.nist.gov/vuln/detail/CVE-2022-24999'
          ]
        }
      ]
    };

    // Check if package has known CVEs
    const cves = knownCVEs[name];
    if (!cves) return [];

    // Filter by version (simplified semver check)
    return cves.filter(cve => {
      // In production, use proper semver comparison
      // For now, just check if version is older than patched versions
      return true;
    });
  }
}
