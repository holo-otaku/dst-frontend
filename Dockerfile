# build environment
# ponytail: pinned by digest; bump tag + digest together when upgrading
FROM node:24.22.1-alpine@sha256:06d7adf3e0ef61a13f1d28682726366f97a15aa1888c934d3ecec86c33918b53 AS build
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY package*.json ./
COPY yarn.lock ./
RUN yarn install
COPY . ./
RUN yarn build

# production environment
# nginx >= 1.31.7 required (CVE-2026-93479 / 15176 / 97205 / 95101 / 97629)
FROM nginx:1.31.8-alpine@sha256:e2d97c2b8c016f12c2f1a27d095685063b2f281c4edf2babfde6001cf4fb77a8
COPY --from=build /app/dist /usr/share/nginx/html
COPY ./docker/nginx/dst.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
