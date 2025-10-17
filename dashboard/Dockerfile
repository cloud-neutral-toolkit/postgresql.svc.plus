# Build static dashboard
FROM node:20 AS build
WORKDIR /app
COPY dashboard/package.json dashboard/yarn.lock ./
RUN yarn install --frozen-lockfile
COPY dashboard .
RUN yarn build

FROM nginx:alpine
COPY --from=build /app/out /usr/share/nginx/html
EXPOSE 80
CMD ["nginx","-g","daemon off;"]
