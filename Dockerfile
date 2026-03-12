# Stage 1: dependencies + build
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies for native modules
RUN apk add --no-cache python3 make g++

# Copy package manifests
COPY package.json pnpm-lock.yaml ./

# Install pnpm and all dependencies (including dev)
RUN npm install -g pnpm && pnpm install --no-strict-peer-dependencies

# Copy source and build
COPY . .
RUN npm run build

# Stage 2: runtime image
FROM node:20-alpine AS runner

WORKDIR /app

# Install runtime libraries AND build tools (required for compilation)
RUN apk add --no-cache python3 make g++ libstdc++ sqlite-libs

# Copy package manifests only (not node_modules)
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./

# Install pnpm and install production dependencies WITH build scripts
RUN npm install -g pnpm && \
    # This flag allows build scripts to run
    pnpm install --prod --no-strict-peer-dependencies --unsafe-perm && \
    # Verify sqlite3 loads
    node -e "try { require('sqlite3'); console.log('✓ sqlite3 loaded successfully'); } catch(e) { console.error('✗ Failed:', e); process.exit(1); }"

# Copy built application (excluding node_modules)
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/data ./data

# Remove build tools to keep image small
RUN apk del python3 make g++

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "dist/main"]