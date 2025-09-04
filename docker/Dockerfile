FROM node:latest AS builder

# Install build dependencies for native modules
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY server/package.json ./server/
WORKDIR /app/server
RUN npm install && npm rebuild

FROM node:latest AS runtime

# Install build dependencies for native modules
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
WORKDIR /app

# Copy built node_modules from builder stage
COPY --from=builder /app/server/node_modules ./server/node_modules
COPY server/ ./server/
COPY client/build ./client/build

WORKDIR /app/server

# Rebuild native modules for the runtime environment
RUN npm rebuild

EXPOSE 3001
CMD ["node", "index.js"]

