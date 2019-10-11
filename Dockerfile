FROM node:12.11

RUN mkdir /usr/src/app && chown node:node -R /usr/src/app
RUN npm i lerna -g --loglevel notice

USER node

# Which .env file to import as default environment?
ARG ENV_FILE=./packages/server/.env

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY --chown=node:node package.json yarn.lock ./
RUN yarn install --silent

# Bundle app source
COPY --chown=node:node . .

# Copy environment
COPY --chown=node:node $ENV_FILE ./.env

# Build app
RUN lerna bootstrap

RUN yarn build
