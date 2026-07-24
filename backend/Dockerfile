# syntax=docker/dockerfile:1.7
FROM node:22-bookworm-slim AS development

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --no-audit --no-fund

COPY . .
RUN npm run db:generate

EXPOSE 3001

CMD ["npm", "run", "start:dev"]
