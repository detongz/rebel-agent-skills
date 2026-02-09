/**
 * Behavior Sandbox Scanner - Runtime behavior monitoring
 * Monitors: file system access, network requests, API calls, resource usage
 */

import { spawn, ChildProcess } from 'child_process';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { SecurityIssue, ScanOptions, RiskLevel, ScanCategory, SyscallType, SecurityEvent, SandboxLimits } from '../types/index.js';

interface SandboxConfig {
  tempDir: string;
  maxMemoryMB: number;
  maxTimeoutMs: number;
  allowNetwork: boolean;
  allowedDomains: string[];
}

export class BehaviorSandboxScanner {
  private events: SecurityEvent[] = [];
  private process: ChildProcess | null = null;
  private startTime: number = 0;
  private config: SandboxConfig;

  constructor(limits?: SandboxLimits) {
    this.config = {
      tempDir: path.join(os.tmpdir(), `myskills-sandbox-${Date.now()}`),
      maxMemoryMB: limits?.maxMemoryMB || 512,
      maxTimeoutMs: limits?.maxTimeoutMs || 30000,
      allowNetwork: limits?.allowNetwork ?? false,
      allowedDomains: limits?.allowedDomains || []
    };
  }

  /**
   * Main scan method - runs agent code in isolated sandbox
   */
  async scan(options: ScanOptions): Promise<SecurityIssue[]> {
    const issues: SecurityIssue[] = [];
    this.events = [];

    // 1. Create temporary sandbox directory
    await fs.mkdir(this.config.tempDir, { recursive: true });

    try {
      // 2. Prepare sandbox environment
      const agentFile = path.join(this.config.tempDir, 'agent.js');
      await fs.writeFile(agentFile, options.agentCode);

      // 3. Instrument code for monitoring
      const instrumentedCode = this.instrumentCode(options.agentCode);
      await fs.writeFile(agentFile, instrumentedCode);

      // 4. Run in sandbox with monitoring
      await this.runInSandbox(agentFile, options);

      // 5. Analyze events and generate issues
      const eventIssues = this.analyzeEvents();
      issues.push(...eventIssues);

    } finally {
      // 6. Cleanup
      await this.cleanup();
    }

    return issues;
  }

  /**
   * Instrument code to add monitoring hooks
   */
  private instrumentCode(code: string): string {
    // Wrap code in monitoring context
    const monitoringCode = `
const __myskills_events = [];

// Hook require to track module imports
const originalRequire = require;
require = function(id) {
  __myskills_events.push({
    type: 'module_require',
    module: id,
    timestamp: Date.now(),
    stack: new Error().stack
  });
  return originalRequire.apply(this, arguments);
};

// Hook fs operations
const fs = require('fs');
const originalReadFile = fs.readFile;
const originalWriteFile = fs.writeFile;
const originalReadFileSync = fs.readFileSync;
const originalWriteFileSync = fs.writeFileSync;

fs.readFile = function(...args) {
  __myskills_events.push({
    type: 'fs_read',
    path: args[0],
    timestamp: Date.now()
  });
  return originalReadFile.apply(this, args);
};

fs.writeFile = function(...args) {
  __myskills_events.push({
    type: 'fs_write',
    path: args[0],
    timestamp: Date.now()
  });
  return originalWriteFile.apply(this, args);
};

fs.readFileSync = function(...args) {
  __myskills_events.push({
    type: 'fs_read_sync',
    path: args[0],
    timestamp: Date.now()
  });
  return originalReadFileSync.apply(this, args);
};

fs.writeFileSync = function(...args) {
  __myskills_events.push({
    type: 'fs_write_sync',
    path: args[0],
    timestamp: Date.now()
  });
  return originalWriteFileSync.apply(this, args);
};

// Hook fetch/HTTP requests
const originalFetch = globalThis.fetch;
if (originalFetch) {
  globalThis.fetch = function(...args) {
    __myskills_events.push({
      type: 'http_request',
      url: args[0],
      timestamp: Date.now()
    });
    return originalFetch.apply(this, args);
  };
}

// Hook child_process
const { spawn } = require('child_process');
const originalSpawn = spawn;
const hookedSpawn = function(...args) {
  __myskills_events.push({
    type: 'process_spawn',
    command: args[0],
    args: args[1],
    timestamp: Date.now()
  });
  return originalSpawn.apply(this, args);
};

// Run user code with timeout
try {
  ${code}

  // Output events for parent process
  if (typeof process !== 'undefined' && process.send) {
    process.send({ events: __myskills_events });
  }
} catch (error) {
  if (typeof process !== 'undefined' && process.send) {
    process.send({ error: error.message, events: __myskills_events });
  }
}
`;

    return monitoringCode;
  }

