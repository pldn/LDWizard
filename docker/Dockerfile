FROM node:18-alpine as build

RUN apk --no-cache add g++ gcc libgcc libstdc++ linux-headers make python3 git
RUN npm install --quiet node-gyp -g
WORKDIR /app

COPY package.json ./app/
COPY yarn.lock ./app/
COPY .yarn ./app/
COPY .yarnrc ./app/
RUN yarn

COPY . .
RUN yarn build

ARG CONFIG_FILE
RUN yarn ldwizard-build ${CONFIG_FILE}


FROM nginx:stable-alpine

COPY --from=build /app/lib /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]