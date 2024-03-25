### RethinkDB

RethinkDB is our legacy DB.
We are migrating all tables to [PostgresQL](../postgres/README.md)
We adopted it back in 2016 because it offered changefeeds, which made subscriptions easy.
Unfortunately, multi-table changefeeds did not scale well.
Thankfully, around 2017 GraphQL offered native subscriptions, which we adopted.
Around that same time, RethinkDB as a company went under, which meant updates ceased.
Since that time, RethinkDB has occassionally been unstable for us under high load.
Since our data is very relational, it made sense to move PostgresQL, which we are actively doing.

- Migrations are stored in [`packages/server/database/migrations`](./migrations/)
