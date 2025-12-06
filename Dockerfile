# Stage 1: Build the frontend assets
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first to leverage cache
COPY package.json package-lock.json* ./
# Use npm ci if lockfile exists, otherwise install.
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Stage 2: Production environment
FROM node:20-alpine

WORKDIR /app

# Security: Run as non-root user
RUN addgroup -S nodejs && adduser -S nodejs -G nodejs

COPY package.json package-lock.json* ./
# Install only production dependencies
RUN if [ -f package-lock.json ]; then npm ci --only=production --ignore-scripts; else npm install --only=production --ignore-scripts; fi

# Copy built assets and server
COPY --from=builder /app/dist ./dist
COPY server.js .
# Optional: Copy next.config.js if it existed (it doesn't, but safe to ignore)

# Set ownership
RUN chown -R nodejs:nodejs /app

USER nodejs

# Environment variables
ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/health', (res) => { if (res.statusCode !== 200) { process.exit(1); } process.exit(0); }).on('error', () => process.exit(1));"

CMD ["node", "server.js"]
