# Stage 1: dependencies + build
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies for native modules (sqlite3)
RUN apk add --no-cache python3 make g++

# Copy package manifests first to leverage build cache
COPY package.json pnpm-lock.yaml ./

# Install all dependencies (dev + prod) so we can build
RUN npm install

# Copy source files
COPY . .

# Build TypeScript
RUN npm run build

# Stage 2: runtime image
FROM node:20-alpine AS runner
WORKDIR /app

# Copy production dependencies only
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Copy data directory skeleton (existing sqlite file, if present)
COPY --from=builder /app/data ./data

ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "dist/main"]
