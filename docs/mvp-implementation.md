# 阶段 1 MVP 实施方案（黑客松版）

## 数据库设计更新

### skills 表（完整字段）

```sql
CREATE TABLE skills (
  -- 基础字段
  id SERIAL PRIMARY KEY,
  skill_id BYTEA NOT NULL UNIQUE,        -- 链上 skillId (bytes32)
  name VARCHAR(255) NOT NULL,
  description TEXT,
  platform VARCHAR(50) NOT NULL,          -- 'coze' | 'claude-code' | 'manus' | 'minimax'
  version VARCHAR(50),

  -- 收款相关（核心！）
  creator_address VARCHAR(42) NOT NULL,   -- 创作者钱包地址
  payment_address VARCHAR(42) NOT NULL,   -- 收款地址（可以和 creator 不同）

  -- 外部链接（阶段 1 添加）
  npm_package VARCHAR(255),               -- npm 包名，如 "@scope/package-name"
  repository TEXT,                        -- GitHub 仓库 URL
  homepage TEXT,                          -- 官网/文档 URL

  -- 统计数据（手动填写，阶段 1）
  download_count INTEGER DEFAULT 0,       -- 手动填写的下载量展示
  github_stars INTEGER DEFAULT 0,         -- 手动获取一次后缓存
  github_forks INTEGER DEFAULT 0,

  -- 平台数据
  total_tips NUMERIC DEFAULT 0,           -- 累计打赏（从链上读取）
  platform_likes INTEGER DEFAULT 0,       -- 平台内点赞数

  -- 元数据
  logo_url TEXT,                          -- Skill 图标
  tags TEXT[],                            -- 标签数组
  status VARCHAR(20) DEFAULT 'active',    -- 'active' | 'hidden' | 'deleted'

  -- 时间戳
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  stats_updated_at TIMESTAMP              -- 统计数据更新时间
);

-- 索引
CREATE INDEX idx_skills_platform ON skills(platform);
CREATE INDEX idx_skills_creator ON skills(creator_address);
CREATE INDEX idx_skills_payment ON skills(payment_address);
CREATE INDEX idx_skills_tips ON skills(total_tips DESC);
CREATE INDEX idx_skills_likes ON skills(platform_likes DESC);
```

---

## 前端表单设计

### 创建 Skill 表单（阶段 1）

```tsx
// app/create-skill/page.tsx

'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';

export default function CreateSkillPage() {
  const { address } = useAccount();
  const [formData, setFormData] = useState({
    // 必填字段
    name: '',
    description: '',
    platform: '',
    version: '1.0.0',
    paymentAddress: address || '',  // 默认当前钱包

    // 可选字段（阶段 1）
    npmPackage: '',
    repository: '',
    homepage: '',

    // 其他
    tags: [],
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. 生成 skillId
      const skillId = generateSkillId(formData.name, formData.version, formData.platform);

      // 2. 调用智能合约注册
      const tx = await contract.registerSkill(
        skillId,
        formData.name,
        formData.paymentAddress
      );
      await tx.wait();

      // 3. 保存元数据到后端
      await fetch('/api/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skillId,
          ...formData,
          creatorAddress: address,
        }),
      });

      // 4. 成功！
      alert('Skill 创建成功！获得 500 ASKL 奖励');
      router.push(`/skills/${skillId}`);

    } catch (error) {
      console.error('创建失败:', error);
      alert('创建失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">📝 创建新的 Agent Skill</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ===== 必填字段 ===== */}

        <div>
          <label className="block mb-2 font-medium">
            Skill 名称 *
          </label>
          <input
            type="text"
            required
            placeholder="例如: Claude Code Copilot"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">
            描述 *
          </label>
          <textarea
            required
            placeholder="描述这个 Skill 的功能..."
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">
            所属平台 *
          </label>
          <div className="grid grid-cols-2 gap-4">
            {['coze', 'claude-code', 'manus', 'minimax'].map((platform) => (
              <label key={platform} className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="platform"
                  value={platform}
                  required
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                />
                <span className="capitalize">{platform}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block mb-2 font-medium">
            版本号
          </label>
          <input
            type="text"
            defaultValue="1.0.0"
            placeholder="1.0.0"
            onChange={(e) => setFormData({ ...formData, version: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">
            收款钱包地址 *
          </label>
          <input
            type="text"
            required
            placeholder="0x..."
            value={formData.paymentAddress}
            onChange={(e) => setFormData({ ...formData, paymentAddress: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg font-mono"
          />
          <p className="text-sm text-gray-500 mt-1">
            默认使用当前钱包，也可以填写其他地址
          </p>
        </div>

        {/* ===== 可选字段（阶段 1）===== */}

        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">📎 外部链接（可选）</h3>

          <div className="space-y-4">
            <div>
              <label className="block mb-2 font-medium text-gray-700">
                npm 包名
              </label>
              <input
                type="text"
                placeholder="@scope/package-name"
                value={formData.npmPackage}
                onChange={(e) => setFormData({ ...formData, npmPackage: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              />
              <p className="text-sm text-gray-500 mt-1">
                填写后将显示下载量统计
              </p>
            </div>

            <div>
              <label className="block mb-2 font-medium text-gray-700">
                GitHub 仓库
              </label>
              <input
                type="url"
                placeholder="https://github.com/owner/repo"
                value={formData.repository}
                onChange={(e) => setFormData({ ...formData, repository: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              />
              <p className="text-sm text-gray-500 mt-1">
                填写后将显示 stars/forks
              </p>
            </div>

            <div>
              <label className="block mb-2 font-medium text-gray-700">
                官网/文档
              </label>
              <input
                type="url"
                placeholder="https://your-website.com"
                value={formData.homepage}
                onChange={(e) => setFormData({ ...formData, homepage: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* ===== 提交 ===== */}

        <div className="flex items-center justify-between pt-6">
          <p className="text-sm text-green-600">
            🆓 创建 Skill 即可获得 500 $MSKL 奖励！
          </p>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border rounded-lg"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg disabled:opacity-50"
            >
              {loading ? '创建中...' : '创建 Skill 🚀'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
```

