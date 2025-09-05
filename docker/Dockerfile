FROM node:alpine AS builder

# Install build dependencies for native modules
RUN apk add --no-cache python3 make g++ py3-pip

WORKDIR /app
COPY server/package.json server/tsconfig.json ./server/
COPY server/src ./server/src
WORKDIR /app/server
RUN npm install && npm run build

FROM node:alpine AS runtime

# Install build dependencies for native modules and yt-dlp
RUN apk add --no-cache python3 make g++

ENV NODE_ENV=production
WORKDIR /app

# Copy built node_modules and compiled TypeScript from builder stage
COPY --from=builder /app/server/node_modules ./server/node_modules
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/server/package.json ./server/
COPY client/build ./client/build

WORKDIR /app/server

# Rebuild native modules for the runtime environment
RUN npm rebuild

RUN mkdir -p /data/db && mkdir -p /data/config

USER 1000:1000

EXPOSE 3001
CMD ["npm", "start"]
