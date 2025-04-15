# Docker Host Single Tenant (ST)

To run Parabol in single tenant mode (e.g. simple docker-compose on a docker host):

1. Build your Parabol UBI using instructions in `docker/images/parabol-ubi/README.md`
2. Create a working `.env` from `.env.example`
3. Update docker-compose.yaml `image: #image:tag` with your built image tag from `step (1.)`
4. Run `docker compose --profile databases --profile parabol up -d` to deploy the local stack. You can run `docker compose --profile databases --profile parabol down` to terminate the local stack
5. Check logs via command `docker logs <name> -f` and wait for the following output to appear

```shell
🔥🔥🔥 Server ID: 0. Ready for Sockets: Port 3000 🔥🔥🔥
💧💧💧 Server ID: 0. Ready for GraphQL Execution 💧💧💧
💧💧💧 Server ID: 01. Ready for GraphQL Execution 💧💧💧
```

## Upgrade Parabol version

1. Edit the `docker-compose.yaml` and change the `#image:tag` changing the tag. Ex: from `v7.15.0` to `v7.15.2`.
2. (optional) In a different terminal, run `docker compose logs -f` to follow the upgrade.
3. Run `docker compose --profile parabol up -d`. It will start the `pre-deploy` and, once it is done successfully, then it will stop and recreate the `web-server` with the new version of the image. **This step implies a downtime**.
4. Verify the application is still up and running.

## Running Embedder

Embedder isn't started by default. If it needs to run, it must be managed using `docker compose --profile databases --profile parabol --profile embedder up`.

This will run `pre-deploy` and thus it will recreate the `web-server`.

The Embedder requires a model. It can be provided using the **Text Embeddings Inference** container available on the stack. It can be executed with `docker compose --profile databases --profile text-embeddings --profile parabol --profile embedder up`

## Database debug

Some tools are available to debug the databases is needed:

- [pgadmin](https://www.pgadmin.org/)
- [redis-commander](https://github.com/joeferner/redis-commander)

To operate them use `docker compose up --profile databases --profile database-debug`.

## Running the whole stack

- Start the whole stack: `docker compose --profile databases --profiles text-embeddings --profile parabol --profile database-debug --profile embedder -d`.
- Stop the stack: `docker compose --profile databases --profiles text-embeddings --profile parabol --profile database-debug --profile embedder down`.
