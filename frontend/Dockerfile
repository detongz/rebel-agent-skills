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
# But when building from frontend/ context, it should be at .next/standalone/frontend/
COPY --from=builder /app/.next/standalone ./

# Debug: Show the directory structure
RUN echo "=== Standalone output structure ===" && \
    find /app -maxdepth 3 -type f -name "server.js" 2>/dev/null || true && \
    echo "=== Root directory contents ===" && \
    ls -la /app/ && \
    echo "=== Checking for frontend directory ===" && \
    ls -la /app/frontend/ 2>/dev/null || echo "No frontend directory at root"

# Determine the actual application directory and copy assets accordingly
RUN APP_DIR=$(find /app -maxdepth 3 -type d -name "node_modules" | head -1 | xargs dirname) && \
    echo "Detected app directory: $APP_DIR" && \
    mkdir -p $APP_DIR/public && \
    cp -r /app/public/* $APP_DIR/public/ 2>/dev/null || true && \
    mkdir -p $APP_DIR/.next && \
    cp -r /app/.next/static $APP_DIR/.next/ 2>/dev/null || true

# Verify better-sqlite3 native module exists in the correct location
RUN echo "=== Verifying better-sqlite3 ===" && \
    APP_DIR=$(find /app -maxdepth 3 -type d -name "node_modules" | head -1 | xargs dirname) && \
    if [ -f $APP_DIR/node_modules/better-sqlite3/build/Release/better_sqlite3.node ]; then \
        echo "✅ better-sqlite3 verified at $APP_DIR/node_modules/better-sqlite3/build/Release/better_sqlite3.node"; \
    else \
        echo "ERROR: better-sqlite3 native module not found"; \
        find /app -name "better_sqlite3.node" || true; \
        exit 1; \
    fi

# Verify server.js exists and create entrypoint
RUN echo "=== Verifying server.js ===" && \
    APP_DIR=$(find /app -maxdepth 3 -type d -name "node_modules" | head -1 | xargs dirname) && \
    echo "Using app directory: $APP_DIR" && \
    if [ -f $APP_DIR/server.js ]; then \
        echo "✅ server.js found at $APP_DIR/server.js" && \
        echo "#!/bin/sh" > /app/entrypoint.sh && \
        echo "cd $APP_DIR && exec node server.js" >> /app/entrypoint.sh; \
    elif [ -f /app/server.js ]; then \
        echo "✅ server.js found at /app/server.js" && \
        echo "#!/bin/sh" > /app/entrypoint.sh && \
        echo "cd /app && exec node server.js" >> /app/entrypoint.sh; \
    else \
        echo "ERROR: server.js not found" && \
        find /app -maxdepth 4 -name "server.js" || true; \
        echo "" && \
        echo "Directory structure:" && \
        ls -laR /app/ || true; \
        exit 1; \
    fi && \
    chmod +x /app/entrypoint.sh

# Set ownership
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

CMD ["/app/entrypoint.sh"]
