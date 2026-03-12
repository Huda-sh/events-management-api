# Stage 1: dependencies + build
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies for native modules (sqlite3)
RUN apk add --no-cache python3 make g++

# Copy package manifests first to leverage build cache
COPY package.json pnpm-lock.yaml ./

# Install pnpm globally and then install all dependencies (including dev)
# Using --no-strict-peer-dependencies avoids failures if peer dependency warnings occur
RUN npm install -g pnpm && pnpm install --no-strict-peer-dependencies

# Copy source files
COPY . .

# Build TypeScript (you can also use 'pnpm run build' if preferred)
RUN npm run build

# Stage 2: runtime image
FROM node:20-alpine AS runner
WORKDIR /app

# Copy production dependencies only (but note: we're copying the entire node_modules)
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Copy data directory skeleton (existing sqlite file, if present)
COPY --from=builder /app/data ./data

ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "dist/main"]