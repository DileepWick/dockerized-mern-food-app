# syntax=docker/dockerfile:1
ARG NODE_VERSION=22.13.1
FROM node:${NODE_VERSION}-slim AS base
WORKDIR /app

# Install dependencies in a separate stage for caching
FROM base AS deps
# Copy only package.json and package-lock.json for better cache usage
COPY --link package.json package-lock.json ./
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

# Expose the port (default to 5002, can be overridden at runtime)
EXPOSE 5002

# Start the service
CMD ["npm", "start"]

# .env files and other secrets should NOT be copied into the image. Pass them at runtime.
