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

# Next.js 16 standalone 输出结构已更改
# standalone 输出在 .next/standalone/ 目录下
# 结构: .next/standalone/rebel-agent-skills/frontend/
# 其中包含: server.js, node_modules/, .next/, package.json

# 复制整个 standalone 目录到 /app
# 这会复制所有必需的文件，包括 server.js 在正确的位置
COPY --from=builder /app/.next/standalone/rebel-agent-skills/frontend ./

# 复制 public 目录
COPY --from=builder /app/public ./public

# 复制 .next/static (Next.js 静态资源)
COPY --from=builder /app/.next/static ./.next/static

# 确保 better-sqlite3 原生模块可用
# 在 Next.js 16 standalone 模式下，serverExternalPackages 会处理这个
# 但我们需要确保 .node 二进制文件存在且可访问
RUN ls -la node_modules/better-sqlite3/build/Release/ || echo "Checking better-sqlite3 native bindings"

# 设置权限
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# server.js 现在在工作目录根目录下
CMD ["node", "server.js"]
