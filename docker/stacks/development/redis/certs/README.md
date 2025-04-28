## Certs

This directory is the preferred place for TLS certs.
The certs that are checked into version control are self-signed and safe to share.

### Env Vars

All env vars should correspond with the vars in the redis instance.

In development, that means:

- In the `docker/stacks/development/docker-compose.yml`, add a volume: `bitnami-redis-data: {}`
- In the `docker/stacks/development/docker-compose.yml`, replace the Redis container sections with the following:

  ```yaml
  image: bitnami/redis:7.0-debian-11
  environment:
    - ALLOW_EMPTY_PASSWORD=yes
    - REDIS_PASSWORD=''
    - REDIS_TLS_ENABLED=no
    - REDIS_TLS_AUTH_CLIENTS=no
    - REDIS_TLS_CERT_FILE=/opt/bitnami/redis/certs/redis.crt
    - REDIS_TLS_KEY_FILE=/opt/bitnami/redis/certs/redis.key
    - REDIS_TLS_CA_FILE=/opt/bitnami/redis/certs/redisCA.crt
  volumes:
    - bitnami-redis-data:/bitnami/redis/data
    - ../certs:/opt/bitnami/redis/certs
  ```

- Vars in .env should match the vars in `docker/stacks/development/docker-compose.yml`

Any changes to `docker/stacks/development/docker-compose.yml` require running `pnpm db:start`

REDIS_PASSWORD: Use this if you'd like our app to connect to redis using a password
REDIS_TLS_CERT_FILE: The cert file used to authorize clients. Not available in GCP
REDIS_TLS_KEY_FILE: The key file used to authorize clients. Not available in GCP
REDIS_TLS_CA_FILE: The CA file that proves our redis instance is who it says it is
REDIS_TLS_REJECT_UNAUTHORIZED: Set to false if you're using a self-signed CA file
