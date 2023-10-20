FROM node:18-alpine AS build
ARG ENVIRONMENT

WORKDIR /app

COPY . .
RUN npm config list -l
RUN echo '//npm.pkg.github.com/:_authToken=$GITHUB_TOKEN' >> ~/.npmrc
RUN npm config list -l
RUN --mount=type=secret,id=github_token GITHUB_TOKEN=$(cat /run/secrets/github_token) npm ci
RUN npm run ng -- build --configuration $ENVIRONMENT

FROM nginx:stable-alpine
COPY --from=build /app/dist/marketplace /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
