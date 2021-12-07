FROM node:lts

WORKDIR /app

RUN npm install -g n
COPY package.json .
RUN n auto
COPY semantic.json .
RUN npm install

COPY src ./src
COPY webpack ./webpack

CMD npm run build
