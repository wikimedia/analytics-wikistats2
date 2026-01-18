FROM node:lts

WORKDIR /app

RUN npm install -g n
COPY package.json .
RUN n auto
COPY src ./src
COPY webpack ./webpack
COPY semantic ./semantic
COPY semantic.json .

RUN npm install

CMD npm run build
