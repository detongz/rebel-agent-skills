#!/bin/bash
#
# 启动前端开发服务器（解决 Next.js 目录识别问题）
#

# 进入 frontend 目录
cd /Volumes/Kingstone/workspace/rebel-agent-skills/frontend

# 启动开发服务器
export NODE_ENV=development
npm run dev