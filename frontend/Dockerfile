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

# Copy package files and .npmrc to fix Next.js 16 Turbopack workspace detection
COPY package.json package-lock.json* .npmrc* ./

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
# Use --webpack flag to disable Turbopack and avoid workspace root detection issues in Docker
RUN npm run build -- --webpack

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

# Copy standalone output with dynamic path detection
# Next.js 16 creates monorepo-aware output structure that varies by build context
# The structure can be: .next/standalone/ or .next/standalone/repo-name/frontend/
# We need to detect and handle both cases
COPY --from=builder /app/.next/standalone /tmp/standalone

# Debug: Show standalone structure
RUN echo "=== Standalone directory structure ===" && \
    ls -la /tmp/standalone/ && \
    echo "=== Looking for server.js ===" && \
    find /tmp/standalone -maxdepth 4 -name "server.js" -type f

# Detect and set up the correct application directory
RUN echo "=== Detecting application directory ===" && \
    # Check if there's a direct standalone output (no repo subdirectory)
    if [ -f /tmp/standalone/server.js ]; then \
        echo "Found standalone output at /tmp/standalone/" && \
        cp -r /tmp/standalone/* /app/ && \
        APP_DIR="/app"; \
    # Check if there's a repo-name/frontend structure
    elif [ -d /tmp/standalone/rebel-agent-skills/frontend ] && [ -f /tmp/standalone/rebel-agent-skills/frontend/server.js ]; then \
        echo "Found rebel-agent-skills/frontend structure" && \
        cp -r /tmp/standalone/rebel-agent-skills/frontend/* /app/ && \
        APP_DIR="/app"; \
    # Check for any other directory structure containing server.js
    else \
        SERVER_DIR=$$(find /tmp/standalone -maxdepth 4 -name "server.js" -type f -exec dirname {} \; | head -1); \
        if [ -n "$$SERVER_DIR" ]; then \
            echo "Found server.js at $$SERVER_DIR" && \
            cp -r "$$SERVER_DIR"/* /app/ && \
            APP_DIR="/app"; \
        else \
            echo "ERROR: Could not find server.js in standalone output" && \
            find /tmp/standalone -type f -name "*.js" || true; \
            exit 1; \
        fi; \
    fi && \
    echo "Application directory set to: $$APP_DIR" && \
    echo "=== Contents of /app ===" && \
    ls -la /app/

# Copy public and static assets from builder stage
COPY --from=builder /app/public /app/public/
COPY --from=builder /app/.next/static /app/.next/static/

# Verify better-sqlite3 native module exists
RUN echo "=== Verifying better-sqlite3 ===" && \
    if [ -f /app/node_modules/better-sqlite3/build/Release/better_sqlite3.node ]; then \
        echo "✅ better-sqlite3 verified"; \
    else \
        echo "ERROR: better-sqlite3 native module not found"; \
        find /app -name "better_sqlite3.node" || true; \
        exit 1; \
    fi

# Verify server.js exists
RUN echo "=== Verifying server.js ===" && \
    if [ -f /app/server.js ]; then \
        echo "✅ server.js found at /app/server.js"; \
    else \
        echo "ERROR: server.js not found" && \
        echo "Directory contents:" && \
        ls -laR /app/; \
        exit 1; \
    fi

# Create entrypoint script
RUN echo "#!/bin/sh" > /app/entrypoint.sh && \
    echo "cd /app && exec node server.js" >> /app/entrypoint.sh && \
    chmod +x /app/entrypoint.sh && \
    echo "Entrypoint script created" && \
    cat /app/entrypoint.sh

# Set ownership
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

CMD ["/app/entrypoint.sh"]
