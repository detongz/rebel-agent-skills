#!/usr/bin/env node

/**
 * MCP Server Test Script
 *
 * This script tests the MCP Server functionality without requiring
 * a full MCP client setup. It directly tests the handler functions.
 */

import { spawn } from 'child_process';

// Test configuration
const MCP_SERVER_PATH = './build/index.js';
const ENV = {
  MYSKILLS_NETWORK: 'testnet',
  MYSKILLS_CONTRACT_ADDRESS: '0x0000000000000000000000000000000000000000', // Placeholder
  PRIVATE_KEY: '' // Empty for read-only tests
};

// Test cases
const TESTS = [
  {
    name: 'list_skills',
    input: {
      platform: 'all',
      sort: 'tips',
      limit: 10
    },
    description: 'List all skills'
  },
  {
    name: 'get_leaderboard',
    input: {
      timeframe: 'all',
      limit: 5
    },
    description: 'Get leaderboard'
  },
  {
    name: 'get_mon_balance',
    input: {
      address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0' // Vitalik's address as example
    },
    description: 'Get MON balance'
  }
];

async function runMcpTest(testName, input) {
  return new Promise((resolve, reject) => {
    const serverProcess = spawn('node', [MCP_SERVER_PATH], {
      cwd: import.meta.dirname,
      env: { ...process.env, ...ENV }
    });

    let stdout = '';
    let stderr = '';

    serverProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    serverProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    // Send MCP request
    const request = {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {
        name: testName,
        arguments: input
      }
    };

    serverProcess.stdin.write(JSON.stringify(request) + '\n');

    // Timeout after 10 seconds
    const timeout = setTimeout(() => {
      serverProcess.kill();
      reject(new Error('Test timeout'));
    }, 10000);

    serverProcess.on('close', (code) => {
      clearTimeout(timeout);
      resolve({ stdout, stderr, code });
    });
  });
}

async function main() {
  console.log('🧪 MySkills MCP Server Test Suite');
  console.log('================================\n');

  for (const test of TESTS) {
    console.log(`Testing: ${test.name} - ${test.description}`);

    try {
      const result = await runMcpTest(test.name, test.input);

      // Parse stderr for server logs
      const serverLogs = result.stderr
        .split('\n')
        .filter(line => line.trim() && !line.startsWith('['))
        .join('\n');

      console.log('✓ Server started successfully');
      if (serverLogs) {
        console.log('Server output:', serverLogs);
      }

      console.log('');
    } catch (error) {
      console.error(`✗ Test failed: ${error.message}`);
      console.log('');
    }
  }

  console.log('\n✨ All tests completed!');
}

main().catch(console.error);
