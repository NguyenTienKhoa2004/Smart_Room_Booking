FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
# Install dependencies including dev dependencies for build
RUN npm install

COPY . .

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 5000

# Start command (using compiled JS)
CMD ["npm", "start"]
