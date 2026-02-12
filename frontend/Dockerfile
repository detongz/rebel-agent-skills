# Frontend Dockerfile - 构建和生产镜像
FROM node:20-alpine AS base

# 安装依赖
FROM base AS deps
# 添加 Python 和构建工具，用于编译 better-sqlite3 等原生模块
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app

# 复制 package 文件
COPY package.json ./
COPY package-lock.json* ./
# 安装所有依赖（包括 devDependencies）
RUN npm ci || npm install

# 构建阶段
FROM base AS builder
WORKDIR /app
# 添加构建工具
RUN apk add --no-cache libc6-compat python3 make g++

# 从 deps 阶段复制 node_modules
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY package-lock.json* ./
COPY . .

# 设置 Next.js 构建环境变量
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# 构建应用
RUN npm run build

# 生产运行阶段
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# 创建非 root 用户
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 复制必要文件
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# 设置权限
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
