# Migrations

This folder contains all the postgres migrations that have been run on the database.
If your migration also requires a connection to RethinkDB, you can do that here, too.
If you choose to use a generated SQL statement in your migration, you'll get a `Client` from `pg` instead of using the provided `pgm`


## Gotchas

`pgm.db.query` isn't a true async function. It runs all migrations in parallel, queues up every query, and then executes those in serial.
This is generally fine if you only use `pgm`.
However, if you create 1 migration using `pgm` and a second migration using `pg.Client` then the 2nd migration will run before `pgm` finishes, causing it to fail.
For this reason, I generally prefer `pg.Client`, but that requires a little extra boilerplate (you must manually call `client.connect` and `client.end`)
