FROM node:20-alpine AS builder
RUN apk add --no-cache python3 make g++
WORKDIR /app
COPY frontend/package*.json ./
RUN npm install --legacy-peer-deps --verbose
COPY frontend/ .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY frontend/nginx-frontend.conf /etc/nginx/conf.d/default.conf
RUN rm -f /etc/nginx/conf.d/nginx.conf
EXPOSE 3000
