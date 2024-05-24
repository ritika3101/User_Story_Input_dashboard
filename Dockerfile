# Stage 1: Build React App
FROM node:16-alpine AS build

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./
RUN npm install

COPY . ./
RUN npm run build

# Stage 2: Serve React App with Express
FROM node:16-alpine

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./
RUN npm install --only=production

COPY --from=build /app/build ./build
COPY server.js ./

EXPOSE 3000

CMD ["node", "server.js"]