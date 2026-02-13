# Frontend Dockerfile - Fixed for GitHub Actions
FROM node:22-alpine AS base

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci

# Build Next.js application
RUN npm run build

# Production runner stage
FROM base AS runner
WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy build output
COPY --from=builder /app/.next/standalone ./standalone
COPY --from=builder /app/.next/static ./.next/static

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

# Expose port
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start Next.js server
CMD ["node", "server.js"]
