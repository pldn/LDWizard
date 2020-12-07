FROM node:lts-alpine as build
RUN apk --no-cache add g++ gcc libgcc libstdc++ linux-headers make python
RUN npm install --quiet node-gyp -g
WORKDIR /app
COPY package.json ./
COPY yarn.lock ./
RUN yarn 
COPY . .
ARG CONFIG_FILE
RUN yarn exec ldwizard-build ${CONFIG_FILE}
FROM nginx:stable-alpine
COPY --from=build /app/lib /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]