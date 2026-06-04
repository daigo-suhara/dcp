FROM node:22-alpine AS build

WORKDIR /app
COPY services/hello-world/package.json ./package.json
COPY services/hello-world/package-lock.json ./package-lock.json
RUN npm ci --no-audit --no-fund
COPY services/hello-world/index.html ./index.html
COPY services/hello-world/vite.config.js ./vite.config.js
COPY services/hello-world/src ./src
COPY services/hello-world/assets ./assets
RUN npm run build

FROM nginx:1.27-alpine

COPY services/hello-world/nginx.conf /etc/nginx/conf.d/default.conf
COPY services/hello-world/docker-entrypoint.d/10-runtime-env.sh /docker-entrypoint.d/10-runtime-env.sh
RUN chmod +x /docker-entrypoint.d/10-runtime-env.sh
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080
