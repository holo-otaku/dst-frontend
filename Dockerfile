# build environment
FROM node:lts as build
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY package*.json ./
COPY yarn.lock ./
RUN yarn install
COPY . ./
RUN yarn build

# production environment
FROM nginx:1-alpine
COPY --from=build /app/out/renderer /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]