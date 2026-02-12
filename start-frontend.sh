#!/bin/bash
#
# 启动前端开发服务器
#

# 进入 frontend 目录
cd /Volumes/Kingstone/workspace/rebel-agent-skills/frontend

# 启动开发服务器
export NODE_ENV=development
npx next dev