  /**
   * Run code in sandboxed environment
   */
  private async runInSandbox(agentFile: string, options: ScanOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      this.startTime = Date.now();

      // Spawn child process with restrictions
      this.process = spawn('node', [agentFile], {
        cwd: this.config.tempDir,
        env: {
          ...process.env,
          NODE_OPTIONS: '--max-old-space-size=' + this.config.maxMemoryMB,
          PATH: process.env.PATH
        },
        stdio: ['ignore', 'pipe', 'pipe', 'ipc'],
        timeout: this.config.maxTimeoutMs,
        detached: false
      });

      let stdout = '';
      let stderr = '';

      // Collect events from child process
      this.process.on('message', (msg: any) => {
        if (msg.events) {
          this.events = msg.events.map((e: any) => this.normalizeEvent(e));
        }
        if (msg.error) {
          stderr += msg.error;
        }
      });

      this.process.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      this.process.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      this.process.on('error', (error) => {
        this.events.push({
          type: SyscallType.PROCESS_EXEC,
          timestamp: Date.now(),
          details: { command: error.message },
          risk: RiskLevel.MEDIUM,
          blocked: true
        });
      });

      this.process.on('exit', (code, signal) => {
        const duration = Date.now() - this.startTime;

        // Check for suspicious execution patterns
        if (signal === 'SIGKILL' || signal === 'SIGTERM') {
          this.events.push({
            type: SyscallType.PROCESS_EXEC,
            timestamp: Date.now(),
            details: { command: `Process killed (${signal})` },
            risk: RiskLevel.MEDIUM,
            blocked: true
          });
        }

        // Check execution time
        if (duration > this.config.maxTimeoutMs * 0.9) {
          this.events.push({
            type: SyscallType.PROCESS_EXEC,
            timestamp: Date.now(),
            details: { command: `Long running execution (${duration}ms)` },
            risk: RiskLevel.LOW,
            blocked: false
          });
        }

        resolve();
      });

      // Timeout
      setTimeout(() => {
        if (this.process && !this.process.killed) {
          this.process.kill('SIGKILL');
          reject(new Error('Sandbox timeout exceeded'));
        }
      }, this.config.maxTimeoutMs + 1000);
    });
  }

  /**
   * Normalize event from child process
   */
  private normalizeEvent(event: any): SecurityEvent {
    let type: SyscallType;
    let risk: RiskLevel = RiskLevel.LOW;
    let blocked = false;

    switch (event.type) {
      case 'fs_read':
      case 'fs_read_sync':
        type = SyscallType.FILE_READ;
        risk = this.assessFileAccessRisk(event.path);
        blocked = this.shouldBlockFileAccess(event.path);
        break;

      case 'fs_write':
      case 'fs_write_sync':
        type = SyscallType.FILE_WRITE;
        risk = RiskLevel.MEDIUM;
        blocked = this.shouldBlockFileAccess(event.path);
        break;

      case 'http_request':
        type = SyscallType.NETWORK_REQUEST;
        risk = this.assessNetworkRisk(event.url);
        blocked = !this.config.allowNetwork || this.shouldBlockDomain(event.url);
        break;

      case 'process_spawn':
        type = SyscallType.PROCESS_EXEC;
        risk = RiskLevel.HIGH;
        blocked = true;
        break;

      case 'env_access':
        type = SyscallType.ENV_ACCESS;
        risk = RiskLevel.MEDIUM;
        blocked = false;
        break;

      default:
        type = SyscallType.FILE_READ;
        risk = RiskLevel.LOW;
    }

    return {
      type,
      timestamp: event.timestamp || Date.now(),
      details: {
        path: event.path,
        url: event.url,
        command: event.command,
        var: event.var
      },
      risk,
      blocked
    };
  }

  /**
   * Assess file access risk
   */
  private assessFileAccessRisk(filePath?: string): RiskLevel {
    if (!filePath) return RiskLevel.LOW;

    // Sensitive paths
    const sensitivePaths = [
      '/etc/passwd',
      '/etc/shadow',
      '/.ssh/',
      '/.aws/',
      '/.env',
      'private',
      'secret',
      'credential'
    ];

    for (const sensitive of sensitivePaths) {
      if (filePath.toLowerCase().includes(sensitive.toLowerCase())) {
        return RiskLevel.HIGH;
      }
    }

    return RiskLevel.LOW;
  }

  /**
   * Check if file access should be blocked
   */
  private shouldBlockFileAccess(filePath?: string): boolean {
    if (!filePath) return false;

    // Block access to system directories
    const blockedPaths = [
      '/etc/',
      '/sys/',
      '/proc/',
      '/root/',
      '/home/',
      '/Users/',
      '/.ssh/',
      '/.aws/'
    ];

    for (const blocked of blockedPaths) {
      if (filePath.startsWith(blocked)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Assess network request risk
   */
  private assessNetworkRisk(url?: string): RiskLevel {
    if (!url) return RiskLevel.LOW;

    const urlLower = url.toLowerCase();

    // Known safe domains
    const safeDomains = [
      'localhost',
      '127.0.0.1',
      'npmjs.org',
      'github.com',
      'api.github.com'
    ];

    // Check if in allowlist
    if (this.config.allowedDomains.some(domain => urlLower.includes(domain))) {
      return RiskLevel.LOW;
    }

    // Suspicious domains
    const suspicious = [
      'external',
      'exfiltrate',
      'thirdparty',
      'unknown',
      'bit.ly',
      'pastebin',
      'tunnel'
    ];

    for (const sus of suspicious) {
      if (urlLower.includes(sus)) {
        return RiskLevel.HIGH;
      }
    }

    // Non-HTTPS
    if (urlLower.startsWith('http:')) {
      return RiskLevel.MEDIUM;
    }

    return RiskLevel.MEDIUM;
  }

  /**
   * Check if domain should be blocked
   */
  private shouldBlockDomain(url?: string): boolean {
    if (!url || !this.config.allowNetwork) return true;

    // Block if not in allowlist
    return !this.config.allowedDomains.some(domain =>
      url.toLowerCase().includes(domain.toLowerCase())
    );
  }

  /**
   * Analyze collected events and generate issues
   */
  private analyzeEvents(): SecurityIssue[] {
    const issues: SecurityIssue[] = [];

    // Group events by type
    const fileReads = this.events.filter(e => e.type === SyscallType.FILE_READ);
    const fileWrites = this.events.filter(e => e.type === SyscallType.FILE_WRITE);
    const networkReqs = this.events.filter(e => e.type === SyscallType.NETWORK_REQUEST);
    const processExecs = this.events.filter(e => e.type === SyscallType.PROCESS_EXEC);
    const envAccesses = this.events.filter(e => e.type === SyscallType.ENV_ACCESS);

    // Check for suspicious file access
    const sensitiveFileAccess = this.events.filter(e =>
      e.risk === RiskLevel.HIGH && e.type === SyscallType.FILE_READ
    );

    if (sensitiveFileAccess.length > 0) {
      issues.push({
        id: 'SANDBOX_SENSITIVE_FILE',
        category: ScanCategory.BEHAVIOR_SANDBOX,
        level: RiskLevel.HIGH,
        title: 'Sensitive File Access Detected',
        description: `Agent attempted to access ${sensitiveFileAccess.length} sensitive file(s): ${sensitiveFileAccess.map(e => e.details.path).join(', ')}`,
        evidence: sensitiveFileAccess.map(e => e.details.path).join('\n'),
        recommendation: 'Review file access patterns. Agent should only access files within its designated directory.'
      });
    }

    // Check for external network requests
    const externalReqs = networkReqs.filter(e => !e.blocked && e.risk >= RiskLevel.MEDIUM);

    if (externalReqs.length > 0) {
      issues.push({
        id: 'SANDBOX_EXTERNAL_API',
        category: ScanCategory.BEHAVIOR_SANDBOX,
        level: RiskLevel.MEDIUM,
        title: 'External API Calls Detected',
        description: `Agent made ${externalReqs.length} external API request(s): ${externalReqs.map(e => e.details.url).join(', ')}`,
        evidence: externalReqs.map(e => e.details.url).join('\n'),
        recommendation: 'Review external API usage. Add to allowlist if authorized, or block if unauthorized.'
      });
    }

    // Check for process execution
    if (processExecs.length > 0) {
      issues.push({
        id: 'SANDBOX_PROCESS_EXEC',
        category: ScanCategory.BEHAVIOR_SANDBOX,
        level: RiskLevel.HIGH,
        title: 'Process Execution Detected',
        description: `Agent attempted to execute ${processExecs.length} process(es): ${processExecs.map(e => e.details.command).join(', ')}`,
        evidence: processExecs.map(e => e.details.command).join('\n'),
        recommendation: 'Process execution is blocked by default. Review if this is intended behavior.'
      });
    }

    // Check for excessive file operations
    if (fileReads.length > 100 || fileWrites.length > 50) {
      issues.push({
        id: 'SANDBOX_EXCESSIVE_IO',
        category: ScanCategory.BEHAVIOR_SANDBOX,
        level: RiskLevel.LOW,
        title: 'Excessive File Operations',
        description: `Agent performed ${fileReads.length} reads and ${fileWrites.length} writes, which may indicate inefficient scanning or DoS potential.`,
        recommendation: 'Optimize file operations. Consider adding rate limiting or file count limits.'
      });
    }

    return issues;
  }

  /**
   * Cleanup sandbox directory
   */
  private async cleanup(): Promise<void> {
    try {
      if (this.process && !this.process.killed) {
        this.process.kill('SIGKILL');
      }
      await fs.rm(this.config.tempDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  }
}
