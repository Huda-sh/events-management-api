# Stage 1: dependencies + build
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies for native modules (sqlite3)
RUN apk add --no-cache python3 make g++

# Copy package manifests
COPY package.json package-lock.json ./

# Install all dependencies (including dev) for building
RUN npm ci

# Copy source files
COPY . .

# Build TypeScript
RUN npm run build

# Stage 2: runtime image
FROM node:20-alpine AS runner

WORKDIR /app

# Install runtime libraries AND build tools (required for native module compilation)
RUN apk add --no-cache python3 make g++ libstdc++ sqlite-libs

# Copy package files
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./

# Install only production dependencies (this will rebuild sqlite3)
RUN npm ci --omit=dev && \
    # Verify sqlite3 loads
    node -e "try { require('sqlite3'); console.log('✓ sqlite3 loaded successfully'); } catch(e) { console.error('✗ Failed:', e); process.exit(1); }"

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/data ./data

# Remove build tools to keep image small
RUN apk del python3 make g++

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "dist/main"]