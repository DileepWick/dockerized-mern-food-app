# syntax=docker/dockerfile:1
ARG NODE_VERSION=22.13.1
FROM node:${NODE_VERSION}-slim AS base
WORKDIR /app

# Install dependencies in a separate build stage for caching
FROM base AS deps
# Copy only package.json and package-lock.json for dependency install
COPY --link package.json package-lock.json ./
# Use npm ci for deterministic installs, cache npm folder
RUN --mount=type=cache,target=/root/.npm \
    npm ci --production

# Copy application source code
FROM base AS app
COPY --from=deps /app/node_modules ./node_modules
COPY --link . .

# Create a non-root user and switch to it
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser
USER appuser

# Set environment variables
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Expose the port (default to 3000 if not set at runtime)
EXPOSE 3000

# Start the service
CMD ["npm", "start"]

# .env files should NOT be copied; pass env vars at runtime
# Make sure to add .env to .dockerignore
