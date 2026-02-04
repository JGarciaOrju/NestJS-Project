# ========================================
# Stage 1: Install production dependencies
# ========================================
FROM node:20-alpine AS dependencies

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install only production dependencies
RUN npm ci --only=production

# ========================================
# Stage 2: Build the application
# ========================================
FROM node:20-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install ALL dependencies (including dev dependencies for building)
RUN npm ci

# Copy source code and config files
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build the NestJS application
RUN npm run build

# ========================================
# Stage 3: Production image
# ========================================
FROM node:20-alpine AS production

# Set working directory
WORKDIR /app

# Install runtime dependencies (for Prisma)
RUN apk add --no-cache libc6-compat openssl

# Copy production dependencies from dependencies stage
COPY --from=dependencies /app/node_modules ./node_modules

# Copy built application from build stage
COPY --from=build /app/dist ./dist

# Copy Prisma generated files
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma

# Copy Prisma schema and config
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/prisma.config.ts ./prisma.config.ts

# Copy package.json (needed for scripts)
COPY package.json ./

# Set production environment
ENV NODE_ENV=production

# Expose port 3000
EXPOSE 3000

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

# Start the application
CMD ["node", "dist/src/main.js"]

