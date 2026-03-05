FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Use a non-root user for security
USER node

CMD ["node", "dist/index.js"]