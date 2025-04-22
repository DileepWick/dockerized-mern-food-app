# syntax=docker/dockerfile:1
ARG NODE_VERSION=22.13.1
FROM node:${NODE_VERSION}-slim AS base
WORKDIR /app

# Install dependencies in a separate stage for caching
FROM base AS deps
# Only copy package.json and package-lock.json for dependency install
COPY --link package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --production

# Copy application source
FROM base AS app
COPY --link . .

# Final production image
FROM node:${NODE_VERSION}-slim AS final
WORKDIR /app

# Create a non-root user and group
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser

# Copy dependencies and app source from previous stages
COPY --from=deps /app/node_modules ./node_modules
COPY --from=app /app/ .

# Ensure .env and other secret files are not present in the image
# (Assumes .env is in .dockerignore)

ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=4096"

USER appuser

EXPOSE 3000
CMD ["node", "index.js"]
