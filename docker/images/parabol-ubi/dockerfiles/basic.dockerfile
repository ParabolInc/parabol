ARG _NODE_VERSION=${_NODE_VERSION}
FROM node:${_NODE_VERSION}-bookworm-slim as base

# Install Fontconfig for SVG rendering
RUN apt-get update && apt-get install -y fontconfig

ENV HOME=/home/node \
    USER=node \
    FONTCONFIG_PATH=/etc/fonts \
    NPM_CONFIG_PREFIX=/home/node/.npm-global \
    PORT=3000

COPY --chown=node --chmod=755 docker/images/parabol-ubi/entrypoints/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
COPY --chown=node docker/images/parabol-ubi/tools/ip-to-server_id ${HOME}/tools/ip-to-server_id

# Required for pushToCDN to work with FILE_STORE_PROVIDER set to 'local'
RUN mkdir -p ${HOME}/parabol/self-hosted && \
    chown node:node ${HOME}/parabol/self-hosted

# Create a directory to store fonts
RUN mkdir -p /usr/share/fonts
COPY --chown=node static/fonts /usr/share/fonts

COPY --chown=node .env.example ${HOME}/parabol/.env.example

# The application requires a pnpm-lock.yaml file on the root folder to identify it
COPY --chown=node pnpm-lock.yaml ${HOME}/parabol/pnpm-lock.yaml
COPY --chown=node build ${HOME}/parabol/build
COPY --chown=node dist ${HOME}/parabol/dist

WORKDIR ${HOME}/parabol/

USER node
EXPOSE ${PORT}

ENTRYPOINT ["docker-entrypoint.sh"]
