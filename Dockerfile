# Sweep production image — Next.js + system Chromium for local Lighthouse.
FROM node:22-bookworm-slim AS deps
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

FROM node:22-bookworm-slim AS builder
WORKDIR /app
RUN corepack enable
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ARG NEXT_PUBLIC_SITE_URL=http://localhost:3000
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
RUN pnpm build

FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV CHROME_PATH=/usr/bin/chromium
ENV PUPPETEER_SKIP_DOWNLOAD=1
ENV SWEEP_ALLOW_PRIVATE_URLS=0
ENV SWEEP_ALLOW_DEMO=0

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    chromium \
    ca-certificates \
    fonts-liberation \
    fonts-noto-color-emoji \
  && rm -rf /var/lib/apt/lists/* \
  && groupadd --system --gid 1001 sweep \
  && useradd --system --uid 1001 --gid sweep sweep \
  && mkdir -p /app/data/reports /app/data/crawls /app/data/lhr \
  && chown -R sweep:sweep /app

COPY --from=builder --chown=sweep:sweep /app/package.json ./package.json
COPY --from=builder --chown=sweep:sweep /app/node_modules ./node_modules
COPY --from=builder --chown=sweep:sweep /app/.next ./.next
COPY --from=builder --chown=sweep:sweep /app/public ./public
COPY --from=builder --chown=sweep:sweep /app/next.config.ts ./next.config.ts

USER sweep
EXPOSE 3000
VOLUME ["/app/data"]
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["./node_modules/.bin/next", "start", "-H", "0.0.0.0", "-p", "3000"]
