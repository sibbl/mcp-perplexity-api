FROM node:22-alpine AS builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json .
COPY pnpm-lock.yaml .
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build

FROM node:22-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 8080

CMD ["node", "dist/index.js"]
