## Usage of Docker in Different Envs

### Development

In development, docker handles all db services for us. This is done by calling `docker-compose` on the Compose file `./docker/dev.yml`. The web app itself is not containerized; it simply runs on the host machine by calling `yarn && yarn dev`

### Production

In production, dokku creates a Docker container using the [default Node.js heroku buildpack](https://dokku.com/docs~v0.5.1/deployment/buildpacks/). While it's possible to do so, we don't yet provide any [custom Dockerfile to dokku](https://dokku.com/docs~v0.5.1/deployment/dockerfiles/).

### Self-Hosted

Self-hosted instances may use the `docker-compose.yml` file in the root of the project directory. All services, including databases and the web app, will be containerized.

If the owner of the self-hosted instance wants to use local file storage (instead of cloud storage such as AWS or GCP) for user uploaded images, make sure `FILE_STORE_PROVIDER='local'` in the root `.env` file. Additionally, the app must be deployed using the following command:

`docker-compose -f docker-compose.yml -f ./docker/docker-compose.selfHosted.yml up -d`

This ensures that the images will be persisted in a Docker volume.
