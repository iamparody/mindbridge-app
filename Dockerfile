FROM node:20-alpine

WORKDIR /app

COPY src/backend/package*.json ./

RUN npm ci --omit=dev

COPY src/backend/ ./

EXPOSE 3001

CMD ["node", "server.js"]
