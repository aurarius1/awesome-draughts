FROM node:lts-alpine as build
RUN mkdir -p /app
WORKDIR /app
COPY . .
RUN npm install && \
        npm run build

FROM nginx:stable-alpine
WORKDIR /var/www/html
RUN  mkdir -p /app && \
    mkdir -p /var/log/docker && \
    mkdir -p /var/www/html

COPY ./docker/nginx.conf /etc/nginx/nginx.conf
COPY ./docker/default.conf /etc/nginx/conf.d/default.conf
COPY ./docker/replace_env.sh /docker-entrypoint.d/50-injector.sh


ENV ML_DRAUGHTS_API_URL http://localhost:32678

WORKDIR /app
COPY --from=build /app/dist /var/www/html

RUN chown nginx:nginx /var/www/html && \
    chmod 0755 /docker-entrypoint.d/*.sh

#CMD ["docker", "-g", "daemon off;"]