/**
 * API 模块单元测试
 *
 * 测试 @myskills/shared/api 模块的功能
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';

// Mock fetch 用于测试
const mockFetch = jest.fn();

describe('@myskills/shared/api - API Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock global fetch
    global.fetch = mockFetch;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Client - API 基础请求', () => {
    it('apiPost 应该发送 POST 请求', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: [] })
      } as Response);

      const result = await import('@myskills/shared/api/client').apiPost('/api/test', { test: 'data' });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/test'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        })
      );
      expect(result.success).toBe(true);
    });

    it('apiPost 应该处理 API 错误响应', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => ({ success: false, error: 'Not found' })
      } as Response);

      await expect(
        import('@myskills/shared/api/client').apiPost('/api/test', {})
      ).rejects.toThrow('API Error: 404');
    });
  });

  describe('Search - 搜索功能', () => {
    it('searchSkills 应该发送搜索请求', async () => {
      const mockResponse = {
        success: true,
        data: [
          {
            name: 'Test Skill',
            platform: 'claude-code',
            source: 'local' as const,
            installCommand: 'npx myskills install test-skill'
          }
        ],
        count: 1,
        query: 'test'
      };
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      } as Response);

      const result = await import('@myskills/shared/api/search').searchSkills('test query');
      expect(result.data).toHaveLength(1);
      expect(result.data[0].name).toBe('Test Skill');
    });
  });

  describe('Scan - 安全扫描功能', () => {
    it('scanSkill 应该发送扫描请求', async () => {
      const mockResponse = {
        success: true,
        data: {
          id: 'scan-123',
          url: 'https://github.com/user/repo',
          score: 85,
          status: 'safe' as const,
          vulnerabilities: 0,
          warnings: [],
          details: {
            codeAnalysis: { score: 90, findings: [] },
            dependencyCheck: { score: 80, warnings: [] }
          },
          createdAt: new Date().toISOString()
        }
      };
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      } as Response);

      const result = await import('@myskills/shared/api/scan').scanSkill('https://github.com/user/repo');
      expect(result.success).toBe(true);
      expect(result.data.score).toBe(85);
      expect(result.data.status).toBe('safe');
    });
  });

  describe('GitHub - GitHub 集成', () => {
    it('parseGitHubUrl 应该解析 GitHub URL', () => {
      const parser = import('@myskills/shared/github/parser');

      expect(parser.parseGitHubUrl('https://github.com/owner/repo')).toEqual({
        owner: 'owner',
        repo: 'repo'
      });

      expect(parser.parseGitHubUrl('github:owner/repo')).toEqual({
        owner: 'owner',
        repo: 'repo'
      });

      expect(parser.parseGitHubUrl('owner/repo')).toEqual({
        owner: 'owner',
        repo: 'repo'
      });
    });

    it('parseGitHubUrl 应该处理 .git 后缀', () => {
      const parser = import('@myskills/shared/github/parser');

      const result = parser.parseGitHubUrl('https://github.com/owner/repo.git');
      expect(result).toEqual({
        owner: 'owner',
        repo: 'repo' // .git should be removed
      });
    });

    it('parseGitHubUrl 对无效 URL 应该返回 null', () => {
      const parser = import('@myskills/shared/github/parser');

      expect(parser.parseGitHubUrl('invalid-url')).toBeNull();
      expect(parser.parseGitHubUrl('https://example.com')).toBeNull();
    });
  });

  describe('Registry - 本地注册表管理', () => {
    it('loadRegistry 应该返回注册表', async () => {
      const mockSkills = [
        { id: 'skill-1', name: 'Skill 1', creator: '0x123', createdAt: Date.now() }
      ];
      const mockRegistry = { skills: mockSkills };

      // Mock fs.readFileSync
      const fs = await import('fs');
      jest.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify(mockRegistry));

      const registry = await import('@myskills/shared/registry').loadRegistry();
      expect(registry.skills).toEqual(mockSkills);
    });
  });
});
