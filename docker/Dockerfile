FROM node:12.18.3 as build

COPY . /ldwizard

RUN cd /ldwizard && yarn && yarn run build


FROM nginx:1.19.2

COPY --from=build /ldwizard/lib /usr/share/nginx/html
