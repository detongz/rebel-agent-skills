/**
 * MySkills Shared Module
 *
 * Main entry point for all shared functionality used by:
 * - MCP Server
 * - OpenClaw Plugin
 * - CLI tools
 * - Frontend API routes
 */

// Core blockchain functionality (existing)
export * from './core.js';

// Type definitions - use namespace import to avoid conflicts
export * as Types from './types/index.js';

// Configuration management - use namespace import to avoid conflicts
export * as Config from './config/index.js';

// API client layer - use namespace import to avoid conflicts
export * as Api from './api/index.js';

// GitHub integration - use namespace import to avoid conflicts
export * as GitHub from './github/index.js';

// Local registry management - use namespace import to avoid conflicts
export * as Registry from './registry/index.js';
