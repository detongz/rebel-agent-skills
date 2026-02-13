# Frontend Dockerfile - Multi-stage build for Next.js 16 with better-sqlite3
# Use Node.js 22 LTS for better better-sqlite3 compatibility

FROM node:22-alpine AS base
WORKDIR /app

# Install dependencies only when needed
FROM base AS deps
# Install build dependencies for native modules
RUN apk add --no-cache \
    libc6-compat \
    python3 \
    make \
    g++ \
    sqlite \
    sqlite-dev \
    build-base

# Copy package files to install dependencies
COPY package.json package-lock.json* ./
COPY .npmrc ./

# Configure npm to prevent workspace detection issues in CI/monorepo environments
RUN npm config set loglevel warn && \
    npm config set fund false && \
    npm config set audit false && \
    npm config set global-style true && \
    npm config set workspaces false

# Install dependencies with better-sqlite3 built from source
# Using npm install with --legacy-peer-deps for better compatibility
# Ensure lockfileVersion 2 for better CI compatibility across npm versions
# Add verbose output for debugging
RUN npm install --build-from-source=better-sqlite3 --legacy-peer-deps --no-audit --no-fund --loglevel=verbose || \
    (echo "npm install failed. Debugging info:" && \
     ls -la && \
     cat .npmrc && \
     cat package.json && \
     exit 1)

# Rebuild the application
FROM base AS builder
RUN apk add --no-cache \
    libc6-compat \
    python3 \
    make \
    g++ \
    sqlite \
    sqlite-dev \
    build-base

# Copy dependencies and application source
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variables
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build Next.js application
RUN npm run build

# Production runner image
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Install runtime dependencies
RUN apk add --no-cache sqlite

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone output from builder
# Next.js 16 in monorepo creates nested structure, so we copy everything first
COPY --from=builder /app/.next/standalone ./standalone-temp/

# Copy public and static assets
COPY --from=builder /app/public ./public/
COPY --from=builder /app/.next/static ./.next/static/ 2>/dev/null || true

# Detect and move standalone files to correct location
# Handle both monorepo and non-monorepo structures
RUN if [ -f ./standalone-temp/rebel-agent-skills/frontend/server.js ]; then \
        echo "Monorepo structure detected (rebel-agent-skills/frontend/)"; \
        cp -r ./standalone-temp/rebel-agent-skills/frontend/* ./ && \
        cp -r ./standalone-temp/rebel-agent-skills/frontend/node_modules ./ && \
        rm -rf ./standalone-temp; \
    elif [ -f ./standalone-temp/frontend/server.js ]; then \
        echo "Monorepo structure detected (frontend/)"; \
        cp -r ./standalone-temp/frontend/* ./ && \
        cp -r ./standalone-temp/frontend/node_modules ./ && \
        rm -rf ./standalone-temp; \
    elif [ -f ./standalone-temp/server.js ]; then \
        echo "Standard standalone structure detected"; \
        cp -r ./standalone-temp/* ./ && \
        rm -rf ./standalone-temp; \
    else \
        echo "ERROR: Could not find server.js in standalone output"; \
        echo "Contents of standalone-temp:"; \
        find ./standalone-temp -type f -name "server.js" || true; \
        ls -laR ./standalone-temp || true; \
        exit 1; \
    fi

# Verify better-sqlite3 native module exists
RUN if [ -f ./node_modules/better-sqlite3/build/Release/better_sqlite3.node ]; then \
        echo "✅ better-sqlite3 verified"; \
    else \
        echo "ERROR: better-sqlite3 native module not found"; \
        find . -name "better_sqlite3.node" || true; \
        exit 1; \
    fi

# Verify server.js exists
RUN if [ -f ./server.js ]; then \
        echo "✅ server.js found"; \
    else \
        echo "ERROR: server.js not found"; \
        ls -laR . | head -100; \
        exit 1; \
    fi

# Set ownership
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
