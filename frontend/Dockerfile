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
# 在一个单独的构建阶段中处理目录结构检测和复制

# 复制 standalone 输出（包含 server.js 和必要的 node_modules）
COPY --from=builder /app/.next/standalone ./

# 复制 public 目录到正确位置
COPY --from=builder /app/public ./public

# 复制 .next/static (Next.js 静态资源)
COPY --from=builder /app/.next/static ./apps/frontend/.next/static

# 处理 better-sqlite3 原生模块
# 从 builder 阶段复制编译好的 better-sqlite3
COPY --from=builder /app/node_modules/better-sqlite3 ./node_modules/better-sqlite3

# 验证关键文件存在并设置正确的结构
RUN echo "=== Verifying Docker image structure ===" && \
    echo "Root directory contents:" && \
    ls -la /app/ && \
    echo "" && \
    echo "Looking for server.js:" && \
    find /app -maxdepth 3 -type f -name "server.js" && \
    echo "" && \
    echo "Checking better-sqlite3 native module:" && \
    if [ -f /app/node_modules/better-sqlite3/build/Release/better_sqlite3.node ]; then \
        echo "✅ better-sqlite3 native module found at /app/node_modules/better-sqlite3/build/Release/better_sqlite3.node"; \
        file /app/node_modules/better-sqlite3/build/Release/better_sqlite3.node; \
    else \
        echo "❌ better-sqlite3 native module NOT found"; \
        find /app -name "better_sqlite3.node" || echo "No .node file found anywhere"; \
    fi && \
    echo "" && \
    echo "✅ Structure verification complete"

# 如果 server.js 在 apps/frontend 子目录中，创建一个入口点来正确启动
RUN if [ -f /app/apps/frontend/server.js ]; then \
        echo "Found server.js in apps/frontend/ - setting up as main entry"; \
        # 创建启动脚本，从 apps/frontend 目录运行
        echo '#!/bin/sh' > /app/entrypoint.sh && \
        echo 'cd /app/apps/frontend && exec node server.js "$@"' >> /app/entrypoint.sh && \
        chmod +x /app/entrypoint.sh && \
        WORK_DIR="/app/apps/frontend"; \
    elif [ -f /app/frontend/server.js ]; then \
        echo "Found server.js in frontend/ - setting up as main entry"; \
        echo '#!/bin/sh' > /app/entrypoint.sh && \
        echo 'cd /app/frontend && exec node server.js "$@"' >> /app/entrypoint.sh && \
        chmod +x /app/entrypoint.sh && \
        WORK_DIR="/app/frontend"; \
    elif [ -f /app/server.js ]; then \
        echo "Found server.js in root - using as main entry"; \
        echo '#!/bin/sh' > /app/entrypoint.sh && \
        echo 'cd /app && exec node server.js "$@"' >> /app/entrypoint.sh && \
        chmod +x /app/entrypoint.sh && \
        WORK_DIR="/app"; \
    else \
        echo "❌ Error: Cannot find server.js in expected locations"; \
        find /app -name "server.js" || true; \
        exit 1; \
    fi

# 设置工作目录和权限
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# 使用入口点脚本启动（会切换到正确的目录）
CMD ["/app/entrypoint.sh"]
