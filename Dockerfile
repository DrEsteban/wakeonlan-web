# syntax=docker/dockerfile:1
FROM node:16 AS build-frontend
WORKDIR /frontend

# Maximize layer caching
COPY ./frontend/package* ./frontend/yarn.lock ./
RUN yarn install

COPY ./frontend .
RUN yarn build


FROM node:16-buster
WORKDIR /wakeonlan-web
COPY ./backend .
COPY --from=build-frontend /frontend/build ./src/httpdocs
RUN npm install
RUN apt-get update && apt-get install -y arp-scan
CMD ["npx", "ts-node", "src/index.ts"]
