# Multi-stage build for barazo-web (Next.js standalone)
# Build context: monorepo root (docker build -f barazo-web/Dockerfile .)

# ---------------------------------------------------------------------------
# Stage 1: Install dependencies
# ---------------------------------------------------------------------------
FROM node:24-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /workspace

# Enable pnpm via corepack
RUN corepack enable && corepack prepare pnpm@10.29.2 --activate

# Copy workspace root config (including .npmrc for inject-workspace-packages)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./

# Copy all workspace package.json files (needed for pnpm install)
COPY barazo-lexicons/package.json ./barazo-lexicons/
COPY barazo-api/package.json ./barazo-api/
COPY barazo-web/package.json ./barazo-web/
COPY barazo-plugins/packages/plugin-signatures/package.json ./barazo-plugins/packages/plugin-signatures/

# Install all dependencies
RUN pnpm install --frozen-lockfile

# ---------------------------------------------------------------------------
# Stage 2: Build
# ---------------------------------------------------------------------------
FROM node:24-alpine AS builder
WORKDIR /workspace

RUN corepack enable && corepack prepare pnpm@10.29.2 --activate

# Copy installed dependencies
COPY --from=deps /workspace/ ./

# Copy lexicons source (workspace dependency)
COPY barazo-lexicons/ ./barazo-lexicons/

# Copy plugins source (workspace dependency — frontend components bundled by Next.js)
COPY barazo-plugins/ ./barazo-plugins/

# Copy web source
COPY barazo-web/ ./barazo-web/

# Build lexicons first (workspace dependency), then Next.js.
# Plugin frontend source is compiled by Next.js via transpilePackages.
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm --filter @singi-labs/lexicons build && \
    pnpm --filter @singi-labs/web build

# ---------------------------------------------------------------------------
# Stage 3: Production runner
# ---------------------------------------------------------------------------
FROM node:24-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# docker-compose healthcheck expects port 3001
ENV PORT=3001
# Bind to all interfaces (default binds to container hostname only)
ENV HOSTNAME=0.0.0.0

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone server (includes node_modules and server.js)
COPY --from=builder --chown=nextjs:nodejs /workspace/barazo-web/.next/standalone/ ./

# Copy static assets into the standalone output (must be relative to server.js)
COPY --from=builder --chown=nextjs:nodejs /workspace/barazo-web/.next/static/ ./barazo-web/.next/static/
COPY --from=builder --chown=nextjs:nodejs /workspace/barazo-web/public/ ./barazo-web/public/

USER nextjs

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3001/api/health || exit 1

CMD ["node", "barazo-web/server.js"]
