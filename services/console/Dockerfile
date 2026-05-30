FROM node:22-alpine AS build

WORKDIR /app
COPY services/console/package.json services/console/package-lock.json ./
RUN npm ci
COPY services/console ./
RUN npm run build

FROM nginx:1.27-alpine

COPY services/console/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
