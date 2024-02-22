ARG _NODE_VERSION=${_NODE_VERSION}
FROM node:${_NODE_VERSION}-bookworm-slim as base

ENV NPM_CONFIG_PREFIX=/home/node/.npm-global
ENV PORT=3000

# RUN apt update -y && \
#     apt install systemtap -y

COPY --chown=node --chmod=755 docker/parabol-ubi/docker-build/entrypoints/buildenv /usr/local/bin/docker-entrypoint.sh
COPY --chown=node docker/parabol-ubi/docker-build/tools/ip-to-server_id ${HOME}/tools/ip-to-server_id

# The application requires a yarn.lock file on the root folder to identify it
COPY --chown=node yarn.lock ${HOME}/parabol/yarn.lock
# Required for pushToCDN to work with FILE_STORE_PROVIDER set to 'local'
RUN mkdir -p ${HOME}/parabol/self-hosted && \
    chown node:node ${HOME}/parabol/self-hosted

COPY --chown=node .env.example ${HOME}/parabol/.env.example
COPY --chown=node build ${HOME}/parabol/build
COPY --chown=node dist ${HOME}/parabol/dist

WORKDIR ${HOME}/parabol/

USER node
EXPOSE ${PORT}

ENTRYPOINT ["docker-entrypoint.sh"]
