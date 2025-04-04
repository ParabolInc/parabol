# docker-image-parabol

This repo was created to build a Parabol base image that is **agnostic to configuration and can be used anywhere**. Once an image is built, it can be pushed to any repository.

## Building the image

See [build.yml](../../../.github/workflows/build.yml) to see how we build production images.
To build an image ad-hoc, trigger the build workflow from GitHub Actions.
To build it locally (unsupported), use [act](https://github.com/nektos/act) to run the GitHub Action locally.

## Run the application using a docker image

_Assumes redis and postgres already running to have operational stack._

The commands below will start a Parabol container on the target tag specified in \_DOCKER_TAG export. It will volume mount a .env in your current working directory to the container, so you can pass in any .env in your current working directory.

For a more detailed how-to deploy Parabol, please go to the section [docker-host-st](https://github.com/ParabolInc/parabol/tree/master/docker/stacks/single-tenant-host/)

- Run the PreDeploy script

```commandLine
export _DOCKER_REPOSITORY=parabol; \
export _DOCKER_TAG=vX.X.X

docker run --name=parabol-predeploy --network=host -v $(pwd)/.env:/home/node/parabol/.env ${_DOCKER_REPOSITORY}:${_DOCKER_TAG} /bin/bash -c "node dist/preDeploy.js"
```

- Start Web Server

```commandLine
export _DOCKER_REPOSITORY=parabol; \
export _DOCKER_TAG=vX.X.X

docker run --name=parabol-web-server --network=host -v $(pwd)/.env:/home/node/parabol/.env -p 3000:3000 ${_DOCKER_REPOSITORY}:${_DOCKER_TAG} /bin/bash -c "node ./dist/web.js" || docker container rm parabol-web-server -f
```

To stop the container, just open another terminal and enter `docker container stop parabol-COMPONENT`
