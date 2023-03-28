FROM node:slim as builder

WORKDIR /src
COPY . /src

RUN corepack enable && \
  corepack prepare pnpm@latest --activate && \
  pnpm config set store-dir ./.pnpm-store
RUN pnpm install
RUN pnpm run build

FROM node:slim

ENV NODE_ENV=production
WORKDIR /bot

COPY --from=builder /src/lib /bot/lib
COPY --from=builder /src/package* /src/pnpm-lock.yaml /bot/

RUN corepack enable && \
  corepack prepare pnpm@latest --activate && \
  pnpm config set store-dir ./.pnpm-store
RUN pnpm install
RUN ls -la /bot

CMD ["node","lib/index.js"]
