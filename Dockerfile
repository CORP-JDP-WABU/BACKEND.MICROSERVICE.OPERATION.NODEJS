# PRODUCTION DOCKERFILE
# ---------------------

# Stage 1: Builder
FROM node:18-alpine as builder

ENV NODE_ENV build

USER node
WORKDIR /home/node

COPY package*.json ./
RUN npm ci --only=production

COPY --chown=node:node . .

# COPY .env ./

RUN npx prisma generate \
    && npm run build \
    && npm prune --omit=dev

# Stage 2: Production
FROM node:18-alpine

ENV NODE_ENV production

USER node
WORKDIR /home/node

COPY --from=builder --chown=node:node /home/node/package*.json ./
COPY --from=builder --chown=node:node /home/node/node_modules/ ./node_modules/
COPY --from=builder --chown=node:node /home/node/dist/ ./dist/
COPY --from=builder --chown=node:node /home/node/.env/ ./

CMD ["node", "dist/main.js"]