---

## Skill 卡片展示（阶段 1）

```tsx
// components/SkillCard.tsx

interface SkillCardProps {
  skill: {
    name: string;
    description: string;
    platform: string;
    paymentAddress: string;
    totalTips: string;

    // 可选字段
    npmPackage?: string;
    repository?: string;
    homepage?: string;
    downloadCount?: number;
    githubStars?: number;
    githubForks?: number;
  };
}

export function SkillCard({ skill }: SkillCardProps) {
  return (
    <div className="border rounded-xl p-6 hover:shadow-lg transition">
      {/* 头部：平台 + 创作者 */}
      <div className="flex items-center justify-between mb-4">
        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm capitalize">
          {skill.platform}
        </span>
        <span className="text-sm text-gray-500 font-mono">
          👤 {shortenAddress(skill.paymentAddress)}
        </span>
      </div>

      {/* 名称和描述 */}
      <h3 className="text-xl font-bold mb-2">{skill.name}</h3>
      <p className="text-gray-600 mb-4 line-clamp-2">{skill.description}</p>

      {/* 外部链接 */}
      <div className="flex gap-2 mb-4">
        {skill.npmPackage && (
          <a
            href={`https://www.npmjs.com/package/${skill.npmPackage}`}
            target="_blank"
            className="text-red-500 hover:text-red-600"
          >
            📦 npm
          </a>
        )}
        {skill.repository && (
          <a
            href={skill.repository}
            target="_blank"
            className="text-gray-700 hover:text-gray-900"
          >
            🐙 GitHub
          </a>
        )}
        {skill.homepage && (
          <a
            href={skill.homepage}
            target="_blank"
            className="text-blue-500 hover:text-blue-600"
          >
            🔗 官网
          </a>
        )}
      </div>

      {/* 统计数据 */}
      <div className="flex items-center gap-4 text-sm text-gray-600 border-t pt-4">
        {skill.downloadCount > 0 && (
          <span title="下载量">📥 {formatNumber(skill.downloadCount)}</span>
        )}
        {skill.githubStars > 0 && (
          <span title="GitHub Stars">⭐ {formatNumber(skill.githubStars)}</span>
        )}
        {skill.githubForks > 0 && (
          <span title="GitHub Forks">🍴 {formatNumber(skill.githubForks)}</span>
        )}
        <span title="累计打赏" className="font-semibold text-purple-600">
          💰 {formatNumber(skill.totalTips)} ASKL
        </span>
      </div>

      {/* 打赏按钮 */}
      <button
        onClick={() => openTipModal(skill)}
        className="w-full mt-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:opacity-90"
      >
        打赏 💎
      </button>
    </div>
  );
}

