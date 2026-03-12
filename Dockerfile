# Stage 1: dependencies + build
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies for native modules (sqlite3)
RUN apk add --no-cache python3 make g++

# Copy package manifests
COPY package.json pnpm-lock.yaml ./

# Install pnpm and all dependencies
RUN npm install -g pnpm && pnpm install --no-strict-peer-dependencies

# Copy source and build
COPY . .
RUN npm run build

# Stage 2: runtime image
FROM node:20-alpine AS runner
WORKDIR /app

# Install runtime libraries required by sqlite3
RUN apk add --no-cache libstdc++ sqlite-libs

# Copy production dependencies and built app
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/data ./data

ENV NODE_ENV=production
EXPOSE 3000

# Optional: test sqlite3 load
RUN node -e "try { require('sqlite3'); console.log('sqlite3 loaded'); } catch(e) { console.error(e); process.exit(1); }"

CMD ["node", "dist/main"]