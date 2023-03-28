FROM node:slim as builder

WORKDIR /src
COPY . /src

RUN npm ci
RUN npm run build

FROM node:slim

ENV NODE_ENV=production
WORKDIR /bot

COPY --from=builder /src/lib /bot/lib
COPY --from=builder /src/package* /bot

RUN npm ci

CMD ["node","lib/index.js"]
