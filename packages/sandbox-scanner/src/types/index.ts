/**
 * Core types for MySkills Sandbox Security Scanner
 */

// ============================================
// Scan Result Types
// ============================================

export enum RiskLevel {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  SAFE = 'safe'
}

export enum ScanCategory {
  CODE_SECURITY = 'code_security',
  BEHAVIOR_SANDBOX = 'behavior_sandbox',
  PRIVACY_AUDIT = 'privacy_audit'
}

export interface SecurityIssue {
  id: string;
  category: ScanCategory;
  level: RiskLevel;
  title: string;
  description: string;
  location?: {
    file: string;
    line?: number;
    column?: number;
  };
  evidence?: string;
  recommendation: string;
  cveId?: string;
  references?: string[];
}

export interface CategoryScore {
  category: ScanCategory;
  score: number; // 0-100
  issues: SecurityIssue[];
  checks: {
    name: string;
    passed: boolean;
    details?: string;
  }[];
}

export interface ScanResult {
  agentId: string;
  timestamp: string;
  overallScore: number; // 0-100
  riskLevel: RiskLevel;
  categories: {
    codeSecurity: CategoryScore;
    behaviorSandbox: CategoryScore;
    privacyAudit: CategoryScore;
  };
  summary: {
    totalIssues: number;
    criticalIssues: number;
    highIssues: number;
    mediumIssues: number;
    lowIssues: number;
  };
  recommendations: string[];
}

// ============================================
// Scan Options Types
// ============================================

export interface ScanOptions {
  agentCode: string;
  agentId?: string;
  language?: 'javascript' | 'typescript' | 'python';
  packageJson?: string;
  enableCodeScan?: boolean;
  enableBehaviorScan?: boolean;
  enablePrivacyScan?: boolean;
  timeout?: number;
  sandboxLimits?: SandboxLimits;
}

export interface SandboxLimits {
  maxMemoryMB?: number;
  maxTimeoutMs?: number;
  allowNetwork?: boolean;
  allowedDomains?: string[];
  maxFileSize?: number;
}

// ============================================
// Code Scanner Types
// ============================================

export interface VulnerabilityPattern {
  id: string;
  name: string;
  category: 'smart-contract' | 'malicious-code' | 'security';
  severity: RiskLevel;
  patterns: RegExp[];
  description: string;
  recommendation: string;
}

export interface DependencyInfo {
  name: string;
  version: string;
  vulnerabilities?: CVEDetails[];
}

export interface CVEDetails {
  cveId: string;
  severity: RiskLevel;
  score: number;
  description: string;
  patchedVersions: string[];
  publishedDate: string;
  references: string[];
}

// ============================================
// Behavior Monitor Types
// ============================================

export enum SyscallType {
  FILE_READ = 'file_read',
  FILE_WRITE = 'file_write',
  NETWORK_REQUEST = 'network_request',
  PROCESS_EXEC = 'process_exec',
  ENV_ACCESS = 'env_access'
}

export interface SecurityEvent {
  type: SyscallType;
  timestamp: number;
  details: {
    path?: string;
    url?: string;
    command?: string;
    var?: string;
    data?: string;
  };
  risk: RiskLevel;
  blocked: boolean;
}

export interface BehaviorReport {
  events: SecurityEvent[];
  summary: {
    fileAccessCount: number;
    networkRequests: number;
    externalApiCalls: number;
    suspiciousOperations: number;
  };
}

// ============================================
// Privacy Audit Types
// ============================================

export enum DataType {
  EMAIL = 'email',
  PHONE = 'phone',
  SSN = 'ssn',
  CREDIT_CARD = 'credit_card',
  API_KEY = 'api_key',
  PASSWORD = 'password',
  TOKEN = 'token',
  ADDRESS = 'address',
  PERSONAL_NAME = 'personal_name'
}

export interface DataLeak {
  type: DataType;
  location: string;
  context: string;
  risk: RiskLevel;
}

export interface PrivacyReport {
  leaks: DataLeak[];
  thirdPartyApis: string[];
  encryptionStatus: 'encrypted' | 'partial' | 'none';
  dataStorage: 'local' | 'remote' | 'mixed';
}

// ============================================
// Scanner Interface
// ============================================

export interface IScanner {
  name: string;
  category: ScanCategory;
  scan(options: ScanOptions): Promise<SecurityIssue[]>;
}
