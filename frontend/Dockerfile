# Frontend Dockerfile - 构建和生产镜像
# Use Node.js 22 LTS (current) for better better-sqlite3 compatibility
# 与本地开发和 CI 环境保持一致
FROM node:22-alpine AS base

# 安装依赖
FROM base AS deps
# 添加 Python 和构建工具，用于编译 better-sqlite3 等原生模块
# better-sqlite3 需要完整的构建工具链和 Python
RUN apk add --no-cache \
    libc6-compat \
    python3 \
    py3-pip \
    make \
    g++ \
    sqlite \
    sqlite-dev \
    build-base
WORKDIR /app

# 复制 package 文件
COPY package.json package-lock.json* ./

# 安装所有依赖（包括 devDependencies），从源构建 better-sqlite3
RUN if [ -f package-lock.json ]; then npm ci --build-from-source=better-sqlite3; else npm install --build-from-source=better-sqlite3; fi

# 构建阶段
FROM base AS builder
WORKDIR /app
# 添加构建工具（确保 better-sqlite3 可正确编译）
RUN apk add --no-cache \
    libc6-compat \
    python3 \
    make \
    g++ \
    sqlite \
    sqlite-dev \
    build-base

# 从 deps 阶段复制 node_modules
COPY --from=deps /app/node_modules ./node_modules

# 复制 package 文件和源代码
COPY package.json package-lock.json* ./
COPY . .

# 设置 Next.js 构建环境变量
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# 重新构建 better-sqlite3 原生模块（确保与当前环境兼容）
RUN npm rebuild better-sqlite3 --build-from-source

# 构建应用
RUN npm run build

# 验证 standalone 输出目录已创建
RUN echo "=== Verifying build output ===" && \
    ls -la .next/ && \
    echo "=== Standalone directory contents ===" && \
    ls -la .next/standalone/ 2>/dev/null || echo "No .next/standalone found" && \
    echo "=== Looking for server.js ===" && \
    find .next/standalone -type f -name "server.js" 2>/dev/null || echo "server.js not found" && \
    echo "✅ Build verification complete"

# 生产运行阶段
FROM base AS runner
WORKDIR /app

# 安装运行时依赖（better-sqlite3 需要 SQLite 运行时库）
RUN apk add --no-cache sqlite

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# 创建非 root 用户
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Next.js 16 standalone 输出结构
# 尝试检测并复制正确的 standalone 路径
# 脚本会自动找到 server.js 并复制其所在的目录

# 创建临时脚本来检测和复制 standalone 目录
RUN cat > /tmp/copy_standalone.sh << 'EOF'
#!/bin/sh
set -e
echo "=== Detecting standalone directory structure ==="

# 检查可能的 server.js 位置
if [ -f /app/.next/standalone/server.js ]; then
    echo "✅ Found: .next/standalone/server.js (flat structure)"
    cp -a /app/.next/standalone/. /app/standalone_temp/
    STANDALONE_SRC="/app/standalone_temp"
elif [ -f /app/.next/standalone/frontend/server.js ]; then
    echo "✅ Found: .next/standalone/frontend/server.js (workspace structure)"
    cp -a /app/.next/standalone/frontend/. /app/standalone_temp/
    STANDALONE_SRC="/app/standalone_temp"
elif [ -d /app/.next/standalone/rebel-agent-skills ]; then
    echo "✅ Found: .next/standalone/rebel-agent-skills/ directory"
    if [ -f /app/.next/standalone/rebel-agent-skills/frontend/server.js ]; then
        cp -a /app/.next/standalone/rebel-agent-skills/frontend/. /app/standalone_temp/
        STANDALONE_SRC="/app/standalone_temp"
    elif [ -f /app/.next/standalone/rebel-agent-skills/server.js ]; then
        cp -a /app/.next/standalone/rebel-agent-skills/. /app/standalone_temp/
        STANDALONE_SRC="/app/standalone_temp"
    else
        echo "❌ Error: Cannot find server.js in rebel-agent-skills directory"
        find /app/.next/standalone -type f -name "server.js" || true
        exit 1
    fi
else
    echo "❌ Error: Cannot find standalone directory structure"
    find /app/.next -type d -name "standalone" || true
    exit 1
fi

echo "=== Copying standalone files from: $STANDALONE_SRC ==="
cp -a "$STANDALONE_SRC"/. /app/
rm -rf /app/standalone_temp
echo "✅ Standalone files copied successfully"

EOF
RUN chmod +x /tmp/copy_standalone.sh

# 从 builder 复制 standalone 输出
COPY --from=builder /app/.next/standalone /app/.next/standalone

# 运行检测脚本
RUN /tmp/copy_standalone.sh

# 复制 public 目录
COPY --from=builder /app/public ./public

# 复制 .next/static (Next.js 静态资源)
COPY --from=builder /app/.next/static ./.next/static

# 验证关键文件存在
RUN echo "=== Verifying copied files ===" && \
    ls -la /app/ && \
    echo "=== Checking for server.js ===" && \
    ls -la /app/server.js && \
    echo "=== Checking for better-sqlite3 ===" && \
    ls -la /app/node_modules/better-sqlite3/build/Release/ 2>/dev/null || echo "Warning: better-sqlite3 native module not found" && \
    echo "✅ File verification complete"

# 设置权限
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# server.js 现在在工作目录根目录下
CMD ["node", "server.js"]
