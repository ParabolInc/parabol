
# docker-image-parabol

This repo was created to build a **secure** Parabol base image that is **agnostic to configuration and can be used anywhere**. Once an image is built, it can be pushed to any repository.

## **Build docker image locally**

Modify the version export below e.g. update vX.X.X and run the export command and the docker command. The command below will create a temp postgres container (this allows pgtype files to be generated) and then build the docker image with a temp .env file.

- Change `environments/buildenv` connection string names form container names to localhost for local image build.
- Use `_PARABOL_GIT_REF` to select the reference in Parabol's Git repository. It can be any tag or branch,  but it is recommended to use released tags as `v6.69.0`. By default it buils a local image using only `parabol` as repository.
- Use `_DOCKER_REPOSITORY` to build the image for a remote repository (ex: `gcr.io/parabol-proving-ground/parabol`)
- Use `_DOCKER_TAG` to define the tag for the new image.

```commandLine
export postgresql_tag=12.10-alpine; \
export rethinkdb_tag=2.4.0; \
export redis_tag=6.2.6; \
export _BUILD_ENV_PATH=environments/local-buildenv \
export _NODE_VERSION=16.16.0 \
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

## **Run docker image locally**

*Assumes redis, rethinkdb, and postgres already running) to have operational stack*

The commands below will start a Parabol container on the target tag specified in _DOCKER_TAG export. It will volume mount a .env in your current working directory to the container, so you can pass in any .env in your current working directory.

- Start GraphQL

```commandLine
export _DOCKER_TAG=vX.X.X

docker run --name=parabolgraphql --network=host -v $(pwd)/.env:/home/node/parabol/.env parabol:${_DOCKER_TAG} /bin/bash -c "yarn db:migrate && yarn pg:migrate up && yarn postdeploy && NODE_ENV=production && node ./dist/gqlExecutor.js" || docker container rm parabolgraphql -f
```

- Start Web Server

```commandLine
export _DOCKER_TAG=vX.X.X

docker run --name=parabol --network=host -v $(pwd)/.env:/home/node/parabol/.env -p 3000:3000 parabol:${_DOCKER_TAG} /bin/bash -c "yarn db:migrate && yarn pg:migrate up && yarn postdeploy && NODE_ENV=production && node ./dist/web.js" || docker container rm parabol -f
```

To stop the container, just open another terminal and enter `docker container stop parabol`

## **Manually trigger a cloud build**

PLACE HOLDER

## **Run docker image on GCR**

*Assumes redis, rethinkdb, and postgres already running) to have operational stack*

The commands below will start a Parabol container on the target tag specified in _DOCKER_TAG export. It will volume mount a .env in your current working directory to the container, so you can pass in any .env in your current working directory.

- Start GraphQL

```commandLine
export _DOCKER_TAG=vX.X.X

docker run --name=parabolgraphql --network=host -v $(pwd)/.env:/home/node/parabol/.env gcr.io/prbl-prod/parabol/parabol-ubi:${_DOCKER_TAG} /bin/bash -c "yarn db:migrate && yarn pg:migrate up && yarn postdeploy && NODE_ENV=production && node ./dist/gqlExecutor.js" || docker container rm parabolgraphql -f
```

- Start Web Server

```commandLine
export _DOCKER_TAG=vX.X.X

docker run --name=parabol --network=host -v $(pwd)/.env:/home/node/parabol/.env -p 3000:3000 gcr.io/prbl-prod/parabol/parabol-ubi:${_DOCKER_TAG} /bin/bash -c "yarn db:migrate && yarn pg:migrate up && yarn postdeploy && NODE_ENV=production && node ./dist/web.js" || docker container rm parabol -f
```

To stop the container, just open another terminal and enter `docker container stop parabol`
