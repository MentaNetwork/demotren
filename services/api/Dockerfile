FROM node:7.7.2-alpine

WORKDIR /usr/app

COPY source .

RUN npm install --quiet

CMD [ "npm", "run", "dev" ]