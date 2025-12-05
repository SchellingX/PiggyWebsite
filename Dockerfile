# Stage 1: Build the frontend assets
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install all dependencies. Prefer `npm ci` when a lockfile exists.
COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Copy the rest of the source code
COPY . .

# Build the React frontend
RUN npm run build


# Stage 2: Setup the production environment
FROM node:20-alpine

WORKDIR /app

# Create a non-root user to run the application for better security (only if it doesn't exist)
RUN if ! id node >/dev/null 2>&1; then addgroup -S node && adduser -S node -G node; else echo "node user exists"; fi
# chown the app directory to the node user (safe even if the user already exists)
RUN chown -R node:node /app || true

# Copy package files and install ONLY production dependencies
COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci --only=production --no-audit --no-fund; else npm install --only=production --no-audit --no-fund; fi

# Copy the built frontend assets from the builder stage
COPY --from=builder /app/dist ./dist

# Copy the backend server file
COPY server.js .

# Switch to the non-root user
USER node

# Expose the port the server will run on
EXPOSE 8080

# Healthcheck - This remains the same
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 CMD node -e "require('http').get('http://localhost:8080/health', (res) => { if (res.statusCode !== 200) { process.exit(1); } process.exit(0); }).on('error', () => process.exit(1));"

# Command to run the server
CMD ["node", "server.js"]