// 辅助函数
function shortenAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatNumber(num: number | string): string {
  const n = typeof num === 'string' ? parseFloat(num) : num;
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}
```

---

## 后端 API（阶段 1）

### POST /api/skills - 创建 Skill

```typescript
// app/api/skills/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 验证必填字段
    const { skillId, name, description, platform, paymentAddress, creatorAddress } = body;
    if (!skillId || !name || !description || !platform || !paymentAddress) {
      return NextResponse.json(
        { error: '缺少必��字段' },
        { status: 400 }
      );
    }

    // 保存到数据库
    const skill = await db.skills.create({
      data: {
        skill_id: Buffer.from(skillId.slice(2), 'hex'),
        name,
        description,
        platform,
        version: body.version || '1.0.0',
        creator_address: creatorAddress,
        payment_address: paymentAddress,

        // 可选字段
        npm_package: body.npmPackage || null,
        repository: body.repository || null,
        homepage: body.homepage || null,

        // 标签
        tags: body.tags || [],
      },
    });

    // 如果有 GitHub 仓库，获取一次 stars
    if (body.repository) {
      try {
        const stats = await getGitHubStats(body.repository);
        await db.skills.update({
          where: { id: skill.id },
          data: {
            github_stars: stats.stars,
            github_forks: stats.forks,
            stats_updated_at: new Date(),
          },
        });
      } catch (error) {
        console.error('获取 GitHub 统计失败:', error);
      }
    }

    return NextResponse.json({ success: true, skill });

  } catch (error) {
    console.error('创建 Skill 失败:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}
```

### GET /api/skills - 获取 Skills 列表

```typescript
// app/api/skills/route.ts

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const platform = searchParams.get('platform');
    const sort = searchParams.get('sort') || 'tips';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // 构建查询条件
    const where: any = { status: 'active' };
    if (platform) {
      where.platform = platform;
    }

    // 排序
    let orderBy: any = { created_at: 'desc' };
    if (sort === 'tips') orderBy = { total_tips: 'desc' };
    if (sort === 'likes') orderBy = { platform_likes: 'desc' };
    if (sort === 'downloads') orderBy = { download_count: 'desc' };

    // 查询
    const [skills, total] = await Promise.all([
      db.skills.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.skills.count({ where }),
    ]);

    return NextResponse.json({
      skills: skills.map(skill => ({
        id: skill.id,
        skillId: skill.skill_id.toString('hex'),
        name: skill.name,
        description: skill.description,
        platform: skill.platform,
        paymentAddress: skill.payment_address,
        totalTips: skill.total_tips.toString(),

        // 可选字段
        npmPackage: skill.npm_package,
        repository: skill.repository,
        homepage: skill.homepage,
        downloadCount: skill.download_count,
        githubStars: skill.github_stars,
        githubForks: skill.github_forks,
        platformLikes: skill.platform_likes,
        createdAt: skill.created_at,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error('获取 Skills 失败:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}
```

---

## 简单的 API 调用工具

```typescript
// lib/github-api.ts

interface GitHubStats {
  stars: number;
  forks: number;
}

export async function getGitHubStats(repoUrl: string): Promise<GitHubStats> {
  try {
    // 解析 GitHub URL
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) {
      throw new Error('Invalid GitHub URL');
    }

    const [, owner, repo] = match;
    const url = `https://api.github.com/repos/${owner}/${repo}`;

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        // 可选：添加 GitHub token 提高速率限制
        ...(process.env.GITHUB_TOKEN && {
          'Authorization': `token ${process.env.GITHUB_TOKEN}`,
        }),
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      stars: data.stargazers_count || 0,
      forks: data.forks_count || 0,
    };

  } catch (error) {
    console.error('获取 GitHub 统计失败:', error);
    return { stars: 0, forks: 0 };
  }
}
```

```typescript
// lib/npm-api.ts

export async function getNpmDownloads(packageName: string): Promise<number> {
  try {
    const url = `https://api.npmjs.org/downloads/point/last-week/${packageName}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`npm API error: ${response.status}`);
    }

    const data = await response.json();
    return data.downloads || 0;

  } catch (error) {
    console.error('获取 npm 下载量失败:', error);
    return 0;
  }
}
```

---

## 环境变量

```bash
# .env.local

# GitHub Token（可选，但推荐）
# 获取方式: GitHub Settings -> Developer settings -> Personal access tokens
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx

# 数据库（先占位，后续配置）
DATABASE_URL=postgresql://...

# 智能合约地址
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_CHAIN_ID=41454
NEXT_PUBLIC_RPC_URL=https://testnet-rpc.monad.xyz
```

---

## 阶段 1 检查清单

### 数据库
- [x] skills 表设计完成（包含 payment_address 等新字段）
- [ ] 执行 SQL 创建表

### 前端
- [ ] 创建 Skill 页面（带表单）
- [ ] Skill 卡片组件（展示外部链接）
- [ ] Skills 列表页面

### 后端 API
- [ ] POST /api/skills（创建 Skill）
- [ ] GET /api/skills（获取列表）
- [ ] GET /api/skills/:id（获取详情）

### 工具函数
- [x] getGitHubStats（获取 GitHub stars）
- [x] getNpmDownloads（获取 npm 下载量）

---

## 下一步

你想先从哪个开始做？
1. **建数据库表**（SQL 脚本）
2. **搭建前端项目**（Next.js + Tailwind）
3. **编写后端 API**（API Routes）
