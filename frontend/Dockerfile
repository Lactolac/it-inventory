# Build stage
FROM node:20-slim AS build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Preview stage
FROM node:20-slim
WORKDIR /app
COPY --from=build-stage /app/node_modules ./node_modules
COPY --from=build-stage /app/package*.json ./
COPY --from=build-stage /app/dist ./dist
COPY --from=build-stage /app/vite.config.js ./vite.config.js

EXPOSE 4173
CMD ["npm", "run", "preview"]
