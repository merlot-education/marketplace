FROM node:18-alpine AS build
ARG ENVIRONMENT

WORKDIR /app

COPY . .
RUN echo //npm.pkg.github.com/:_authToken=$NODE_AUTH_TOKEN >> ~/.npmrc
RUN npm ci
RUN npm run ng -- build --configuration $ENVIRONMENT

FROM nginx:stable-alpine
COPY --from=build /app/dist/marketplace /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
