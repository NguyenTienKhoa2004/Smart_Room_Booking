FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
# Install dependencies including dev dependencies for build
RUN npm install

COPY . .

# Cache bust: 2026-02-02-22:42 - Force rebuild
RUN npm run build

# Expose port
EXPOSE 5000

# Start command (using compiled JS)
CMD ["npm", "start"]
