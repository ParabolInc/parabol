ARG _NODE_VERSION=${_NODE_VERSION}
FROM node:${_NODE_VERSION}-trixie-slim as base

ARG DD_GIT_REPOSITORY_URL
ARG DD_GIT_COMMIT_SHA

ENV HOME=/home/node \
    USER=node \
    NPM_CONFIG_PREFIX=/home/node/.npm-global \
    PORT=3000

COPY --chown=node --chmod=755 docker/images/parabol-ubi/entrypoints/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
COPY --chown=node docker/images/parabol-ubi/tools/ip-to-server_id ${HOME}/tools/ip-to-server_id

# Required for pushToCDN to work with FILE_STORE_PROVIDER set to 'local'
RUN mkdir -p ${HOME}/parabol/self-hosted && \
    chown node:node ${HOME}/parabol/self-hosted

COPY --chown=node .env.example ${HOME}/parabol/.env.example

# The application requires a pnpm-lock.yaml file on the root folder to identify it
COPY --chown=node pnpm-lock.yaml ${HOME}/parabol/pnpm-lock.yaml
COPY --chown=node build ${HOME}/parabol/build
COPY --chown=node dist ${HOME}/parabol/dist

WORKDIR ${HOME}/parabol/

USER node
EXPOSE ${PORT}

ENV DD_GIT_REPOSITORY_URL=${DD_GIT_REPOSITORY_URL} \
    DD_GIT_COMMIT_SHA=${DD_GIT_COMMIT_SHA}

ENTRYPOINT ["docker-entrypoint.sh"]
