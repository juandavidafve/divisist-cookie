FROM node:lts-alpine AS base
WORKDIR /app
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV NODE_ENV=production
RUN corepack enable
RUN apk add chromium

FROM base AS prod-deps
COPY package.json .
COPY pnpm-lock.yaml .
ENV NODE_ENV=production
RUN pnpm install --frozen-lockfile --prod --ignore-scripts

FROM prod-deps AS dev-deps
ENV NODE_ENV=development
RUN pnpm install --frozen-lockfile

FROM dev-deps AS build
COPY . .
RUN pnpm run build

FROM base AS prod
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json .

EXPOSE 3000

VOLUME [ "/app/data" ]

ENTRYPOINT [ "pnpm" ]
CMD ["start"]