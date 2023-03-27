# PostgreSQL

## Setup

- pgadmin is at [http://localhost:5050](http://localhost:5050)
- Connect using the values of `PGADMIN_DEFAULT_EMAIL` and `PGADMIN_DEFAULT_PASSWORD` from your `.env`
- Click "Add New Server" and fill out the forms with your `.env` values

  - General.name = POSTGRES_DB
  - Connection.host = 'postgres' (hardcoded from docker-compose dev.yml, not from .env!)
  - Connection.username = POSTGRES_USER
  - Connection.password = POSTGRES_PASSWORD
  - Connection.maintenanceDatabase = POSTGRES_DB
  - Connection.port = POSTGRES_PORT

## Migrations

This folder contains all the postgres migrations that have been run on the database.
If your migration also requires a connection to RethinkDB, you can do that here, too.
The recommended way to write a migration is to call `yarn pg:migrate create NAME`
We no longer use pgm because we want every migration to run independently.
In other words, migration 3 should have a guarantee that migration 2 has already run. PGM doesn't do this.

## Migrating RethinkDB to PG (Massive Inserts)
To perform massive inserts, like migrating RethinkDB tables to PG, we use pg-promise, which offers a [simple pattern](https://github.com/vitaly-t/pg-promise/wiki/Data-Imports#massive-inserts).

Since most tables can't be read into the memory of our NodeJS container, we have to paginate the data.
The easiest way to do that is indexing on `updatedAt` in RethinkDB and paginating on that field.
This is also beneficial because any updates that happen during the migration will end up on the last page.
Note that is requires every write to the RethinkDB table to update the `updatedAt` field!

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
