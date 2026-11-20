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
# nginx >= 1.31.9 required (NGINX2Root: CVE-2026-123007 / 123633 / 123634 / 121810 / 113425)
FROM nginx:1.31.9-alpine@sha256:90b6bd2aec278b16b98221d64deb1d6d35d164567f507ab0716e6053878315aa
COPY --from=build /app/dist /usr/share/nginx/html
COPY ./docker/nginx/dst.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
