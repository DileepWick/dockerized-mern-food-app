# syntax=docker/dockerfile:1
ARG NODE_VERSION=22.13.1
FROM node:${NODE_VERSION}-slim AS base
WORKDIR /app

# Install dependencies in a separate build stage for caching
FROM base AS deps
# Copy only package.json and package-lock.json for dependency installation
COPY --link package.json package-lock.json ./
# Use npm ci for deterministic, production-only install
RUN --mount=type=cache,target=/root/.npm \
    npm ci --production

# Copy application source code
FROM base AS app
COPY --link . .

# Copy installed node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Security: create and use a non-root user
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser
USER appuser

# Set environment variables
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Expose the port (default to 3000 if not set at runtime)
EXPOSE 3000

# Start the service
CMD ["npm", "start"]

# ---
# Notes:
# - .env files are NOT copied into the image. Pass env vars at runtime.
# - Add .env to .dockerignore to prevent accidental inclusion.
# - If you need to change the port, set the PORT env var at runtime.
