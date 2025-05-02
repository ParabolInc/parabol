# PostgreSQL

## Migrations

Migrations are managed by Kysely, and on the CLI by [Kysely-CTL](https://github.com/kysely-org/kysely-ctl).
Kysely-CTL keeps the same API as Knex, so if the docs are not great, you can use the knex migration docs, too.
There are 3 ways migrations are triggered:

- Manually, calling `pnpm kysely migrate:latest`, `pnpm kysely migrate:up`, or `pnpm kysely migrate:down`
- After the app is built, calling `pnpm predeploy` (this is run in prod, where the /migrations dir does not exist)
- In dev, calling `pnpm dev`, which uses PM2 to call `pnpm kysely migrate:latest`

To create a new migration run `pnpm kysely migrate:make NAME`

### Rebasing Migrations

Rebasing migrations means deleting all the migrations in /migrations and starting fresh.
It is time to rebase migrations when one of the following is true:

- a migration has a dependency that you want to remove from the project
- there are too many migrations and they're slowing down CI/CD

To rebase:

1. create a new DB in postgres & change it in the .env, e.g. `POSTGRES_DB='init1'`.
2. run `pnpm kysely migrate:latest` to build it
3. goto pgadmin, right click the database and click backup

- General Tab
  - Filename: init.sql
  - Encoding: UTF8
- Data Options
  - Sections: Pre-data, Data, Post-data
  - Do not save: Owner
- Query Options
  - Use Insert Commands
  - On conflict do nothing to INSERT command
- Table options
  - Exclude Patterns: Tables: `_*` (excludes `_migration`, `_migrationLock`)

4. `pnpm kysely migrate:make init` to create a new initial migration
5. Copy the contents of the old `_init.ts` migration to the new file you just created & just replace the SQL.
   At the beginning of the file, update the old `migrationTableName` so we delete the old migration table
6. Delete all old migrations
7. Increment the table version number in `kyselyMigrations.ts` for `migrationTableName`, e.g. `_migrationV3`

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
