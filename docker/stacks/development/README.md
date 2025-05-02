# Development stack

> ⚠️ **Parabol does not provide any support on this stack**. Use it under your own resposibility.

## General notes

- **This stack is not meant for production use.** It is our development stack and can change at any moment, have errors and incorporate and remove components we are testing without any notice.
- This stack is designed to be managed using `pnpm db:start` and `pnpm db:stop` to start the databases. The application can use it, starting with either `pnpm dev` or building the application and using `pnpm start`.

## Components

- **Datadog agent:** additional configuration can be added in the folder `datadog/dd-conf.d`.
- **Postgres:** container built from a Dockerfile in [docker/images/postgres](docker/images/postgres), that incorporates some extra extensions used by the application. Exposed through port 5432 and with the data mounted in a volume postgres-data.
- **PGAdmin:** available on 5050 with credentials on the `.env` file. Connect using the values of `PGADMIN_DEFAULT_EMAIL` and `PGADMIN_DEFAULT_PASSWORD` from the `.env`. Data mounted on a volume pgadmin-data.
- **Redis:** available on 6379 with the data mounted on a volume redis-data.
- **Redis Commander:** available on 8081.
- **Text Embedding Inference:** toolkit to deploy and serve open source text embeddings and sequence classification models. Exposed on 3040. More information in [their Github](https://github.com/huggingface/text-embeddings-inference).

### Configue PGAdmin

- pgadmin is at [http://localhost:5050](http://localhost:5050)
- Connect using the values of `PGADMIN_DEFAULT_EMAIL` and `PGADMIN_DEFAULT_PASSWORD` from your `.env`
- Click **Add New Server** and fill out the forms with your `.env` values

  - General.name = POSTGRES_DB
  - Connection.host = 'postgres' (hardcoded from docker-compose dev.yml, not from .env!)
  - Connection.username = POSTGRES_USER
  - Connection.password = POSTGRES_PASSWORD
  - Connection.maintenanceDatabase = POSTGRES_DB
  - Connection.port = POSTGRES_PORT

### Postgres

#### Too many connections

Sometimes pg pool will hit its connection limit. This should never happen in prod, but happens on occassion in dev.
You'll know it's happening because PG will say there are too many connections.
To fix, you can run the following SQL to remove all the connections except the one that is running the script

```sql
select pg_terminate_backend(pid) from pg_stat_activity where datname='parabol-saas' AND pid <> pg_backend_pid();
```
