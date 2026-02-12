#!/bin/bash
#
# 启动前端开发服务器（解决 Next.js 目录识别问题）
#

cd /Volumes/Kingstone/workspace/rebel-agent-skills/frontend

# 创建必要的 app 和 pages 目录（Next.js App Router 需求）
mkdir -p app pages

# 为每个现有页面创建占位符
for page in create leaderboard bounties agents services x402 skill; do
  touch "app/${page}/page.tsx"
  touch "pages/${page}.tsx"
done

echo "✅ 创建了 Next.js App Router 所需的页面文件"

# 启动开发服务器
export NODE_ENV=development
npx next dev