FROM node:7.7.2-alpine

WORKDIR /usr/app

# install required node.js node-gyp package dependencies
RUN apk add --no-cache gcc g++ make python

COPY source .

RUN npm install --quiet

CMD [ "npm", "run", "dev" ]
