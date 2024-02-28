# docker-image-parabol

This repo was created to build a **secure** Parabol base image that is **agnostic to configuration and can be used anywhere**. Once an image is built, it can be pushed to any repository.

There are two possible ways to build the application:

- **Standard build:** duild using local files, using the same Dockerfile and process used in our Docker Build pipeline.
- **Build from git:** build using a simplified process that downloads the source code and builds from scratch.

The processes are different and the details of it can be checked in both dockerfiles.

## Standard build

### Requirements

Required:

- RethinkDB up and running.
- PostgreSQL up and running.
- Redis up and running.

Recommended:

- jq installed.

### Variables

| Name                 | Description                                                                                                             | Possible values                                       | Recommended value                                                   |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------- |
| `postgresql_tag`     | PostgreSQL version from the [Docker image](https://hub.docker.com/_/postgres)                                           | `Any tag`                                             | `15.4`                                                              |
| `rethinkdb_tag`      | RethinkDB version from the [Docker image](https://hub.docker.com/_/rethinkdb)                                           | `Any tag`                                             | `2.4.2`                                                             |
| `redis_tag`          | Redis version from the [Docker image](https://hub.docker.com/_/redis)                                                   | `Any tag`                                             | `7.0-alpine`                                                        |
| `_BUILD_ENV_PATH`    | File `.env` used by the application during the build process                                                            | `Relative path from the root level of the repository` | `docker/parabol-ubi/docker-build/environments/pipeline`             |
| `_NODE_VERSION`      | Node version, used by Docker to use the Docker image node:\_NODE_VERSION as base image to build                         | `Same as in root package.json`                        |                                                                     |
| `_DOCKERFILE`        | Dockerfile used to build the image                                                                                      | `Relative path from the root level of the repository` | `./docker/parabol-ubi/docker-build/dockerfiles/pipeline.dockerfile` |
| `_SECURITY_ENABLED`  | Enable or disable security configurations. It will add some MBs to the final image, but it will produce a secured image | `true/false`                                          | `true`                                                              |
| `_DOCKER_REPOSITORY` | The destination repository                                                                                              | `String`                                              | `parabol`                                                           |
| `_DOCKER_TAG`        | Tag for the produced image                                                                                              | `String`                                              |                                                                     |

Example of variables:

```commandLine
export postgresql_tag=15.4-alpine; \
export rethinkdb_tag=2.4.2; \
export redis_tag=7.0-alpine; \
export _BUILD_ENV_PATH=docker/parabol-ubi/docker-build/environments/pipeline; \
export _NODE_VERSION=$(jq -r -j '.engines.node|ltrimstr("^")' package.json); \
export _DOCKERFILE=./docker/parabol-ubi/docker-build/dockerfiles/pipeline.dockerfile; \
export _SECURITY_ENABLED=true; \
export _DOCKER_REPOSITORY=parabol; \
export _DOCKER_TAG=test-image
```

### Building the image

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
docker run --name temp-postgres -e POSTGRES_PASSWORD=temppassword -e POSTGRES_USER=tempuser -e POSTGRES_DB=tempdb -d -p 5432:5432 postgres:$postgresql_tag && \
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
docker build -t $_DOCKER_REPOSITORY:$_DOCKER_TAG -f $_DOCKERFILE --build-arg _NODE_VERSION=$_NODE_VERSION --build-arg _SECURITY_ENABLED=$_SECURITY_ENABLED .
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

## Build from git

This version of the Dockerfile downloads the application during the docker build process and differs in other

Modify the version export below e.g. update vX.X.X and run the export command and the docker command. The command below will create a temp postgres container (this allows pgtype files to be generated) and then build the docker image with a temp .env file.

- Change `environments/buildenv` connection string names form container names to localhost for local image build.
- Use `_PARABOL_GIT_REF` to select the reference in Parabol's Git repository. It can be any tag or branch, but it is recommended to use released tags as `v6.69.0`. By default it buils a local image using only `parabol` as repository.
- Use `_DOCKER_REPOSITORY` to build the image for a remote repository (ex: `gcr.io/parabol-proving-ground/parabol`)
- Use `_DOCKER_TAG` to define the tag for the new image.

```commandLine
export postgresql_tag=15.4-alpine; \
export rethinkdb_tag=2.4.2; \
export redis_tag=7.0-alpine; \
export _BUILD_ENV_PATH=environments/local-buildenv \
export _NODE_VERSION=20.11.0 \
export _DOCKER_REPOSITORY=parabol \
export _PARABOL_GIT_REF=vX.X.X \
export _DOCKER_TAG=vX.X.X
```

Now you can build the image

```commandLine
docker run --name temp-postgres --network=host -e POSTGRES_PASSWORD=temppassword -e POSTGRES_USER=tempuser -e POSTGRES_DB=tempdb -d -p 5432:5432 postgres:${postgresql_tag} && \
docker run --name temp-rethinkdb --network=host -d -p 28015:28015 -p 29015:29015 -p 8080:8080 rethinkdb:${rethinkdb_tag} && \
docker run --name temp-redis --network=host -d -p 6379:6379 redis:${redis_tag} && \
docker build --no-cache --network=host -t ${_DOCKER_REPOSITORY}:${_DOCKER_TAG} -f ./dockerfiles/parabol.dockerfile --build-arg _PARABOL_GIT_REF=${_PARABOL_GIT_REF} --build-arg  _NODE_VERSION=$_NODE_VERSION --build-arg _BUILD_ENV_PATH=${_BUILD_ENV_PATH} . && \
docker stop temp-postgres temp-rethinkdb temp-redis && docker rm temp-postgres temp-rethinkdb temp-redis -f || docker stop temp-postgres temp-rethinkdb temp-redis && docker rm temp-postgres temp-rethinkdb temp-redis -f
```

If `_DOCKER_REPOSITORY` wasn't local and you want to push the image, you can run then:

```commandLine
docker push ${_DOCKER_REPOSITORY}:${_DOCKER_TAG}
```

## Run the application using a docker image

_Assumes redis, rethinkdb, and postgres already running to have operational stack._

The commands below will start a Parabol container on the target tag specified in \_DOCKER_TAG export. It will volume mount a .env in your current working directory to the container, so you can pass in any .env in your current working directory.

- Start GraphQL

```commandLine
export _DOCKER_REPOSITORY=parabol; \
export _DOCKER_TAG=vX.X.X

docker run --name=parabolgraphql --network=host -v $(pwd)/.env:/home/node/parabol/.env ${_DOCKER_REPOSITORY}:${_DOCKER_TAG} /bin/bash -c "yarn predeploy && NODE_ENV=production && node ./dist/gqlExecutor.js" || docker container rm parabolgraphql -f
```

- Start Web Server

```commandLine
export _DOCKER_REPOSITORY=parabol; \
export _DOCKER_TAG=vX.X.X

docker run --name=parabol --network=host -v $(pwd)/.env:/home/node/parabol/.env -p 3000:3000 ${_DOCKER_REPOSITORY}:${_DOCKER_TAG} /bin/bash -c "yarn predeploy && NODE_ENV=production && node ./dist/web.js" || docker container rm parabol -f
```

To stop the container, just open another terminal and enter `docker container stop parabol`
