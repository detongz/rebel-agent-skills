# Skill 数据采集方案

## npm API 调用

### 1. 获取包下载量

```typescript
// API: https://api.npmjs.org/downloads/point/last-week/@your-scope/your-package
// 示例: https://api.npmjs.org/downloads/point/last-week/axios

interface NpmDownloadsResponse {
  downloads: number;
  start: string;
  end: string;
  package: string;
}

async function getNpmDownloads(packageName: string): Promise<number> {
  const period = 'last-week'; // or 'last-month', 'last-year'
  const url = `https://api.npmjs.org/downloads/point/${period}/${packageName}`;

  const response = await fetch(url);
  const data: NpmDownloadsResponse = await response.json();

  return data.downloads;
}

// 使用示例
const downloads = await getNpmDownloads('axios');
console.log(`周下载量: ${downloads}`); // 周下载量: 12345678
```

### 2. 批量获取多个包的下载量

```typescript
async function getBatchDownloads(packageNames: string[]): Promise<Map<string, number>> {
  const results = new Map<string, number>();

  // npm API 有速率限制，需要分批处理
  const batchSize = 10;
  for (let i = 0; i < packageNames.length; i += batchSize) {
    const batch = packageNames.slice(i, i + batchSize);

    await Promise.all(
      batch.map(async (name) => {
        try {
          const downloads = await getNpmDownloads(name);
          results.set(name, downloads);
        } catch (error) {
          console.error(`获取 ${name} 下载量失败:`, error);
          results.set(name, 0);
        }
      })
    );

    // 避免速率限制，每批之间等待 1 秒
    if (i + batchSize < packageNames.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return results;
}
```

---

## GitHub API 调用

### 1. 获取仓库 stars/forks

```typescript
// API: https://api.github.com/repos/{owner}/{repo}
// 示例: https://api.github.com/repos/facebook/react

interface GitHubRepoResponse {
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  subscribers_count: number;
}

async function getGitHubStats(repoUrl: string): Promise<{ stars: number; forks: number }> {
  // 解析 repo URL
  // e.g., https://github.com/owner/repo -> owner/repo
  const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  if (!match) throw new Error('Invalid GitHub URL');

  const [, owner, repo] = match;
  const url = `https://api.github.com/repos/${owner}/${repo}`;

  const response = await fetch(url, {
    headers: {
      // GitHub API 建议使用 token，可以提高速率限制
      'Authorization': `token ${process.env.GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json'
    }
  });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`);
  }

  const data: GitHubRepoResponse = await response.json();

  return {
    stars: data.stargazers_count,
    forks: data.forks_count
  };
}

// 使用示例
const stats = await getGitHubStats('https://github.com/facebook/react');
console.log(`⭐ ${stats.stars} stars, 🍴 ${stats.forks} forks`);
```

### 2. 批量获取 GitHub 统计

```typescript
async function getBatchGitHubStats(repoUrls: string[]): Promise<Map<string, { stars: number; forks: number }>> {
  const results = new Map();

  // GitHub API 无认证: 60 次/小时
  // 有认证: 5000 次/小时
  for (const url of repoUrls) {
    try {
      const stats = await getGitHubStats(url);
      results.set(url, stats);

      // 避免速率限制
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`获取 ${url} 统计失败:`, error);
    }
  }

  return results;
}
```

---

## Skill 元数据标准（钱包字段）

### 扩展 package.json

```json
{
  "name": "@your-scope/your-agent-skill",
  "version": "1.0.0",
  "description": "Your agent skill description",
  "author": "Your Name",
  "license": "MIT",

  "skill": {
    "displayName": "Your Skill Name",
    "platform": ["coze", "claude-code", "manus", "minimax"],
    "paymentAddress": "0x1234567890abcdef1234567890abcdef12345678",
    "homepage": "https://your-website.com",
    "repository": "https://github.com/your-repo",
    "tags": ["ai", "coding", "automation"]
  }
}
```

### 或使用独立的 skill-manifest.json

```json
{
  "skillId": "your-skill-v1",
  "name": "Your Skill Name",
  "description": "Your skill description",
  "version": "1.0.0",
  "platform": "coze",
  "npmPackage": "@your-scope/your-skill",
  "paymentAddress": "0x1234567890abcdef1234567890abcdef12345678",
  "repository": "https://github.com/your-repo",
  "homepage": "https://your-website.com",
  "tags": ["ai", "coding"],
  "creator": {
    "name": "Your Name",
    "email": "your@email.com",
    "wallet": "0x1234567890abcdef1234567890abcdef12345678"
  }
}
```

---

## 后端定时任务

### 更新 Skill 统计数据

```typescript
// cron job: 每小时执行一次
import { CronJob } from 'cron';

new CronJob('0 * * * *', async () => {
  console.log('开始更新 Skill 统计...');

  // 1. 获取所有已注册的 Skills
  const skills = await db.skills.findMany();

  for (const skill of skills) {
    try {
      // 2. 获取 npm 下载量
      if (skill.npmPackage) {
        const downloads = await getNpmDownloads(skill.npmPackage);
        await db.skills.update({
          where: { id: skill.id },
          data: { downloadCount: downloads }
        });
      }

      // 3. 获取 GitHub 统计
      if (skill.repository) {
        const stats = await getGitHubStats(skill.repository);
        await db.skills.update({
          where: { id: skill.id },
          data: {
            githubStars: stats.stars,
            githubForks: stats.forks
          }
        });
      }

      // 4. 更新缓存
      await redis.del(`skill:detail:${skill.skillId}`);

    } catch (error) {
      console.error(`更新 ${skill.name} 统计失败:`, error);
    }
  }

  console.log('Skill 统计更新完成');
}).start();
```

---

## 前端展示

### Skill 卡片显示

```tsx
// components/SkillCard.tsx
interface SkillCardProps {
  skill: {
    name: string;
    description: string;
    platform: string;
    creator: string;
    downloadCount?: number;
    githubStars?: number;
    githubForks?: number;
    likeCount?: number;
    totalTips: string;
  };
}

export function SkillCard({ skill }: SkillCardProps) {
  return (
    <div className="skill-card">
      <div className="skill-header">
        <span className="platform-badge">{skill.platform}</span>
        <span className="creator">{shortenAddress(skill.creator)}</span>
      </div>

      <h3>{skill.name}</h3>
      <p>{skill.description}</p>

      <div className="skill-stats">
        {skill.downloadCount && (
          <span title="下载量">
            📥 {formatNumber(skill.downloadCount)}
          </span>
        )}
        {skill.githubStars && (
          <span title="GitHub Stars">
            ⭐ {formatNumber(skill.githubStars)}
          </span>
        )}
        {skill.likeCount && (
          <span title="点赞数">
            👍 {formatNumber(skill.likeCount)}
          </span>
        )}
        <span title="累计打赏">
          💰 {formatNumber(skill.totalTips)} ASKL
        </span>
      </div>

      <button onClick={() => openTipModal(skill)}>打赏 💎</button>
    </div>
  );
}
```

### 显示效果

```
┌─────────────────────────────────────┐
│ 🏷️ Claude Code    👤 0xabcd...efgh │
│                                     │
│ AI 写作助手                         │
│ 帮你快速生成高质量文案...           │
│                                     │
│ 📥 12.5K   ⭐ 256   👍 128         │
│ 💰 1,200 ASKL                      │
│                                     │
│            [打赏 💎]                │
└─────────────────────────────────────┘
```

---

## MVP 实施计划

### 黑客松期间（最小实现）

| 优先级 | 功能 | 工作量 |
|--------|------|--------|
| P0 | 用户手动填写下载量 | 1 小时 |
| P0 | 前端展示基础统计 | 2 小时 |
| P1 | npm API 集成 | 3 小时 |
| P1 | GitHub API 集成 | 2 小时 |
| P2 | 定时任务自动更新 | 2 小时 |

### 推荐方案（黑客松）

**阶段 1：先用简单方案**
```
创建 Skill 时，让用户手动填写：
- npm 包名（可选）
- GitHub 仓库（可选）
- 官网/文档链接（可选）

展示时显示：
- 如果有 npm 包名，显示 npm 图标链接
- 如果有 GitHub，显示 stars 数（手动获取一次）
```

**阶段 2：黑客松后迭代**
```
添加定时任务：
- 每小时获取一次 npm 下载量
- 每小时获取一次 GitHub stars
- 更新数据库和缓存
```

---

## API 设计

### GET /api/skills/:skillId/stats

```typescript
// 返回 Skill 的统计数据
interface SkillStats {
  skillId: string;
  name: string;

  // npm 统计
  npmPackage?: string;
  downloads?: {
    week: number;
    month: number;
    total?: number;
  };

  // GitHub 统计
  repository?: string;
  github?: {
    stars: number;
    forks: number;
    issues: number;
  };

  // 平台统计
  platformLikes: number;
  tipCount: number;
  totalTips: string;

  // 最后更新时间
  lastUpdated: string;
}
```

---

## 数据库更新

### skills 表新增字段

```sql
ALTER TABLE skills ADD COLUMN npm_package VARCHAR(255);
ALTER TABLE skills ADD COLUMN repository TEXT;
ALTER TABLE skills ADD COLUMN download_count INTEGER DEFAULT 0;
ALTER TABLE skills ADD COLUMN github_stars INTEGER DEFAULT 0;
ALTER TABLE skills ADD COLUMN github_forks INTEGER DEFAULT 0;
ALTER TABLE skills ADD COLUMN platform_likes INTEGER DEFAULT 0;
ALTER TABLE skills ADD COLUMN stats_updated_at TIMESTAMP;
```

---

## 环境变量

```bash
# .env
GITHUB_TOKEN=ghp_xxxxx  # GitHub Personal Access Token (可选但推荐)
GITHUB_API_RATE_LIMIT=5000  # 有 token 时 5000 次/小时

NPM_API_RATE_LIMIT=100  # npm API 没有严格的速率限制，但建议控制

STATS_UPDATE_INTERVAL=3600000  # 更新间隔（毫秒），默认 1 小时
```
