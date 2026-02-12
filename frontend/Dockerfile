# Frontend Dockerfile - Multi-stage build for Next.js 16 with better-sqlite3
# Use Node.js 22 LTS for better better-sqlite3 compatibility

FROM node:22-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Install build dependencies for native modules
RUN apk add --no-cache \
    libc6-compat \
    python3 \
    py3-pip \
    make \
    g++ \
    sqlite \
    sqlite-dev \
    build-base \
    pkgconfig

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies with better-sqlite3 built from source
RUN npm config set loglevel error && \
    if [ -f package-lock.json ]; then \
        npm ci --build-from-source=better-sqlite3 --prefer-offline --no-audit; \
    else \
        npm install --build-from-source=better-sqlite3 --prefer-offline --no-audit; \
    fi

# Rebuild the application
FROM base AS builder
RUN apk add --no-cache \
    libc6-compat \
    python3 \
    make \
    g++ \
    sqlite \
    sqlite-dev \
    build-base \
    pkgconfig

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variables
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Rebuild better-sqlite3 for the target environment
RUN npm rebuild better-sqlite3 --build-from-source

# Build Next.js application
RUN npm run build

# Production runner image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Install runtime dependencies
RUN apk add --no-cache sqlite

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone output
# Next.js 16 creates monorepo-aware output: .next/standalone/repo-name/package-name/
COPY --from=builder /app/.next/standalone ./

# Copy public assets to the correct location
RUN mkdir -p rebel-agent-skills/frontend/public && \
    cp -r /app/public/* rebel-agent-skills/frontend/public/ 2>/dev/null || true

# Copy Next.js static files to the correct location
RUN mkdir -p rebel-agent-skills/frontend/.next && \
    cp -r /app/.next/static rebel-agent-skills/frontend/.next/ 2>/dev/null || true

# Verify better-sqlite3 native module exists in the correct location
RUN echo "=== Verifying better-sqlite3 ===" && \
    if [ -f rebel-agent-skills/frontend/node_modules/better-sqlite3/build/Release/better_sqlite3.node ]; then \
        echo "✅ better-sqlite3 verified at correct location"; \
    else \
        echo "ERROR: better-sqlite3 native module not found"; \
        find /app -name "better_sqlite3.node" || true; \
        exit 1; \
    fi

# Verify server.js exists and create entrypoint
RUN echo "=== Verifying server.js ===" && \
    if [ -f server.js ]; then \
        echo "✅ server.js at root" && \
        echo '#!/bin/sh' > /app/entrypoint.sh && \
        echo 'cd /app && exec node server.js' >> /app/entrypoint.sh; \
    elif [ -f frontend/server.js ]; then \
        echo "✅ server.js in frontend/" && \
        echo '#!/bin/sh' > /app/entrypoint.sh && \
        echo 'cd /app/frontend && exec node server.js' >> /app/entrypoint.sh; \
    elif [ -f rebel-agent-skills/frontend/server.js ]; then \
        echo "✅ server.js in rebel-agent-skills/frontend/" && \
        echo '#!/bin/sh' > /app/entrypoint.sh && \
        echo 'cd /app/rebel-agent-skills/frontend && exec node server.js' >> /app/entrypoint.sh; \
    else \
        echo "ERROR: server.js not found" && \
        find /app -maxdepth 4 -name "server.js" || true; \
        echo "" && \
        echo "Directory structure:" && \
        ls -la /app/ || true; \
        exit 1; \
    fi && \
    chmod +x /app/entrypoint.sh

# Set ownership
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

CMD ["/app/entrypoint.sh"]
