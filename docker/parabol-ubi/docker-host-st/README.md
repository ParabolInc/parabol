# Docker Host Single Tenant (ST)

To run the Parabol UBI in single tenant mode (e.g. simple docker-compose on a docker host).

1. Build your Parabol UBI using instructions in `docker/ubi/docker-build/README.md`
2. Create a working `.env` from `.env.example`
3. Update docker-compose.yaml `image: #image:tag` with your built image tag from `step (1.)`
4. Run `docker-compose up -d` to deploy the local stack. You can run `docker-compose down` to terminate the local stack
5. Check logs via command `docker logs <name>-app-1` and wait for the following output to appear

```shell
🔥🔥🔥 Server ID: 0. Ready for Sockets: Port 3000 🔥🔥🔥
💧💧💧 Server ID: 0. Ready for GraphQL Execution 💧💧💧
💧💧💧 Server ID: 01. Ready for GraphQL Execution 💧💧💧
```

## Upgrade Parabol version

1. Edit the `docker-compose.yaml` and change the `#image:tag` changing the tag. Ex: from `v7.15.0` to `v7.15.2`.
2. (optional) Run `docker compose logs -f` to follow the upgrade.
3. Run `docker compose up -d`. It will start the `pre-deploy` and, once it is done successfully, then it will stop and recreate the `web-server` and `gql-executor` with the new version of the image. **This step implies a downtime**.
4. Verify the application is still up and running.
