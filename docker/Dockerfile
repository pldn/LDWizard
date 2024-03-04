FROM node:20-alpine as build

RUN apk --no-cache add g++ gcc libgcc libstdc++ linux-headers make python3 git
WORKDIR /app

COPY package.json ./
COPY package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build --omit=dev

ARG CONFIG_FILE

RUN npm exec ldwizard-build ${CONFIG_FILE}


FROM nginx:stable-alpine

COPY --from=build /app/lib /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]