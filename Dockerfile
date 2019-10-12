FROM node:12.11

RUN mkdir /usr/src/app && chown node:node -R /usr/src/app
RUN npm i lerna -g --loglevel notice

USER node

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies & cache on deps
COPY --chown=node:node package.json yarn.lock lerna.json ./
RUN yarn install --silent

# Bundle app source
COPY --chown=node:node packages packages

# Build app
RUN lerna bootstrap && yarn build
