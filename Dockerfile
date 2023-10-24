FROM node:18-alpine AS build
ARG ENVIRONMENT

RUN echo '@merlot-education:registry = "https://npm.pkg.github.com/"' >> ~/.npmrc
RUN echo '//npm.pkg.github.com/:_authToken=${NPM_CONFIG_TOKEN}' >> ~/.npmrc

WORKDIR /app

COPY . .
RUN --mount=type=secret,id=GIT_AUTH_TOKEN env NPM_CONFIG_TOKEN=$(cat /run/secrets/GIT_AUTH_TOKEN) sh -c 'npm ci'
RUN npm run ng -- build --configuration $ENVIRONMENT

FROM nginx:stable-alpine
COPY --from=build /app/dist/marketplace /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
