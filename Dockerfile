FROM node:18-alpine AS base

WORKDIR /app

# Install pnpm and curl for debugging
RUN apk add --no-cache curl
RUN npm install -g pnpm

# Copy package files
COPY package.json ./
COPY package-lock.json ./

# Install dependencies
RUN pnpm install

# Copy all source files
COPY . .

# Build
RUN pnpm build

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

RUN apk add --no-cache curl
RUN npm install -g pnpm

# Copy built artifacts and dependencies
COPY --from=base /app/package.json ./
COPY --from=base /app/package-lock.json ./
COPY --from=base /app/.next ./.next
COPY --from=base /app/public ./public
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/.env ./.env

EXPOSE 3000

CMD ["pnpm", "start"]