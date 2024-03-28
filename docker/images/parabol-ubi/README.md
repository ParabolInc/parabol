# docker-image-parabol

This repo was created to build a Parabol base image that is **agnostic to configuration and can be used anywhere**. Once an image is built, it can be pushed to any repository.

## Requirements

Required:

- RethinkDB up and running.
- PostgreSQL up and running.
- Redis up and running.

Recommended:

- [jq](https://jqlang.github.io/jq/) installed. It is used to get the version of the application.

## Variables

| Name                 | Description                                                                                     | Possible values                                       | Recommended value                                   |
| -------------------- | ----------------------------------------------------------------------------------------------- | ----------------------------------------------------- | --------------------------------------------------- |
| `postgresql_tag`     | PostgreSQL version from the [Docker image](https://hub.docker.com/r/pgvector/pgvector)          | `Any tag`                                             | `0.6.2-pg15`                                        |
| `rethinkdb_tag`      | RethinkDB version from the [Docker image](https://hub.docker.com/_/rethinkdb)                   | `Any tag`                                             | `2.4.2`                                             |
| `redis_tag`          | Redis version from the [Docker image](https://hub.docker.com/_/redis)                           | `Any tag`                                             | `7.0-alpine`                                        |
| `_BUILD_ENV_PATH`    | File `.env` used by the application during the build process                                    | `Relative path from the root level of the repository` | `docker/parabol-ubi/environments/basic-env`         |
| `_NODE_VERSION`      | Node version, used by Docker to use the Docker image node:\_NODE_VERSION as base image to build | `Same as in root package.json`                        |                                                     |
| `_DOCKERFILE`        | Dockerfile used to build the image                                                              | `Relative path from the root level of the repository` | `./docker/parabol-ubi/dockerfiles/basic.dockerfile` |
| `_DOCKER_REPOSITORY` | The destination repository                                                                      | `String`                                              | `parabol`                                           |
| `_DOCKER_TAG`        | Tag for the produced image                                                                      | `String`                                              |                                                     |

Example of variables:

```commandLine
export postgresql_tag=0.6.2-pg15; \
export rethinkdb_tag=2.4.2; \
export redis_tag=7.0-alpine; \
export _BUILD_ENV_PATH=docker/parabol-ubi/environments/basic-env; \
export _NODE_VERSION=$(jq -r -j '.engines.node|ltrimstr("^")' package.json); \
export _DOCKERFILE=./docker/parabol-ubi/dockerfiles/basic.dockerfile; \
export _DOCKER_REPOSITORY=parabol; \
export _DOCKER_TAG=test-image
```

## Building the image

The application must be already built locally using the command `yarn build --no-deps` mode.

To build the image, these commands must be executed from the **root level** of this repository:

- **Set the environment variables** as explained in the precedent section.

- **Copy the env file** for docker build:

> :warning: **THIS WILL DELETE YOUR LOCAL .env file is you have one**. Back it up before proceeding.

```commandLine
cp $_BUILD_ENV_PATH ./.env
```

- **Start the databases:**

> :warning: Stop all database containers you might have running before executing the following command. If other database containers are running, some ports might be already taken.

```commandLine
docker run --name temp-postgres -e POSTGRES_PASSWORD=temppassword -e POSTGRES_USER=tempuser -e POSTGRES_DB=tempdb -d -p 5432:5432 pgvector/pgvector:$postgresql_tag && \
docker run --name temp-rethinkdb -d -p 28015:28015 -p 29015:29015 -p 8080:8080 rethinkdb:$rethinkdb_tag && \
docker run --name temp-redis -d -p 6379:6379 redis:$redis_tag
```

- **Build the application:**

```commandLine
yarn && \
yarn db:migrate && \
yarn pg:migrate up && \
yarn pg:build && \
yarn build --no-deps
```

- **Build the docker image:**

```commandLine
docker build -t $_DOCKER_REPOSITORY:$_DOCKER_TAG -f $_DOCKERFILE --build-arg _NODE_VERSION=$_NODE_VERSION .
```

> Some build tips
>
> - **Docker cache:** to avoid caching images and using cache, the flag `--no-cache` can be added to the `docker build` command. It will save some space in the workstation, but it might take longer to build.
> - **Multi platform:** to build images for multiple platforms, you can use `docker builx build --platform linux/arm64 [the rest of the build command]`.
> - **Debug:** if you want debug the commands executed during the docker build, add the flag `--progress=plain` to the docker build command.

- **Stop and delete all database containers:**

```commandLine
docker stop temp-postgres temp-rethinkdb temp-redis && docker rm temp-postgres temp-rethinkdb temp-redis -f || docker stop temp-postgres temp-rethinkdb temp-redis && docker rm temp-postgres temp-rethinkdb temp-redis -f
```

- **Delete the `.env`:**

```commandLine
rm .env
```

It will produce a Docker image tagged as `${_DOCKER_REPOSITORY}:${_DOCKER_TAG}`. Ex: `parabol:test-image`.

- **Show the new image:**

```commandLine
docker images $_DOCKER_REPOSITORY:$_DOCKER_TAG
```

## Run the application using a docker image

_Assumes redis, rethinkdb, and postgres already running to have operational stack._

The commands below will start a Parabol container on the target tag specified in \_DOCKER_TAG export. It will volume mount a .env in your current working directory to the container, so you can pass in any .env in your current working directory.

For a more detailed how-to deploy Parabol, please go to the section [docker-host-st](https://github.com/ParabolInc/parabol/tree/master/docker/parabol-ubi/docker-host-st)

- Run the PreDeploy script

```commandLine
export _DOCKER_REPOSITORY=parabol; \
export _DOCKER_TAG=vX.X.X

docker run --name=parabol-predeploy --network=host -v $(pwd)/.env:/home/node/parabol/.env ${_DOCKER_REPOSITORY}:${_DOCKER_TAG} /bin/bash -c "node dist/preDeploy.js"
```

- Start GraphQL

```commandLine
export _DOCKER_REPOSITORY=parabol; \
export _DOCKER_TAG=vX.X.X

docker run --name=parabol-gql-executor --network=host -v $(pwd)/.env:/home/node/parabol/.env ${_DOCKER_REPOSITORY}:${_DOCKER_TAG} /bin/bash -c "node ./dist/gqlExecutor.js" || docker container rm parabol-gql-executor -f
```

- Start Web Server

```commandLine
export _DOCKER_REPOSITORY=parabol; \
export _DOCKER_TAG=vX.X.X

docker run --name=parabol-web-server --network=host -v $(pwd)/.env:/home/node/parabol/.env -p 3000:3000 ${_DOCKER_REPOSITORY}:${_DOCKER_TAG} /bin/bash -c "node ./dist/web.js" || docker container rm parabol-web-server -f
```

To stop the container, just open another terminal and enter `docker container stop parabol-COMPONENT`
