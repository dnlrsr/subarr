FROM node:latest

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

