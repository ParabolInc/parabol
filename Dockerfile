FROM node:11.14

# Which .env file to import as default environment?
ARG ENV_FILE=.env

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json ./
COPY yarn.lock ./
RUN yarn

# Bundle app source
COPY . .

# Copy environment
COPY $ENV_FILE ./.env

# Build app
RUN yarn build:dll
RUN yarn build:relay
RUN yarn build:client

EXPOSE 8080

