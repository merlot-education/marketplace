FROM node:18-alpine AS build
ARG ENVIRONMENT

WORKDIR /app

COPY . .
RUN echo '@merlot-education:registry = "https://npm.pkg.github.com/"' >> ~/.npmrc
#RUN --mount=type=secret,id=PACKAGES_RO_TOKEN echo //npm.pkg.github.com/:_authToken=$(cat /run/secrets/PACKAGES_RO_TOKEN) >> ~/.npmrc
RUN --mount=type=secret,id=GIT_AUTH_TOKEN echo //npm.pkg.github.com/:_authToken=$(cat /run/secrets/GIT_AUTH_TOKEN) >> ~/.npmrc

RUN --mount=type=secret,id=GIT_AUTH_TOKEN ls /run/secrets
RUN --mount=type=secret,id=GIT_AUTH_TOKEN md5sum <(cat /run/secrets/GIT_AUTH_TOKEN)
#RUN --mount=type=secret,id=test ls /run/secrets
#RUN --mount=type=secret,id=test cat /run/secrets/test
#RUN --mount=type=secret,id=test md5sum  <(cat /run/secrets/test)
RUN npm config ls
#RUN --mount=type=secret,id=NPM_CONFIG ls /run/secrets
#RUN --mount=type=secret,id=NPM_CONFIG md5sum <(cat /run/secrets/NPM_CONFIG)
#RUN --mount=type=secret,id=NPM_CONFIG npm ci --userconfig /run/secrets/NPM_CONFIG
RUN npm ci
RUN npm run ng -- build --configuration $ENVIRONMENT

FROM nginx:stable-alpine
COPY --from=build /app/dist/marketplace /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
