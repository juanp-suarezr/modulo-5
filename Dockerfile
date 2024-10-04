FROM node:20.12.2 as build
WORKDIR /app
ARG ASSETS_URL=/universo-vigilados
ENV APP_ASSETS_URL=${ASSETS_URL}
COPY package*.json ./
RUN npm install
RUN npm install -g @angular/cli
COPY . .
RUN ng build --configuration=production --base-href=${APP_ASSETS_URL} --deploy-url=${APP_ASSETS_URL}/

FROM nginx:latest
ENV APP_ASSETS_URL=/universo-vigilados
COPY --from=build /app/dist/pre-registro/ /usr/share/nginx/html
COPY --from=build /app/dist/pre-registro/ /usr/share/nginx/html/universo-vigilados
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
COPY ./nginx.conf.template /etc/nginx/conf.d/default.conf.template
COPY ./entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 8080
ENTRYPOINT [ "/entrypoint.sh" ]
CMD ["nginx", "-g", "daemon off;"]