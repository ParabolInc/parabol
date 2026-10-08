ARG _NODE_MAJOR=${_NODE_MAJOR}
FROM gcr.io/distroless/nodejs${_NODE_MAJOR}-debian13

ARG DD_GIT_REPOSITORY_URL
ARG DD_GIT_COMMIT_SHA

# node is only the entrypoint in distroless, add it to PATH so it also works as a command
ENV HOME=/home/node \
    PATH=/nodejs/bin:${PATH} \
    PORT=3000 \
    DD_GIT_REPOSITORY_URL=${DD_GIT_REPOSITORY_URL} \
    DD_GIT_COMMIT_SHA=${DD_GIT_COMMIT_SHA}

USER 1000:1000

# Required for pushToCDN to work with FILE_STORE_PROVIDER set to 'local'
WORKDIR ${HOME}/parabol/self-hosted
WORKDIR ${HOME}/parabol

# The application requires a pnpm-lock.yaml file on the root folder to identify it
COPY --chown=1000:1000 .env.example pnpm-lock.yaml ./
COPY --chown=1000:1000 build ./build
COPY --chown=1000:1000 dist ./dist

EXPOSE ${PORT}

CMD ["dist/web.js"]
