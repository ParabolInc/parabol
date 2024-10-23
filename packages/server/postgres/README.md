# PostgreSQL

## Migrations

Migrations are managed by Kysely, and on the CLI by [Kysely-CTL](https://github.com/kysely-org/kysely-ctl).
Kysely-CTL keeps the same API as Knex, so if the docs are not great, you can use the knex migration docs, too.
There are 3 ways migrations are triggered:

- Manually, calling `yarn kysely migrate:latest`, `yarn kysely migrate:up`, or `yarn kysely migrate:down`
- After the app is built, calling `yarn predeploy` (this is run in prod, where the /migrations dir does not exist)
- In dev, calling `yarn dev`, which uses PM2 to call `yarn kysely migrate:latest`

To create a new migration run `yarn kysely migrate:make NAME`

### Queries

- [Queries](./queries/README.md)

### SSL

1. Pick a directory on the local filesystem to store the keys. Store the absolute path in the env var `POSTGRES_SSL_DIR`
2. Add `root.crt` (CA), `postgresql.key`, and `postgresql.crt` to that directory.

### Gotchas

#### pgm vs. node-pg inside a migration

`pgm.db.query` isn't a true async function. It runs all migrations in parallel, queues up every query, and then executes those in serial.
This is generally fine if you only use `pgm`.
However, if you create 1 migration using `pgm` and a second migration using `pg.Client` then the 2nd migration will run before `pgm` finishes, causing it to fail.
What's more, if you call `pgm` to create a table and `pg.Client` to access that table, the table won't exist.
We learned this after about 10 migrations. As a band-aid, we use `pgm.noTransaction()` on migrations that caused errors.
Moving forward, we will only use `pg.Client`

#### Bulk inserts

Parameters are capped at 16-bit, so if you're doing a bulk insert, you'll need to break it up.
In other words, if `# rows * columns per row > 65,535` you need to do it in batches.
`pg-protocol` shows this here: <https://github.com/brianc/node-postgres/blob/master/packages/pg-protocol/src/serializer.ts#L155>
Issue here: <https://github.com/brianc/node-postgres/issues/581>
