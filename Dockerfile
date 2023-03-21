FROM node:18-alpine AS build

WORKDIR /app

COPY . .
RUN npm ci && \
    npm run build

FROM nginx:stable-alpine
COPY --from=build /app/dist/marketplace /usr/share/nginx/html

EXPOSE 80