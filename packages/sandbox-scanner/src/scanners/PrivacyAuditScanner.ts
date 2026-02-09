/**
 * Privacy Audit Scanner - Data leakage and privacy violation detection
 * Detects: PII exposure, data leaks to third parties, encryption status
 */

import { SecurityIssue, ScanOptions, RiskLevel, ScanCategory, DataType, DataLeak, PrivacyReport } from '../types/index.js';

// Patterns for detecting sensitive data types
const SENSITIVE_DATA_PATTERNS: Record<DataType, RegExp[]> = {
  [DataType.EMAIL]: [
    /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/g
  ],
  [DataType.PHONE]: [
    /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g,
    /\b\+?1?[-.]?\(?\d{3}\)?[-.]?\d{3}[-.]?\d{4}\b/g
  ],
  [DataType.SSN]: [
    /\b\d{3}-\d{2}-\d{4}\b/g,
    /\b\d{3}\s\d{2}\s\d{4}\b/g
  ],
  [DataType.CREDIT_CARD]: [
    /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g,
    /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3[0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})\b/g
  ],
  [DataType.API_KEY]: [
    /(['"])?(api[_-]?key|apikey|access[_-]?token|auth[_-]?token|secret[_-]?key|private[_-]?key)\1\s*[:=]\s*['"`]([a-zA-Z0-9_\-]{20,})['"`]/gi,
    /(['"])?(ghp_|gho_|ghu_|ghr_|github_pat_|sk-|AKIA|ya29)['"`]([a-zA-Z0-9_\-]{15,})['"`]/gi,
    /Bearer\s+[a-zA-Z0-9\-._~+/]+=*/gi
  ],
  [DataType.PASSWORD]: [
    /(['"])?(password|passwd|pwd)['"]?\s*[:=]\s*['"`]([^'"`]{4,})['"`]/gi
  ],
  [DataType.TOKEN]: [
    /JWT\s*[:=]\s*['"`]([a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+)['"`]/gi,
    /session[_-]?token\s*[:=]\s*['"`]([a-zA-Z0-9]{20,})['"`]/gi
  ],
  [DataType.ADDRESS]: [
    /\d+\s+[A-Z][a-z]+\s+(Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr)[.,]?\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?,\s*[A-Z]{2}\s*\d{5}/g
  ],
  [DataType.PERSONAL_NAME]: [
    // This is a simplified pattern - would need NLP for accurate detection
    /\b([A-Z][a-z]+)\s+([A-Z][a-z]+)\b/g
  ]
};

// Patterns for detecting third-party API calls
const THIRD_PARTY_API_PATTERNS = [
  /fetch\s*\(\s*['"`](https?:\/\/(?:www\.)?(?!localhost|127\.0\.0\.1|api\.github\.com|registry\.npmjs\.org)[^'"`]+)['"`]/gi,
  /axios\.(get|post|put|delete)\s*\(\s*['"`](https?:\/\/(?:www\.)?(?!localhost|127\.0\.0\.1)[^'"`]+)['"`]/gi,
  /\.get\s*\(\s*['"`](https?:\/\/(?:www\.)?(?!localhost|127\.0\.0\.1)[^'"`]+)['"`]/gi,
  /XMLHttpRequest\.open\s*\(\s*['"](?:GET|POST)['"]\s*,\s*['"`](https?:\/\/(?:www\.)?(?!localhost|127\.0\.0\.1)[^'"`]+)['"`]/gi
];

// Encryption detection patterns
const ENCRYPTION_PATTERNS = [
  /crypto\.createCipher/gi,
  /crypto\.createCipheriv/gi,
  /crypto\.createDecipher/gi,
  /crypto\.createDecipheriv/gi,
  /crypto\.publicEncrypt/gi,
  /crypto\.privateDecrypt/gi,
  /crypto\.scrypt/gi,
  /crypto\.pbkdf2/gi,
  /bcrypt\.hash/gi,
  /bcrypt\.compare/gi,
  /argon2/i,
  /AES\.encrypt/gi,
  /AES\.decrypt/gi,
  /\.encrypt\s*\(/gi,
  /\.decrypt\s*\(/gi,
  /buffer\.from\(.*,\s*['"]base64['"]\)/gi,
  /atob\s*\(/gi,
  /btoa\s*\(/gi,
  /toString\s*\(\s*['"]base64['"]\)/gi
];

export class PrivacyAuditScanner {
  /**
   * Main scan method
   */
  async scan(options: ScanOptions): Promise<SecurityIssue[]> {
    const issues: SecurityIssue[] = [];
    const code = options.agentCode;

    // 1. Detect sensitive data exposure (PII)
    const dataLeaks = this.detectDataLeaks(code, options.agentId);
    if (dataLeaks.length > 0) {
      issues.push({
        id: 'PRIVACY_DATA_LEAK',
        category: ScanCategory.PRIVACY_AUDIT,
        level: RiskLevel.HIGH,
        title: 'Sensitive Data Exposure Detected',
        description: `Found ${dataLeaks.length} instances of potentially sensitive data in code: ${dataLeaks.map(d => d.type).join(', ')}`,
        evidence: dataLeaks.map(d => `${d.type}: ${d.context.substring(0, 50)}...`).join('\n'),
        recommendation: 'Remove sensitive data from code. Move to environment variables or secure vault.'
      });
    }

    // 2. Detect third-party API calls
    const thirdPartyApis = this.detectThirdPartyApis(code);
    if (thirdPartyApis.length > 0) {
      issues.push({
        id: 'PRIVACY_THIRD_PARTY',
        category: ScanCategory.PRIVACY_AUDIT,
        level: RiskLevel.MEDIUM,
        title: 'Third-Party API Calls Detected',
        description: `Found ${thirdPartyApis.length} calls to external third-party APIs: ${thirdPartyApis.join(', ')}`,
        evidence: thirdPartyApis.join('\n'),
        recommendation: 'Review all third-party API calls. Ensure data transmission is authorized and encrypted.'
      });
    }

    // 3. Check encryption status
    const encryptionStatus = this.checkEncryptionStatus(code);
    if (encryptionStatus === 'none') {
      issues.push({
        id: 'PRIVACY_NO_ENCRYPTION',
        category: ScanCategory.PRIVACY_AUDIT,
        level: RiskLevel.MEDIUM,
        title: 'No Encryption Detected',
        description: 'No encryption or hashing functions detected in code. Sensitive data may be stored or transmitted in plaintext.',
        recommendation: 'Implement encryption for sensitive data at rest and in transit. Use established crypto libraries.'
      });
    } else if (encryptionStatus === 'weak') {
      issues.push({
        id: 'PRIVACY_WEAK_ENCRYPTION',
        category: ScanCategory.PRIVACY_AUDIT,
        level: RiskLevel.LOW,
        title: 'Weak Encryption Detected',
        description: 'Code uses deprecated or weak encryption methods (e.g., MD5, SHA1, createCipher without IV).',
        recommendation: 'Upgrade to strong encryption: SHA-256+, AES-256-GCM, bcrypt, scrypt, or argon2.'
      });
    }

    // 4. Check for logging of sensitive data
    const loggingIssues = this.checkLoggingSafety(code);
    issues.push(...loggingIssues);

    // 5. Check data storage patterns
    const storageIssues = this.checkDataStorage(code);
    issues.push(...storageIssues);

    return issues;
  }

  /**
   * Detect sensitive data in code
   */
  private detectDataLeaks(code: string, agentId?: string): DataLeak[] {
    const leaks: DataLeak[] = [];
    const lines = code.split('\n');

    for (const [dataType, patterns] of Object.entries(SENSITIVE_DATA_PATTERNS)) {
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        for (const pattern of patterns) {
          const matches = line.match(pattern);
          if (matches) {
            for (const match of matches) {
              // Skip common false positives
              if (this.isFalsePositive(match, dataType as DataType)) {
                continue;
              }

              leaks.push({
                type: dataType as DataType,
                location: `${agentId || 'agent.js'}:${i + 1}`,
                context: line.trim(),
                risk: this.assessDataTypeRisk(dataType as DataType)
              });
            }
          }
        }
      }
    }

    return leaks;
  }

  /**
   * Check if match is a false positive
   */
  private isFalsePositive(match: string, dataType: DataType): boolean {
    const falsePositives: Record<DataType, RegExp[]> = {
      [DataType.EMAIL]: [
        /@example\.com$/,
        /@test\.com$/,
        /@localhost$/
      ],
      [DataType.PHONE]: [
        /^\d{3}[-.]?\d{3}[-.]?\d{4}$/, // Too generic
        /^000[-.]?\d{3}[-.]?\d{4}$/ // Test numbers
      ],
      [DataType.SSN]: [
        /^000-00-0000$/,
        /^XXX-XX-XXXX$/,
        /^\d{3}-\d{2}-\d{4}$/, // Too generic without context
        /^9\d{2}-\d{2}-\d{4}$/ // SSN samples
      ],
      [DataType.CREDIT_CARD]: [
        /^4111-1111-1111-1111$/, // Test card
        /^4242-4242-4242-4242$/, // Stripe test card
        /^5425-1234-5678-9100$/  // Sample card
      ],
      [DataType.API_KEY]: [
        /api_key\s*[:=]\s*['"]YOUR_API_KEY['"]$/i,
        /api_key\s*[:=]\s*['"]xxx['"]$/i,
        /api_key\s*[:=]\s*['"]\{API_KEY\}['"]$/i
      ],
      [DataType.PASSWORD]: [
        /password\s*[:=]\s*['"]password['"]$/i,
        /password\s*[:=]\s*['"]123456['"]$/i,
        /password\s*[:=]\s*['"]xxx['"]$/i
      ],
      [DataType.TOKEN]: [
        /token\s*[:=]\s*['"]xxx['"]$/i,
        /token\s*[:=]\s*['"]\{TOKEN\}['"]$/i
      ],
      [DataType.ADDRESS]: [],
      [DataType.PERSONAL_NAME]: []
    };

    const patterns = falsePositives[dataType];
    return patterns ? patterns.some(p => p.test(match)) : false;
  }

  /**
   * Assess risk level for data type
   */
  private assessDataTypeRisk(dataType: DataType): RiskLevel {
    const criticalTypes = [DataType.SSN, DataType.CREDIT_CARD, DataType.API_KEY, DataType.PASSWORD];
    const highTypes = [DataType.EMAIL, DataType.PHONE, DataType.TOKEN];
    const mediumTypes = [DataType.ADDRESS, DataType.PERSONAL_NAME];

    if (criticalTypes.includes(dataType)) return RiskLevel.CRITICAL;
    if (highTypes.includes(dataType)) return RiskLevel.HIGH;
    if (mediumTypes.includes(dataType)) return RiskLevel.MEDIUM;
    return RiskLevel.LOW;
  }

  /**
   * Detect third-party API calls
   */
  private detectThirdPartyApis(code: string): string[] {
    const apis = new Set<string>();

    for (const pattern of THIRD_PARTY_API_PATTERNS) {
      let match;
      while ((match = pattern.exec(code)) !== null) {
        // Extract URL from match
        const urlMatch = match[0].match(/https?:\/\/[^'"`]+/);
        if (urlMatch) {
          const url = new URL(urlMatch[0]);
          apis.add(url.hostname);
        }
      }
    }

    return Array.from(apis);
  }

  /**
   * Check encryption status
   */
  private checkEncryptionStatus(code: string): 'strong' | 'weak' | 'none' {
    let hasEncryption = false;
    let hasWeakEncryption = false;

    // Check for strong encryption
    const strongPatterns = [
      /createCipheriv/gi,
      /createDecipheriv/gi,
      /pbkdf2/gi,
      /bcrypt/gi,
      /argon2/gi,
      /scrypt/gi,
      /AES-256-GCM/gi,
      /aes-256-gcm/gi
    ];

    // Check for weak encryption
    const weakPatterns = [
      /createCipher(?!\s*iv)/gi,
      /createDecipher(?!\s*iv)/gi,
      /md5/gi,
      /sha1/gi,
      /\.toString\s*\(\s*['"]base64['"]\)/gi,
      /atob\s*\(/gi,
      /btoa\s*\(/gi
    ];

    for (const pattern of strongPatterns) {
      if (pattern.test(code)) {
        hasEncryption = true;
        break;
      }
    }

    for (const pattern of weakPatterns) {
      if (pattern.test(code)) {
        hasWeakEncryption = true;
      }
    }

    if (hasEncryption && !hasWeakEncryption) return 'strong';
    if (hasWeakEncryption) return 'weak';
    return 'none';
  }

  /**
   * Check if sensitive data is being logged
   */
  private checkLoggingSafety(code: string): SecurityIssue[] {
    const issues: SecurityIssue[] = [];

    // Pattern: console.log with potentially sensitive data
    const unsafeLogPatterns = [
      /console\.(log|debug|info|warn|error)\s*\([^)]*(?:password|token|secret|api[_-]?key|credit[_-]?card|ssn|email)\s*[,)]/gi,
      /logger\.(log|debug|info|warn|error)\s*\([^)]*(?:password|token|secret|api[_-]?key|credit[_-]?card|ssn|email)\s*[,)]/gi,
      /\.log\s*\(\s*(?:req\.body|user\.password|user\.token|user\.email)/gi
    ];

    for (const pattern of unsafeLogPatterns) {
      const matches = code.match(pattern);
      if (matches) {
        issues.push({
          id: 'PRIVACY_LOGGING',
          category: ScanCategory.PRIVACY_AUDIT,
          level: RiskLevel.MEDIUM,
          title: 'Sensitive Data in Logs',
          description: 'Detected logging of potentially sensitive data. Logs may contain passwords, tokens, or PII.',
          evidence: matches.slice(0, 3).join('\n'),
          recommendation: 'Remove sensitive data from logs. Implement log sanitization and use structured logging with data masking.'
        });
        break;
      }
    }

    return issues;
  }

  /**
   * Check data storage patterns
   */
  private checkDataStorage(code: string): SecurityIssue[] {
    const issues: SecurityIssue[] = [];

    // Check for localStorage/sessionStorage usage with sensitive data
    const unsafeStoragePatterns = [
      /localStorage\.(setItem|getItem)\s*\([^)]*(?:password|token|secret|api[_-]?key)/gi,
      /sessionStorage\.(setItem|getItem)\s*\([^)]*(?:password|token|secret|api[_-]?key)/gi
    ];

    for (const pattern of unsafeStoragePatterns) {
      if (pattern.test(code)) {
        issues.push({
          id: 'PRIVACY_STORAGE',
          category: ScanCategory.PRIVACY_AUDIT,
          level: RiskLevel.MEDIUM,
          title: 'Sensitive Data in Browser Storage',
          description: 'Storing sensitive data (tokens, passwords) in localStorage/sessionStorage without encryption.',
          recommendation: 'Avoid storing sensitive data in browser storage. Use httpOnly cookies or secure session management.'
        });
        break;
      }
    }

    // Check for plaintext file storage
    const plaintextWritePattern = /fs\.writeFile\s*\([^)]*,\s*[^)]*\)/gi;
    if (plaintextWritePattern.test(code)) {
      const hasEncryption = ENCRYPTION_PATTERNS.some(p => p.test(code));
      if (!hasEncryption) {
        issues.push({
          id: 'PRIVACY_PLAINTEXT_FILE',
          category: ScanCategory.PRIVACY_AUDIT,
          level: RiskLevel.LOW,
          title: 'Potential Plaintext File Storage',
          description: 'File write operations detected without encryption. Data may be stored in plaintext.',
          recommendation: 'Encrypt sensitive data before writing to files. Use AES-256-GCM or similar.'
        });
      }
    }

    return issues;
  }
}
