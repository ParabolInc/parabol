# PostGreSQL

## Migrations

This folder contains all the postgres migrations that have been run on the database.
If your migration also requires a connection to RethinkDB, you can do that here, too.
If you choose to use a generated SQL statement in your migration, you'll get a `Client` from `pg` instead of using the provided `pgm`


### Gotchas

#### pgm vs. node-pg inside a migration

`pgm.db.query` isn't a true async function. It runs all migrations in parallel, queues up every query, and then executes those in serial.
This is generally fine if you only use `pgm`.
However, if you create 1 migration using `pgm` and a second migration using `pg.Client` then the 2nd migration will run before `pgm` finishes, causing it to fail.
For this reason, I generally prefer `pg.Client`, but that requires a little extra boilerplate (you must manually call `client.connect` and `client.end`)

#### Bulk inserts

Parameters are capped at 16-bit, so if you're doing a bulk insert, you'll need to break it up.
In other words, if `# rows * columns per row > 65,535` you need to do it in batches.
`pg-protocol` shows this here: https://github.com/brianc/node-postgres/blob/master/packages/pg-protocol/src/serializer.ts#L155
Issue here: https://github.com/brianc/node-postgres/issues/581
