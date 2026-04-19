# syntax=docker/dockerfile:1.7
FROM node:20-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev --no-audit --no-fund

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache wget \
    && rm -rf /var/cache/apk/*
COPY package*.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY server.js ./
COPY config ./config
COPY routes ./routes
COPY controllers ./controllers
COPY models ./models
COPY middleware ./middleware
COPY utils ./utils
RUN chown -R node:node /app
USER node
EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:5000/api/health || exit 1
CMD ["node", "server.js"]
