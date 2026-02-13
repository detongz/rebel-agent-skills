# Frontend Dockerfile - Simplified build for Next.js
FROM node:22-alpine AS base

# Install dependencies for native modules (better-sqlite3)
RUN apk add --no-cache python3 make g++

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build Next.js application
RUN npm run build

# Production runner stage
FROM node:22-alpine AS runner

# Install curl for health check
RUN apk add --no-cache curl

# Set working directory
WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy package files
COPY package.json package-lock.json* ./

# Copy dependencies
COPY --from=base /app/node_modules ./node_modules

# Copy build output from base stage
COPY --from=base /app/.next/standalone ./
COPY --from=base /app/.next/static ./.next/static

# Copy public files
COPY --from=base /app/public ./public

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

# Expose port
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 CMD curl -f http://localhost:3000/ || exit 1

# Start Next.js server (standalone mode uses this entry point)
CMD ["node", "server.js"]
