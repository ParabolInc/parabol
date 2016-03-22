# How to migrate data

Action uses [rethink-migrate](https://github.com/JohanObrink/rethink-migrate)
to manage database migrations.

As rethinkdb is a schema-less NoSQL store, our migrations typically do
very little. Often, we only use migrations to create tables and instead
rely on the [thinky](https://github.com/neumino/thinky) ORM for managing
our schema at runtime.

## Migrating Upward

To catch up to the current database schema, run:

`$ npm run migrate`

## Create

To create a new migration:

`$ ./node_modules/.bin/rethink-migrate create -r ./api/models create-user-cache`
