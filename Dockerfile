FROM node:18-alpine AS build
ARG ENVIRONMENT

WORKDIR /app

COPY . .
RUN npm config list -l
RUN echo '@merlot-education:registry = "https://npm.pkg.github.com/"' >> ~/.npmrc
RUN echo '//npm.pkg.github.com/:_authToken=$NODE_AUTH_TOKEN' >> ~/.npmrc
RUN npm config list -l
RUN --mount=type=secret,id=github_token ls /run/secrets
RUN --mount=type=secret,id=github_token cat /run/secrets/github_token
RUN --mount=type=secret,id=github_token NODE_AUTH_TOKEN=$(cat /run/secrets/github_token) npm ci
RUN npm run ng -- build --configuration $ENVIRONMENT

FROM nginx:stable-alpine
COPY --from=build /app/dist/marketplace /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
