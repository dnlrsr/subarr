FROM node:latest

# Set NODE_ENV to production
ENV NODE_ENV=production

WORKDIR /app
# Copy server files
COPY server/package.json server/package-lock.json ./server/
COPY server/ ./server/

# Copy client build
COPY client/build ./client/build

# Install server dependencies
WORKDIR /app/server

# Expose port (change if your server uses a different port)
EXPOSE 3001

# Start the server
CMD ["node", "index.js"]

