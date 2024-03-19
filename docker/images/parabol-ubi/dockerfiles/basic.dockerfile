ARG _NODE_VERSION=${_NODE_VERSION}
FROM node:${_NODE_VERSION}-bookworm-slim as base

ENV HOME=/home/node \
    USER=node

ENV NPM_CONFIG_PREFIX=/home/node/.npm-global
ENV PORT=3000

COPY --chown=node --chmod=755 docker/images/parabol-ubi/entrypoints/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
COPY --chown=node docker/images/parabol-ubi/tools/ip-to-server_id ${HOME}/tools/ip-to-server_id

# Required for pushToCDN to work with FILE_STORE_PROVIDER set to 'local'
RUN mkdir -p ${HOME}/parabol/self-hosted && \
    chown node:node ${HOME}/parabol/self-hosted

COPY --chown=node .env.example ${HOME}/parabol/.env.example

# The application requires a yarn.lock file on the root folder to identify it
COPY --chown=node yarn.lock ${HOME}/parabol/yarn.lock
COPY --chown=node build ${HOME}/parabol/build
COPY --chown=node dist ${HOME}/parabol/dist

WORKDIR ${HOME}/parabol/

USER node
EXPOSE ${PORT}

ENTRYPOINT ["docker-entrypoint.sh"]
